import { Link } from 'react-router-dom';
import { formatCount, formatDuration } from '../../utils/format';
import type { VideoCard } from '../../types';
import './MiniVideoList.css';

interface MiniVideoListProps {
  title: string;
  items: (VideoCard & { progress?: number })[];
  loading: boolean;
  emptyText: string;
}

/** 顶栏「收藏 / 历史 / 稍后再看」悬浮面板里的小卡列表 */
export function MiniVideoList({ title, items, loading, emptyText }: MiniVideoListProps) {
  return (
    <div className="mini-list">
      <header className="mini-list__header">
        <span>{title}</span>
        <span className="mini-list__count">{items.length}</span>
      </header>

      {loading && <div className="mini-list__hint">加载中…</div>}
      {!loading && items.length === 0 && <div className="mini-list__hint">{emptyText}</div>}

      <ul className="mini-list__items">
        {items.slice(0, 6).map((v) => (
          <li key={v.bvid}>
            <Link className="mini-list__item" to={`/video/${v.bvid}`}>
              <span className="mini-list__cover">
                <img src={v.cover} alt="" loading="lazy" />
                <em>{formatDuration(v.duration)}</em>
                {typeof v.progress === 'number' && v.progress > 0 && (
                  <i
                    className="mini-list__progress"
                    style={{ width: `${Math.min(100, (v.progress / Math.max(1, v.duration)) * 100)}%` }}
                  />
                )}
              </span>
              <span className="mini-list__info">
                <span className="mini-list__title text-clamp-2">{v.title}</span>
                <span className="mini-list__up">
                  {v.owner.name} · {formatCount(v.stat.view)}播放
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
