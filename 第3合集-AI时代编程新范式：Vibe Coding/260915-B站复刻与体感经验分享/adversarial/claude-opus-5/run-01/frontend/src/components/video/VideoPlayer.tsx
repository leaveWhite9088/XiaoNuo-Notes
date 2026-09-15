import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '../common/Icon';
import { DanmakuLayer } from './DanmakuLayer';
import { formatDuration } from '../../utils/format';
import type { Danmaku } from '../../types';
import './VideoPlayer.css';

const SPEEDS = [2, 1.5, 1.25, 1, 0.75, 0.5];

interface VideoPlayerProps {
  src: string;
  poster: string;
  title: string;
  danmaku: Danmaku[];
  onProgress?: (currentTime: number) => void;
}

/** 自绘播放器：进度条 / 音量 / 倍速 / 弹幕开关 / 全屏，外加弹幕层 */
export function VideoPlayer({ src, poster, title, danmaku, onProgress }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(0.6);
  const [muted, setMuted] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [danmakuOn, setDanmakuOn] = useState(true);
  const [danmakuOpacity, setDanmakuOpacity] = useState(0.9);
  const [pending, setPending] = useState<Danmaku[]>([]);
  const [input, setInput] = useState('');
  const [fullscreen, setFullscreen] = useState(false);

  // 换视频时重置播放态并自动续播（静音自动播放，浏览器允许）
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setCurrent(0);
    setPlaying(false);
    video.load();
    const timer = window.setTimeout(() => {
      video.play().catch(() => undefined);
    }, 60);
    return () => window.clearTimeout(timer);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = muted;
    video.playbackRate = speed;
  }, [volume, muted, speed]);

  useEffect(() => {
    const onFsChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => undefined);
    else video.pause();
  }, []);

  const seek = (event: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    video.currentTime = ratio * duration;
    setCurrent(video.currentTime);
  };

  const sendDanmaku = () => {
    const text = input.trim();
    if (!text) return;
    setPending([
      {
        id: `self-${Date.now()}`,
        time: current,
        mode: 'scroll',
        color: '#ffffff',
        text,
      },
    ]);
    setInput('');
  };

  const progress = duration ? (current / duration) * 100 : 0;

  return (
    <div className="player">
      <div className={`player__shell ${fullscreen ? 'is-fullscreen' : ''}`} ref={shellRef}>
        <video
          ref={videoRef}
          className="player__video"
          poster={poster}
          playsInline
          autoPlay
          muted
          preload="metadata"
          onClick={togglePlay}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration || 0)}
          onTimeUpdate={(e) => {
            setCurrent(e.currentTarget.currentTime);
            onProgress?.(e.currentTarget.currentTime);
            const ranges = e.currentTarget.buffered;
            if (ranges.length) setBuffered(ranges.end(ranges.length - 1));
          }}
          onEnded={() => setPlaying(false)}
        >
          <source src={src} type="video/mp4" />
          你的浏览器不支持 HTML5 视频播放。
        </video>

        <DanmakuLayer
          danmaku={danmaku}
          videoRef={videoRef}
          enabled={danmakuOn}
          opacity={danmakuOpacity}
          pending={pending}
          onConsumePending={() => setPending([])}
        />

        {!playing && (
          <button className="player__big-play" onClick={togglePlay} aria-label="播放">
            <Icon name="play" size={34} />
          </button>
        )}

        <div className="player__controls">
          <div className="player__progress" onClick={seek} role="slider" aria-label="进度" aria-valuenow={Math.round(progress)}>
            <span className="player__progress-buffered" style={{ width: `${duration ? (buffered / duration) * 100 : 0}%` }} />
            <span className="player__progress-played" style={{ width: `${progress}%` }}>
              <i className="player__progress-dot" />
            </span>
          </div>

          <div className="player__bar">
            <button className="player__btn" onClick={togglePlay} aria-label={playing ? '暂停' : '播放'}>
              <Icon name={playing ? 'pause' : 'play'} size={20} />
            </button>

            <span className="player__time">
              {formatDuration(current)} / {formatDuration(duration)}
            </span>

            <div className="player__volume">
              <button
                className="player__btn"
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? '取消静音' : '静音'}
              >
                <Icon name={muted || volume === 0 ? 'mute' : 'volume'} size={19} />
              </button>
              <input
                className="player__volume-slider"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                aria-label="音量"
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setVolume(v);
                  setMuted(v === 0);
                }}
              />
            </div>

            <div className="player__spacer" />

            <button
              className={`player__btn player__btn--text ${danmakuOn ? '' : 'is-off'}`}
              onClick={() => setDanmakuOn((v) => !v)}
              title="弹幕开关"
            >
              <Icon name="danmaku" size={18} />
              <span>{danmakuOn ? '弹幕开' : '弹幕关'}</span>
            </button>

            <label className="player__opacity" title="弹幕不透明度">
              <input
                type="range"
                min={0.2}
                max={1}
                step={0.1}
                value={danmakuOpacity}
                aria-label="弹幕不透明度"
                onChange={(e) => setDanmakuOpacity(Number(e.target.value))}
              />
            </label>

            <div className="player__speed">
              <button className="player__btn player__btn--text" onClick={() => setSpeedOpen((v) => !v)}>
                {speed === 1 ? '倍速' : `${speed}x`}
              </button>
              {speedOpen && (
                <ul className="player__speed-menu fade-in">
                  {SPEEDS.map((s) => (
                    <li key={s}>
                      <button
                        className={s === speed ? 'is-active' : ''}
                        onClick={() => {
                          setSpeed(s);
                          setSpeedOpen(false);
                        }}
                      >
                        {s === 1 ? '正常' : `${s}x`}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              className="player__btn"
              aria-label="全屏"
              onClick={() => {
                if (document.fullscreenElement) document.exitFullscreen();
                else shellRef.current?.requestFullscreen?.();
              }}
            >
              <Icon name="fullscreen" size={19} />
            </button>
          </div>
        </div>
      </div>

      <div className="player__danmaku-bar">
        <span className="player__danmaku-count">
          <Icon name="danmaku" size={14} /> {danmaku.length} 条弹幕
        </span>
        <input
          className="player__danmaku-input"
          placeholder={`发一条友善的弹幕见证「${title.slice(0, 12)}」`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendDanmaku()}
        />
        <button className="player__danmaku-send" onClick={sendDanmaku}>
          发送
        </button>
      </div>
    </div>
  );
}
