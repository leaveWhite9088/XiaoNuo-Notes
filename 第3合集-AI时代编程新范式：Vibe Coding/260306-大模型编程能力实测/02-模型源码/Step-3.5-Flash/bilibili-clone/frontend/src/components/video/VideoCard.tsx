import React from 'react';
import { Link } from 'react-router-dom';
import { VideoInfo } from '../../types';
import { Card } from '../common';

interface VideoCardProps {
  video: VideoInfo;
  size?: 'normal' | 'small';
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, size = 'normal' }) => {
  const formatNumber = (num: number): string => {
    if (num >= 100000) {
      return (num / 10000).toFixed(1) + '万';
    } else if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + '千';
    }
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const coverUrl = video.cover || 'https://via.placeholder.com/320x200?text=No+Cover';

  if (size === 'small') {
    return (
      <Card hoverable className="group">
        <Link to={`/video/${video.bvid}`}>
          <div className="relative">
            <img
              src={coverUrl}
              alt={video.title}
              className="w-full object-cover aspect-video"
            />
            <span className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
              {formatDuration(video.duration)}
            </span>
          </div>
          <div className="p-2">
            <h3 className="text-sm font-medium text-bili-text line-clamp-2 group-hover:text-bili-pink transition-colors">
              {video.title}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-bili-text-gray">
              <span>{formatNumber(video.stat.view)}播放</span>
              <span>{formatNumber(video.stat.danmaku)}弹幕</span>
            </div>
          </div>
        </Link>
      </Card>
    );
  }

  return (
    <Card hoverable className="group">
      <Link to={`/video/${video.bvid}`}>
        <div className="relative">
          <img
            src={coverUrl}
            alt={video.title}
            className="w-full object-cover aspect-video"
          />
          <span className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
            {formatDuration(video.duration)}
          </span>
          {video.videos > 1 && (
            <span className="absolute top-1 left-1 bg-bili-pink text-white text-xs px-1.5 py-0.5 rounded">
              合集
            </span>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-bili-text line-clamp-2 group-hover:text-bili-pink transition-colors">
            {video.title}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <img
              src={video.owner.face || '/default-avatar.png'}
              alt={video.owner.name}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-sm text-bili-text-gray truncate">{video.owner.name}</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-bili-text-gray">
            <span>{formatNumber(video.stat.view)}播放</span>
            <span>{formatNumber(video.stat.danmaku)}弹幕</span>
            <span>{formatNumber(video.stat.reply)}评论</span>
          </div>
        </div>
      </Link>
    </Card>
  );
};