import { Link } from 'react-router-dom'
import { formatCount, formatDate, formatDuration, loadStore, saveStore } from '../../utils/format'
import { IconClock, IconDanmaku, IconPlay } from '../Icons'
import { useState } from 'react'

export default function VideoCard({ video }) {
  const [later, setLater] = useState(() => loadStore('bili-later', []).some((v) => v.id === video.id))

  const toggleLater = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const list = loadStore('bili-later', [])
    const exists = list.some((v) => v.id === video.id)
    const next = exists ? list.filter((v) => v.id !== video.id) : [{ id: video.id, title: video.title, cover: video.cover }, ...list]
    saveStore('bili-later', next)
    setLater(!exists)
  }

  return (
    <Link className="video-card" to={`/video/${video.id}`}>
      <div className="cover">
        <img src={video.cover} alt={video.title} />
        <div className="cover-mask">
          <div className="stats">
            <span className="stats"><IconPlay /> {formatCount(video.views)}</span>
            <span className="stats"><IconDanmaku /> {formatCount(video.danmaku)}</span>
          </div>
          <span>{formatDuration(video.duration)}</span>
        </div>
        <button className={`later ${later ? 'on' : ''}`} onClick={toggleLater} title="稍后再看">
          <IconClock />
        </button>
      </div>
      <div className="card-info">
        <div className="card-title">{video.title}</div>
        <div className="card-meta">
          <span className="up">{video.up?.name}</span>
          <span>·</span>
          <span>{formatDate(video.pubDate)}</span>
        </div>
      </div>
    </Link>
  )
}
