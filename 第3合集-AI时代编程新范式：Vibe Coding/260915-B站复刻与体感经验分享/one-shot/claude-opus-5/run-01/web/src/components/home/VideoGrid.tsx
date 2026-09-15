/** 响应式视频网格：列数随视口宽度在 2~6 列之间变化（与 B 站首页一致的自适应策略）。 */
import type { ReactNode } from 'react';
import { VideoCard, VideoCardSkeleton } from './VideoCard';
import type { VideoCardData } from '../../types';
import './video-grid.css';

interface Props {
  videos: VideoCardData[];
  leading?: ReactNode;
  loading?: boolean;
  skeletonCount?: number;
  showChannel?: boolean;
}

export function VideoGrid({
  videos,
  leading,
  loading = false,
  skeletonCount = 10,
  showChannel = false,
}: Props) {
  return (
    <div className="video-grid">
      {leading}
      {videos.map((video) => (
        <VideoCard key={video.bvid} video={video} showChannel={showChannel} />
      ))}
      {loading &&
        Array.from({ length: skeletonCount }).map((_, i) => <VideoCardSkeleton key={`sk-${i}`} />)}
    </div>
  );
}
