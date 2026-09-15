import { useNavigate } from 'react-router-dom';
import { formatCount, formatDuration, formatTime } from '../utils/format.js';

export default function VideoCard({ video }) {
  const navigate = useNavigate();
  const open = () => navigate(`/video/${video.bvid}`);

  return (
    <div className="video-card" onClick={open}>
      <div className="cover-wrap">
        <img className="cover" src={video.cover} alt={video.title} loading="lazy" />
        <div className="cover-mask">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="#fff" className="play-icon">
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        </div>
        <div className="cover-stats">
          <span className="stat">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>
            {formatCount(video.views)}
          </span>
          <span className="stat">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8l-4 3v-3H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /></svg>
            {formatCount(video.danmaku)}
          </span>
        </div>
        <span className="duration-badge">{formatDuration(video.duration)}</span>
      </div>
      <div className="card-title" title={video.title}>{video.title}</div>
      <div className="card-meta">
        <span className="up-name">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12zm0 2c-3.6 0-8 1.8-8 5v2h16v-2c0-3.2-4.4-5-8-5z" /></svg>
          {video.up.name}
        </span>
        <span className="dot-sep">·</span>
        <span>{formatTime(video.pubdate)}</span>
      </div>
    </div>
  );
}
