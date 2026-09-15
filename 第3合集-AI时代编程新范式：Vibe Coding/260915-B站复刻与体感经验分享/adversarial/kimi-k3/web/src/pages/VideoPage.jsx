import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function VideoPage({ id, onBack, onOpenVideo }) {
  const [video, setVideo] = useState(null)
  const [error, setError] = useState('')
  const [liked, setLiked] = useState(false)
  const [followed, setFollowed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setVideo(null)
    setError('')
    setLiked(false)
    setFollowed(false)
    api
      .video(id)
      .then((v) => {
        if (!cancelled) setVideo(v)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (error) {
    return (
      <div className="video-page">
        <button className="back-btn" onClick={onBack}>← 返回首页</button>
        <div className="state-tip error">加载失败：{error}</div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="video-page">
        <button className="back-btn" onClick={onBack}>← 返回首页</button>
        <div className="state-tip">加载中…</div>
      </div>
    )
  }

  return (
    <div className="video-page">
      <button className="back-btn" onClick={onBack}>← 返回首页</button>

      <div className="video-layout">
        <div className="video-main">
          <div className="player-meta-top">
            <span className="crumb">{video.category}</span>
            <h1 className="video-title">{video.title}</h1>
            <p className="video-stats">
              <span>{video.bvid}</span>
              <span>{video.views}播放</span>
              <span>{video.danmaku}弹幕</span>
              <span>{video.date}</span>
            </p>
          </div>

          <div className="player">
            <video key={video.id} controls preload="metadata" poster={video.cover} src={video.src} />
          </div>

          <div className="action-row">
            <button className={`action-btn ${liked ? 'on' : ''}`} onClick={() => setLiked((v) => !v)}>
              👍 {video.likes}
            </button>
            <button className="action-btn">🪙 {video.coins}</button>
            <button className="action-btn">⭐ {video.favorites}</button>
            <button className="action-btn">↗ 分享</button>
          </div>

          <div className="up-card">
            <img className="up-avatar" src={video.up.avatar} alt={video.up.name} />
            <div className="up-info">
              <p className="up-name">{video.up.name}</p>
              <p className="up-fans">粉丝 {video.up.fans}</p>
            </div>
            <button
              className={`follow-btn ${followed ? 'on' : ''}`}
              onClick={() => setFollowed((v) => !v)}
            >
              {followed ? '已关注' : '+ 关注'}
            </button>
          </div>

          <p className="video-desc">{video.desc}</p>
        </div>

        <aside className="video-side">
          <h2 className="side-title">相关推荐</h2>
          {video.related.map((r) => (
            <button key={r.id} className="related-item" onClick={() => onOpenVideo(r.id)}>
              <div className="related-cover">
                <img src={r.cover} alt={r.title} loading="lazy" />
                <span className="duration">{r.duration}</span>
              </div>
              <div className="related-info">
                <p className="related-title">{r.title}</p>
                <p className="related-meta">UP · {r.up.name}</p>
                <p className="related-meta">{r.views}观看 · {r.danmaku}弹幕</p>
              </div>
            </button>
          ))}
        </aside>
      </div>
    </div>
  )
}
