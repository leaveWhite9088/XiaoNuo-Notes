import { useEffect, useRef, useState } from 'react';
import { Slider, Button, Space, Tooltip } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  SoundOutlined,
  FullscreenOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { formatDuration } from '../utils/format';
import { DanmakuLayer } from './DanmakuLayer';
import type { Danmaku } from '../types';

interface VideoPlayerProps {
  videoUrl: string;
  poster?: string;
  danmakus?: Danmaku[];
}

export const VideoPlayer = ({ videoUrl, poster, danmakus = [] }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showDanmaku, setShowDanmaku] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setLoading(false);
    };
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolumeChange = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    setVolume(value);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        background: '#000',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        onClick={togglePlay}
        crossOrigin="anonymous"
      />

      {showDanmaku && (
        <DanmakuLayer danmakus={danmakus} currentTime={currentTime} isPlaying={isPlaying} />
      )}

      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff',
            fontSize: 16,
          }}
        >
          加载中...
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px 16px 12px',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          opacity: isPlaying ? 0 : 1,
          transition: 'opacity 0.3s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => isPlaying && (e.currentTarget.style.opacity = '0')}
      >
        <Slider
          value={currentTime}
          max={duration || 100}
          onChange={handleSeek}
          tooltip={{ formatter: (value) => formatDuration(value || 0) }}
          style={{ marginBottom: 8 }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space size={16}>
            <Button
              type="text"
              icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={togglePlay}
              style={{ color: '#fff', fontSize: 28, padding: 0, height: 'auto' }}
            />
            <span style={{ color: '#fff', fontSize: 13 }}>
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
            <Tooltip title={`音量: ${Math.round(volume * 100)}%`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SoundOutlined style={{ color: '#fff', fontSize: 18 }} />
                <Slider
                  value={volume}
                  max={1}
                  step={0.1}
                  onChange={handleVolumeChange}
                  style={{ width: 80 }}
                />
              </div>
            </Tooltip>
          </Space>

          <Space size={16}>
            <Button
              type="text"
              onClick={() => setShowDanmaku(!showDanmaku)}
              style={{
                color: showDanmaku ? '#00AEEC' : '#fff',
                fontSize: 14,
                padding: '4px 12px',
                background: showDanmaku ? 'rgba(0,174,236,0.2)' : 'transparent',
                borderRadius: 4,
              }}
            >
              弹幕
            </Button>
            <SettingOutlined style={{ color: '#fff', fontSize: 20, cursor: 'pointer' }} />
            <FullscreenOutlined style={{ color: '#fff', fontSize: 20, cursor: 'pointer' }} />
          </Space>
        </div>
      </div>
    </div>
  );
};
