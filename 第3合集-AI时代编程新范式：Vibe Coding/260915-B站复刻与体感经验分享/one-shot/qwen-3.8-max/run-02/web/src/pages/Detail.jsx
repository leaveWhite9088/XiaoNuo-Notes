import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import VideoCard from '../components/VideoCard.jsx';
import { fmtCount, fmtTimeAgo } from '../utils.js';

export default function Detail() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [liked, setLiked] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setVideo(null);
    setNotFound(false);
    setLiked(false);
    setFollowed(false);
    setExpanded(false);
    api
      .video(id)
      .then(setVideo)
      .catch(() => setNotFound(true));
    api.related(id).then(setRelated).catch(() => setRelated([]));
  }, [id]);

  const onLike = async () => {
    if (liked) return;
    const v = await api.like(id);
    setVideo(v);
    setLiked(true);
  };

  if (notFound) {
    return (
      <div className="detail-notfound">
        <p>视频不存在或已被删除 (´；ω；`)</p>
        <Link to="/" className="upload-btn">返回首页</Link>
      </div>
    );
  }
  if (!video) return <div className="loading-tip">播放页加载中…</div>;

  return (
    <div className="detail">
      <div className="detail-main">
        <div className="back-bar">
          <Link to="/" className="back-link">← 返回首页</Link>
          <span className="crumb">
            <Link to="/">首页</Link> › <Link to={`/?category=${encodeURIComponent(video.category)}`}>{video.category}</Link> › 视频详情
          </span>
        </div>

        {/* 真实播放器 */}
        <div className="player">
          <video
            key={video.id}
            src={video.videoUrl}
            poster={video.cover}
            controls
            autoPlay={false}
            preload="metadata"
          />
        </div>

        <h1 className="detail-title">{video.title}</h1>

        <div className="detail-meta">
          <span>▶ {fmtCount(video.views)}播放</span>
          <span>💬 {fmtCount(video.danmaku)}弹幕</span>
          <span>{fmtTimeAgo(video.publishAt)}</span>
          <span className="bvid">{video.id}</span>
        </div>

        <div className="action-bar">
          <button className={`action-btn ${liked ? 'liked' : ''}`} onClick={onLike} type="button">
            👍 {fmtCount(video.likes)}
          </button>
          <button className="action-btn" type="button">🪙 投币 {fmtCount(video.coins)}</button>
          <button className="action-btn" type="button">⭱ 收藏 {fmtCount(video.favorites)}</button>
          <button className="action-btn" type="button">↗ 分享 {fmtCount(video.shares)}</button>
        </div>

        <div className="up-card">
          <Link to={`/?keyword=${encodeURIComponent(video.up.name)}`} className="up-left">
            <img className="up-avatar" src={video.up.avatar} alt={video.up.name} />
            <div>
              <p className="up-name">{video.up.name}</p>
              <p className="up-fans">{fmtCount(video.up.fans)} 粉丝</p>
            </div>
          </Link>
          <button
            className={`follow-btn ${followed ? 'followed' : ''}`}
            onClick={() => setFollowed(!followed)}
            type="button"
          >
            {followed ? '已关注 ✓' : '+ 关注'}
          </button>
        </div>

        <div className={`desc ${expanded ? 'expanded' : ''}`}>
          <p>{video.description}</p>
          <div className="desc-tags">
            {video.tags.map((t) => (
              <Link key={t} to={`/?keyword=${encodeURIComponent(t)}`} className="desc-tag">#{t}</Link>
            ))}
          </div>
        </div>
        <button className="expand-btn" onClick={() => setExpanded(!expanded)} type="button">
          {expanded ? '收起 ▲' : '展开 ▼'}
        </button>
      </div>

      <aside className="detail-side">
        <h2 className="side-title">相关推荐</h2>
        <div className="side-list">
          {related.map((v) => (
            <VideoCard key={v.id} video={v} compact />
          ))}
        </div>
      </aside>
    </div>
  );
}
