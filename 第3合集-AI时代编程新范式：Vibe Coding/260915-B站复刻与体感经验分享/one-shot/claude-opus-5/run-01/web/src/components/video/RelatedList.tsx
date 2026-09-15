/** 播放页右侧「接下来播放 / 相关推荐」列表，点击后在同一页面切换稿件。 */
import { Link } from 'react-router-dom';
import { formatCount, formatDuration } from '../../utils/format';
import type { VideoCardData } from '../../types';
import './related-list.css';

interface Props {
  videos: VideoCardData[];
  currentBvid: string;
}

export function RelatedList({ videos, currentBvid }: Props) {
  return (
    <section className="related">
      <header className="related__head">
        <h3>接下来播放</h3>
        <label className="related__autoplay">
          自动连播
          <input type="checkbox" defaultChecked />
          <span />
        </label>
      </header>

      <ul className="related__list">
        {videos.map((video) => (
          <li key={video.bvid}>
            <Link
              className={`related__item ${video.bvid === currentBvid ? 'is-current' : ''}`}
              to={`/video/${video.bvid}`}
            >
              <div className="related__cover">
                <img src={video.cover} alt={video.title} loading="lazy" />
                <span className="related__duration">{formatDuration(video.duration)}</span>
              </div>
              <div className="related__info">
                <p className="related__title text-clamp-2">{video.title}</p>
                <p className="related__up text-ellipsis">{video.up.name}</p>
                <p className="related__stats">
                  {formatCount(video.stats.view)}观看 · {formatCount(video.stats.danmaku)}弹幕
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
