import { VideoCardItem, VideoCardSkeleton } from './VideoCardItem';
import type { VideoCard } from '../../types';
import './VideoGrid.css';

interface VideoGridProps {
  videos: VideoCard[];
  loading?: boolean;
  skeletonCount?: number;
  emptyText?: string;
}

export function VideoGrid({ videos, loading, skeletonCount = 10, emptyText }: VideoGridProps) {
  if (!loading && videos.length === 0) {
    return <div className="video-grid__empty">{emptyText ?? '这里空空如也'}</div>;
  }

  return (
    <div className="video-grid">
      {videos.map((v, i) => (
        <VideoCardItem key={v.bvid} video={v} index={i} />
      ))}
      {loading &&
        Array.from({ length: skeletonCount }, (_, i) => <VideoCardSkeleton key={`sk-${i}`} />)}
    </div>
  );
}
