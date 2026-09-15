import { Link } from 'react-router-dom';
import { fmtCount, fmtDuration, fmtTimeAgo } from '../utils.js';

// 首页视频卡片：封面 hover 放大 + 信息浮层 + 阴影抬升
export default function VideoCard({ video, compact = false }) {
  return (
    <Link to={`/video/${video.id}`} className={`video-card ${compact ? 'compact' : ''}`}>
      <div className="cover-wrap">
        <img className="cover" src={video.cover} alt={video.title} loading="lazy" />
        <span className="duration">{fmtDuration(video.duration)}</span>
        <div className="cover-hover">
          <span className="play-icon">▶</span>
          <span>点击播放</span>
        </div>
      </div>
      <div className="card-info">
        <h3 className="card-title" title={video.title}>{video.title}</h3>
        {!compact && (
          <>
            <p className="card-meta">
              <span className="up-line">
                <img className="card-avatar" src={video.up.avatar} alt="" loading="lazy" />
                {video.up.name}
              </span>
              <span className="stat-line">▶ {fmtCount(video.views)} · 💬 {fmtCount(video.danmaku)}</span>
            </p>
            <p className="card-time">{fmtTimeAgo(video.publishAt)} · {video.category}</p>
          </>
        )}
      </div>
    </Link>
  );
}
