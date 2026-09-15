/**
 * 播放器：真实 <video> 播放 + 自研控制条 + 弹幕层。
 * 支持：播放/暂停、进度拖拽、音量、倍速、弹幕开关、宽屏、全屏、发送弹幕。
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '../common/Icon';
import { useDanmakuEngine } from '../../hooks/useDanmakuEngine';
import { formatDuration } from '../../utils/format';
import type { DanmakuItem } from '../../types';
import './player.css';

interface Props {
  src: string;
  poster: string;
  danmaku: DanmakuItem[];
  wide: boolean;
  onToggleWide: () => void;
  onSendDanmaku: (text: string, progress: number) => Promise<DanmakuItem | null>;
}

const SPEEDS = [2, 1.5, 1.25, 1, 0.75, 0.5];

export function VideoPlayer({ src, poster, danmaku, wide, onToggleWide, onSendDanmaku }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | undefined>(undefined);

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [speed, setSpeed] = useState(1);
  const [danmakuOn, setDanmakuOn] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [draft, setDraft] = useState('');
  const [danmakuColor, setDanmakuColor] = useState('#ffffff');

  const { active, remove, emit } = useDanmakuEngine(videoRef, danmaku, danmakuOn);

  /* ----------------------------- 播放控制 ----------------------------- */

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => undefined);
    else video.pause();
  }, []);

  // 换稿件时自动从头播放（静音自动播放，浏览器策略允许）
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => setPlaying(false));
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = muted;
  }, [volume, muted]);

  useEffect(() => {
    const onFsChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // 空格播放/暂停、左右方向键快进快退
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      const video = videoRef.current;
      if (!video) return;
      if (event.code === 'Space') {
        event.preventDefault();
        togglePlay();
      }
      if (event.code === 'ArrowRight') video.currentTime = Math.min(video.duration, video.currentTime + 5);
      if (event.code === 'ArrowLeft') video.currentTime = Math.max(0, video.currentTime - 5);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay]);

  const showControls = () => {
    setControlsVisible(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setControlsVisible(false), 2600);
  };

  /* ----------------------------- 进度控制 ----------------------------- */

  const seekTo = (clientX: number) => {
    const bar = progressRef.current;
    const video = videoRef.current;
    if (!bar || !video || !video.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    video.currentTime = ratio * video.duration;
    setCurrent(video.currentTime);
  };

  const onProgressDown = (event: React.MouseEvent) => {
    seekTo(event.clientX);
    const onMove = (e: MouseEvent) => seekTo(e.clientX);
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  /* ----------------------------- 发送弹幕 ----------------------------- */

  const send = async () => {
    const text = draft.trim();
    const video = videoRef.current;
    if (!text || !video) return;
    const progress = video.duration ? video.currentTime / video.duration : 0;
    setDraft('');
    const item = await onSendDanmaku(text, progress);
    emit(
      item ?? {
        id: `local-${Date.now()}`,
        p: progress,
        time: Math.floor(video.currentTime),
        text,
        color: danmakuColor,
        mode: 'scroll',
        fontSize: 25,
        self: true,
      },
    );
  };

  const progressPercent = duration ? (current / duration) * 100 : 0;

  return (
    <div
      className={`player ${controlsVisible || !playing ? 'show-controls' : ''} ${
        fullscreen ? 'is-fullscreen' : ''
      }`}
      ref={shellRef}
      onMouseMove={showControls}
      onMouseLeave={() => playing && setControlsVisible(false)}
    >
      <div className="player__stage" onClick={togglePlay} onDoubleClick={() => toggleFullscreen(shellRef, fullscreen)}>
        <video
          ref={videoRef}
          className="player__video"
          src={src}
          poster={poster}
          loop
          playsInline
          muted={muted}
          preload="auto"
          onPlay={() => {
            setPlaying(true);
            showControls();
          }}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onProgress={(e) => {
            const v = e.currentTarget;
            if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1));
          }}
        />

        {/* 弹幕层 */}
        <div className={`player__danmaku ${danmakuOn ? '' : 'is-off'}`}>
          {active.map((item) => (
            <span
              key={item.key}
              className={`danmaku danmaku--${item.mode} ${item.self ? 'is-self' : ''}`}
              style={{
                top: `${item.lane * 9 + 2}%`,
                color: item.color,
                fontSize: item.fontSize > 25 ? 23 : 19,
                animationPlayState: playing ? 'running' : 'paused',
              }}
              onAnimationEnd={() => remove(item.key)}
            >
              {item.text}
            </span>
          ))}
        </div>

        {!playing && (
          <button className="player__big-play" onClick={togglePlay} title="播放">
            <Icon name="play" size={30} />
          </button>
        )}

        {muted && (
          <button
            className="player__unmute"
            onClick={(e) => {
              e.stopPropagation();
              setMuted(false);
            }}
          >
            <Icon name="mute" size={14} /> 已静音播放，点击开启声音
          </button>
        )}
      </div>

      <div className="player__controls" onClick={(e) => e.stopPropagation()}>
        <div className="player__progress" ref={progressRef} onMouseDown={onProgressDown}>
          <div className="player__progress-bg" />
          <div
            className="player__progress-buffer"
            style={{ width: duration ? `${(buffered / duration) * 100}%` : '0%' }}
          />
          <div className="player__progress-played" style={{ width: `${progressPercent}%` }}>
            <span className="player__progress-thumb" />
          </div>
        </div>

        <div className="player__bar">
          <button className="player__btn" onClick={togglePlay} title={playing ? '暂停' : '播放'}>
            <Icon name={playing ? 'pause' : 'play'} size={20} />
          </button>
          <span className="player__time">
            {formatDuration(current)} / {formatDuration(duration)}
          </span>

          <div className="player__danmaku-input">
            <button
              className="player__color"
              style={{ background: danmakuColor }}
              title="弹幕颜色"
              onClick={() =>
                setDanmakuColor((prev) => {
                  const colors = ['#ffffff', '#ff7f24', '#66ccff', '#7ac943', '#ffd700'];
                  return colors[(colors.indexOf(prev) + 1) % colors.length];
                })
              }
            />
            <input
              value={draft}
              placeholder="发个友善的弹幕见证当下"
              maxLength={40}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void send();
              }}
            />
            <button className="player__send" onClick={() => void send()}>
              发送
            </button>
          </div>

          <div className="player__right">
            <button
              className={`player__btn ${danmakuOn ? '' : 'is-off'}`}
              title={danmakuOn ? '关闭弹幕' : '开启弹幕'}
              onClick={() => setDanmakuOn((v) => !v)}
            >
              <Icon name="danmaku" size={20} />
            </button>

            <div className="player__pop player__pop--volume">
              <button
                className="player__btn"
                title="音量"
                onClick={() => setMuted((v) => !v)}
              >
                <Icon name={muted || volume === 0 ? 'mute' : 'volume'} size={20} />
              </button>
              <div className="player__pop-body">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    setMuted(Number(e.target.value) === 0);
                  }}
                />
              </div>
            </div>

            <div className="player__pop player__pop--speed">
              <button className="player__btn player__btn--text" title="倍速">
                {speed === 1 ? '倍速' : `${speed}x`}
              </button>
              <div className="player__pop-body">
                {SPEEDS.map((value) => (
                  <button
                    key={value}
                    className={speed === value ? 'is-active' : ''}
                    onClick={() => setSpeed(value)}
                  >
                    {value === 1 ? '1.0x' : `${value}x`}
                  </button>
                ))}
              </div>
            </div>

            <button
              className={`player__btn ${wide ? 'is-active' : ''}`}
              title="宽屏"
              onClick={onToggleWide}
            >
              <Icon name="wide" size={20} />
            </button>
            <button
              className="player__btn"
              title="全屏"
              onClick={() => toggleFullscreen(shellRef, fullscreen)}
            >
              <Icon name="fullscreen" size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function toggleFullscreen(ref: React.RefObject<HTMLElement>, isFullscreen: boolean) {
  if (isFullscreen) void document.exitFullscreen();
  else void ref.current?.requestFullscreen().catch(() => undefined);
}
