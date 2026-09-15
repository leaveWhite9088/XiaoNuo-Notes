import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import { Icon } from '../common/Icon';
import { formatCount } from '../../utils/format';
import type { Owner } from '../../types';
import './UpCard.css';

/** 详情页右上角 UP 主名片 + 该 UP 的其它投稿 */
export function UpCard({ owner, currentBvid }: { owner: Owner; currentBvid: string }) {
  const [followed, setFollowed] = useState(false);
  const { data: videos = [] } = useQuery({
    queryKey: ['up-videos', owner.mid, currentBvid],
    queryFn: () => api.upVideos(owner.mid, 4, currentBvid),
  });

  return (
    <section className="up-card">
      <div className="up-card__head">
        <img className="up-card__avatar" src={owner.face} alt={owner.name} />
        <div className="up-card__meta">
          <div className="up-card__name">
            {owner.name}
            <span className="up-card__level">LV{owner.level}</span>
          </div>
          <div className="up-card__stats">
            <span>{formatCount(owner.fans)} 粉丝</span>
            <span>{formatCount(owner.videoCount)} 视频</span>
          </div>
        </div>
      </div>

      <div className="up-card__actions">
        <button
          className={`up-card__follow ${followed ? 'is-followed' : ''}`}
          onClick={() => setFollowed((v) => !v)}
        >
          <Icon name={followed ? 'check' : 'plus'} size={14} />
          {followed ? '已关注' : '关注'}
        </button>
        <button className="up-card__message">
          <Icon name="message" size={14} />
          发消息
        </button>
      </div>

      {videos.length > 0 && (
        <div className="up-card__videos">
          <header>UP 主的其它视频</header>
          <ul>
            {videos.map((v) => (
              <li key={v.bvid}>
                <Link to={`/video/${v.bvid}`} className="up-card__video">
                  <img src={v.cover} alt="" loading="lazy" />
                  <span className="text-clamp-2">{v.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
