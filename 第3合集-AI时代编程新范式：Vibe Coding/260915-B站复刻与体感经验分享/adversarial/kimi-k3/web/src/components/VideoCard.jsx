export default function VideoCard({ video, onOpen }) {
  return (
    <article className="video-card" onClick={() => onOpen(video.id)}>
      <div className="cover-wrap">
        <img className="cover" src={video.cover} alt={video.title} loading="lazy" />
        <span className="duration">{video.duration}</span>
        <div className="cover-stats">
          <span>▶ {video.views}</span>
          <span>💬 {video.danmaku}</span>
        </div>
        <div className="hover-panel" onClick={(e) => e.stopPropagation()}>
          <p className="hover-title">{video.title}</p>
          <div className="hover-up">
            <img src={video.up.avatar} alt={video.up.name} />
            <span>{video.up.name}</span>
          </div>
          <p className="hover-desc">{video.desc}</p>
          <button className="hover-play" onClick={() => onOpen(video.id)}>
            立即观看 →
          </button>
        </div>
      </div>
      <h3 className="card-title" title={video.title}>
        {video.title}
      </h3>
      <div className="card-meta">
        <span className="card-up">UP · {video.up.name}</span>
        <span className="card-views">{video.views}观看 · {video.date}</span>
      </div>
    </article>
  )
}
