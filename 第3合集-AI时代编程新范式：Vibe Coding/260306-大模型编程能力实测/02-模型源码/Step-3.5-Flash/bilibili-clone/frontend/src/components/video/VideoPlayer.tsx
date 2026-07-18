import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  src: string;
  cid: number;
  title?: string;
  poster?: string;
  className?: string;
  onTimeUpdate?: (time: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  cid,
  title,
  poster,
  className = '',
  onTimeUpdate
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<videojs.Player | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      poster,
      fluid: true,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      sources: [{ src, type: 'video/mp4' }],
    });

    playerRef.current = player;

    player.on('ready', () => {
      setIsReady(true);
    });

    player.on('timeupdate', () => {
      if (onTimeUpdate) {
        onTimeUpdate(player.currentTime());
      }
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, cid, poster, onTimeUpdate]);

  useEffect(() => {
    if (playerRef.current && src) {
      playerRef.current.src({ src, type: 'video/mp4' });
    }
  }, [src]);

  return (
    <div className={`video-player-wrapper ${className}`}>
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered"
          playsInline
        >
          <p className="vjs-no-js">
            To view this video please enable JavaScript, and consider upgrading to a
            web browser that supports HTML5 video
          </p>
        </video>
      </div>
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white">加载中...</div>
        </div>
      )}
    </div>
  );
};