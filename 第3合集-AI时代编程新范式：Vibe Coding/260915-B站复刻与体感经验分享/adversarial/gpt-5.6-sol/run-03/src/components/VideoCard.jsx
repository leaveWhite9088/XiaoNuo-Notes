import { useState } from 'react'
import { Clock3, MoreVertical, Play, PlaySquare } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function VideoCard({ video, compact = false }) {
  const [saved, setSaved] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <article className={`video-card ${compact ? 'video-card--compact' : ''}`}>
      <div className="cover-wrap">
        <Link className="cover-link" to={`/video/${video.id}`} aria-label={`播放：${video.title}`}>
          <img src={video.cover} alt="" loading="lazy" />
          <div className="cover-hover"><span className="hover-play"><Play fill="currentColor" size={20} /></span><span>点击播放</span></div>
          <div className="video-stats"><span><PlaySquare size={15} />{video.views}</span><span className="duration">{video.duration}</span></div>
        </Link>
        <button type="button" className={`watch-later ${saved ? 'saved' : ''}`} aria-label={saved ? '已加入稍后再看，点击移除' : '加入稍后再看'} aria-pressed={saved} onClick={() => setSaved((current) => !current)}><Clock3 size={18} /></button>
      </div>
      <div className="video-card-body">
        <h3><Link to={`/video/${video.id}`}>{video.title}</Link></h3>
        <div className="video-meta">
          <span className="up-badge">UP</span><span>{video.author} · {video.date}</span>
          <span className="more-wrap"><button type="button" aria-label={`更多：${video.title}`} aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}><MoreVertical size={17} /></button>{menuOpen ? <span className="card-menu" role="status">更多操作为演示状态</span> : null}</span>
        </div>
      </div>
      <div className="sr-only" aria-live="polite">{saved ? `已将“${video.title}”加入稍后再看` : ''}</div>
    </article>
  )
}
