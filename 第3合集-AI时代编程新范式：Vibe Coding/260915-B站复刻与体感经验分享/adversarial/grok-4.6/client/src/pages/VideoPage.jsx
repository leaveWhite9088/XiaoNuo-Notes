import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/layout/Header'
import Player from '../components/video/Player'
import CommentSection from '../components/video/CommentSection'
import { api } from '../api/client'
import { formatCount, formatDate, formatDuration, loadStore, saveStore } from '../utils/format'
import { IconCoin, IconFav, IconLike, IconShare } from '../components/Icons'

export default function VideoPage() {
  const { id } = useParams()
  const [video, setVideo] = useState(null)
  const [related, setRelated] = useState([])
  const [comments, setComments] = useState([])
  const [acts, setActs] = useState({ likes: false, coins: false, favorites: false })
  const [followed, setFollowed] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let dead = false
    setError('')
    Promise.all([api.video(id), api.related(id), api.comments(id)])
      .then(([v, r, c]) => {
        if (dead) return
        setVideo(v)
        setRelated(r)
        setComments(c)
        const history = loadStore('bili-history', []).filter((x) => x.id !== v.id)
        saveStore('bili-history', [{ id: v.id, title: v.title }, ...history].slice(0, 20))
      })
      .catch(() => setError('视频不存在或加载失败'))
    return () => {
      dead = true
    }
  }, [id])

  const act = async (type) => {
    if (!video) return
    const next = await api.act(video.id, type)
    setVideo(next)
    setActs((s) => ({ ...s, [type]: true }))
  }

  if (error) {
    return (
      <div className="page-with-header">
        <Header />
        <div className="empty-feed">{error}，<Link to="/">返回首页</Link></div>
      </div>
    )
  }
  if (!video) {
    return (
      <div className="page-with-header">
        <Header />
        <div className="empty-feed">加载中...</div>
      </div>
    )
  }

  return (
    <div className="page-with-header">
      <Header />
      <div className="video-page">
        <div className="video-layout">
          <div>
            <Player video={video} comments={comments} />
            <h1 className="video-title">{video.title}</h1>
            <div className="video-stats">
              <div>
                {formatCount(video.views)} 播放 · {formatCount(video.danmaku)} 弹幕 · {formatDate(video.pubDate)}
              </div>
              <div className="ops">
                <button className={acts.likes ? 'active' : ''} onClick={() => act('likes')}>
                  <IconLike /> {formatCount(video.likes)}
                </button>
                <button className={acts.coins ? 'active' : ''} onClick={() => act('coins')}>
                  <IconCoin /> {formatCount(video.coins)}
                </button>
                <button className={acts.favorites ? 'active' : ''} onClick={() => act('favorites')}>
                  <IconFav /> {formatCount(video.favorites)}
                </button>
                <button onClick={() => act('shares')}>
                  <IconShare /> {formatCount(video.shares)}
                </button>
              </div>
            </div>
            <div className="up-card">
              <img src={video.up.face} alt={video.up.name} />
              <div>
                <div className="name">{video.up.name}</div>
                <div className="sign">{video.up.sign} · {formatCount(video.up.fans)} 粉丝</div>
              </div>
              <button className={`follow ${followed ? 'on' : ''}`} onClick={() => setFollowed((v) => !v)}>
                {followed ? '已关注' : '+ 关注'}
              </button>
            </div>
            <div className="tags">
              {video.tags.map((t) => (
                <Link key={t} to={`/search?q=${encodeURIComponent(t)}`}><span>{t}</span></Link>
              ))}
            </div>
            <div className="desc">{video.desc}</div>
            <CommentSection comments={comments} />
          </div>
          <aside className="related">
            <h3>接下来播放</h3>
            {related.map((item) => (
              <Link className="related-card" key={item.id} to={`/video/${item.id}`}>
                <div className="thumb">
                  <img src={item.cover} alt="" />
                  <span className="dur">{formatDuration(item.duration)}</span>
                </div>
                <div>
                  <div className="t">{item.title}</div>
                  <div className="m">{item.up.name}</div>
                  <div className="m">{formatCount(item.views)} 播放</div>
                </div>
              </Link>
            ))}
          </aside>
        </div>
      </div>
    </div>
  )
}
