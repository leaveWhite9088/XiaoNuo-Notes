import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCount, formatDuration } from '../../utils/format';
import type { VideoCard } from '../../types';
import './RelatedList.css';

/** 详情页右侧「接下来播放 / 相关推荐」列表 */
export function RelatedList({ videos, loading }: { videos: VideoCard[]; loading: boolean }) {
  const [autoPlay, setAutoPlay] = useState(true);

  return (
    <section className="related">
      <header className="related__header">
        <span>接下来播放</span>
        <label className="related__switch">
          自动连播
          <input type="checkbox" checked={autoPlay} onChange={(e) => setAutoPlay(e.target.checked)} />
          <i />
        </label>
      </header>

      {loading && <div className="related__hint">加载中…</div>}

      <ul className="related__list">
        {videos.map((v) => (
          <li key={v.bvid}>
            <Link className="related__item" to={`/video/${v.bvid}`}>
              <span className="related__cover">
                <img src={v.cover} alt="" loading="lazy" />
                <em>{formatDuration(v.duration)}</em>
              </span>
              <span className="related__info">
                <span className="related__title text-clamp-2">{v.title}</span>
                <span className="related__up">{v.owner.name}</span>
                <span className="related__stat">
                  {formatCount(v.stat.view)}观看 · {formatCount(v.stat.danmaku)}弹幕
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
