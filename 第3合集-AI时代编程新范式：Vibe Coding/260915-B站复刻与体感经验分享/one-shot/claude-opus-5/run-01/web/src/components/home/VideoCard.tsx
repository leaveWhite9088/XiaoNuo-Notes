/**
 * 信息流视频卡片。
 * hover 行为：封面轻微放大 + 延时自动播放静音预览 + 出现「稍后再看」「更多」按钮，
 * 与 B 站首页卡片一致。
 */
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { formatCount, formatDuration, formatRelativeTime } from '../../utils/format';
import type { VideoCardData } from '../../types';
import './video-card.css';

interface Props {
  video: VideoCardData;
  /** 是否展示分区角标（搜索结果页用） */
  showChannel?: boolean;
}

const PREVIEW_DELAY = 700;

export function VideoCard({ video, showChannel = false }: Props) {
  const [preview, setPreview] = useState(false);
  const [toast, setToast] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const videoRef = useRef<HTMLVideoElement>(null);

  const onEnter = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setPreview(true);
      videoRef.current?.play().catch(() => undefined);
    }, PREVIEW_DELAY);
  };

  const onLeave = () => {
    window.clearTimeout(timer.current);
    setPreview(false);
    setMenuOpen(false);
    const el = videoRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  };

  const flash = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(''), 1400);
  };

  return (
    <article className="video-card" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <Link className="video-card__cover" to={`/video/${video.bvid}`}>
        <img src={video.cover} alt={video.title} loading="lazy" />
        <video
          ref={videoRef}
          className={`video-card__preview ${preview ? 'is-playing' : ''}`}
          src={video.previewUrl}
          muted
          loop
          playsInline
          preload="none"
        />
        <span className="video-card__mask" />
        <div className="video-card__stats">
          <span>
            <Icon name="view" size={13} /> {formatCount(video.stats.view)}
          </span>
          <span>
            <Icon name="danmaku" size={13} /> {formatCount(video.stats.danmaku)}
          </span>
        </div>
        <span className="video-card__duration">{formatDuration(video.duration)}</span>
        {showChannel && <span className="video-card__channel">{video.channelName}</span>}
        <button
          className="video-card__later"
          title="稍后再看"
          onClick={(e) => {
            e.preventDefault();
            flash('已添加至稍后再看');
          }}
        >
          <Icon name="watch-later" size={16} />
        </button>
        {toast && <span className="video-card__toast">{toast}</span>}
      </Link>

      <div className="video-card__info">
        <Link className="video-card__title text-clamp-2" to={`/video/${video.bvid}`} title={video.title}>
          {video.title}
        </Link>
        <div className="video-card__meta">
          <span className="video-card__up text-ellipsis">
            <Icon name="up" size={14} className="video-card__up-icon" />
            {video.up.name}
          </span>
          <span className="video-card__dot">·</span>
          <span className="video-card__time">{formatRelativeTime(video.publishedAt)}</span>
        </div>
        <div className={`video-card__more ${menuOpen ? 'is-open' : ''}`}>
          <button
            title="更多"
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen((v) => !v);
            }}
          >
            <Icon name="more" size={16} />
          </button>
          <ul className="video-card__menu">
            {['不感兴趣', '稍后再看', '不想看此 UP 主', '举报'].map((item) => (
              <li
                key={item}
                onClick={() => {
                  setMenuOpen(false);
                  flash(`已${item === '举报' ? '提交举报' : item}`);
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

/** 加载占位卡片 */
export function VideoCardSkeleton() {
  return (
    <div className="video-card video-card--skeleton">
      <div className="skeleton video-card__cover-skeleton" />
      <div className="skeleton" style={{ height: 16, marginTop: 10 }} />
      <div className="skeleton" style={{ height: 14, width: '60%', marginTop: 8 }} />
    </div>
  );
}
