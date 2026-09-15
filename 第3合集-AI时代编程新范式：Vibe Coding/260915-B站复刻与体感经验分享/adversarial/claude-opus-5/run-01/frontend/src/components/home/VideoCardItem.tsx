import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import { syncVideoInteraction } from '../../api/sync';
import { Icon } from '../common/Icon';
import { formatCount, formatDuration, formatRelativeTime } from '../../utils/format';
import type { VideoCard } from '../../types';
import './VideoCardItem.css';

const MORE_ITEMS = ['不感兴趣', '不想看此 UP 主', '内容质量差', '引起不适'];

/** 首页信息流卡片：封面悬浮预览、稍后再看、更多菜单，点击进入播放页 */
export function VideoCardItem({ video, index = 0 }: { video: VideoCard; index?: number }) {
  const queryClient = useQueryClient();
  const [moreOpen, setMoreOpen] = useState(false);
  // 稍后再看的初始态来自服务端 DTO，列表刷新后与后端保持一致
  const [later, setLater] = useState(video.watchLater);
  const [toast, setToast] = useState('');

  useEffect(() => {
    setLater(video.watchLater);
  }, [video.watchLater]);

  const watchLater = useMutation({
    mutationFn: () => api.toggleAction(video.bvid, 'watchlater'),
    onSuccess: (data) => {
      setLater(data.active);
      setToast(data.active ? '已添加到稍后再看' : '已移出稍后再看');
      window.setTimeout(() => setToast(''), 1600);
      syncVideoInteraction(queryClient, video.bvid, { watchLater: data.active, stat: data.stat });
    },
  });

  return (
    <article className="video-card fade-in" style={{ animationDelay: `${Math.min(index, 12) * 18}ms` }}>
      {/* 封面区：链接与操作按钮是兄弟节点，避免 <button> 嵌在 <a> 里 */}
      <div className="video-card__cover">
        <Link className="video-card__cover-link" to={`/video/${video.bvid}`} aria-label={video.title}>
          <img src={video.cover} alt={video.title} loading="lazy" />
          <span className="video-card__mask" />
          <span className="video-card__stats">
            <span>
              <Icon name="play" size={13} /> {formatCount(video.stat.view)}
            </span>
            <span>
              <Icon name="danmaku" size={13} /> {formatCount(video.stat.danmaku)}
            </span>
          </span>
          <span className="video-card__duration">{formatDuration(video.duration)}</span>
        </Link>
        <button
          type="button"
          className={`video-card__later ${later ? 'is-active' : ''}`}
          title={later ? '已添加稍后再看，点击移出' : '稍后再看'}
          aria-pressed={later}
          disabled={watchLater.isPending}
          onClick={() => watchLater.mutate()}
        >
          <Icon name={later ? 'check' : 'clock'} size={16} />
        </button>
        {toast && <span className="video-card__toast">{toast}</span>}
      </div>

      <div className="video-card__info">
        <Link className="video-card__title text-clamp-2" to={`/video/${video.bvid}`} title={video.title}>
          {video.title}
        </Link>
        <div className="video-card__meta">
          <span className="video-card__up text-ellipsis">
            <Icon name="upload" size={13} />
            {video.owner.name}
          </span>
          <span className="video-card__dot">·</span>
          <span className="video-card__date">
            {formatCount(video.stat.view)}观看 · {formatRelativeTime(video.pubdate)}
          </span>
        </div>
        <span className="video-card__partition">{video.partitionName}</span>

        <div className="video-card__more">
          <button
            type="button"
            className="video-card__more-btn"
            aria-label="更多操作"
            onClick={() => setMoreOpen((v) => !v)}
            onBlur={() => window.setTimeout(() => setMoreOpen(false), 120)}
          >
            <Icon name="more" size={16} />
          </button>
          {moreOpen && (
            <ul className="video-card__more-menu fade-in">
              {MORE_ITEMS.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => {
                      setMoreOpen(false);
                      setToast('将减少此类内容推荐');
                      window.setTimeout(() => setToast(''), 1600);
                    }}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="video-card video-card--skeleton">
      <div className="skeleton video-card__skeleton-cover" />
      <div className="skeleton video-card__skeleton-line" />
      <div className="skeleton video-card__skeleton-line video-card__skeleton-line--short" />
    </div>
  );
}
