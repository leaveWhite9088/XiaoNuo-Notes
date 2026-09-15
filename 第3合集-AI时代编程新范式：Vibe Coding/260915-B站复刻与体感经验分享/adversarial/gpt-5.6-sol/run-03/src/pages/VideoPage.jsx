import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Bell, Coins, Heart, Share2, ThumbsUp } from 'lucide-react'
import Header from '../components/Header.jsx'
import VideoCard from '../components/VideoCard.jsx'

const initialRequestState = { status: 'loading', id: '', data: null, error: '' }

export default function VideoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [requestState, setRequestState] = useState(initialRequestState)
  const [retry, setRetry] = useState(0)
  const [liked, setLiked] = useState(false)
  const [coined, setCoined] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [following, setFollowing] = useState(false)
  const [danmaku, setDanmaku] = useState(true)
  const [danmakuText, setDanmakuText] = useState('')
  const [commentText, setCommentText] = useState('')
  const [notice, setNotice] = useState('')
  const requestIdRef = useRef(0)
  const noticeTimer = useRef(null)

  useEffect(() => {
    const requestId = ++requestIdRef.current
    const controller = new AbortController()
    setRequestState({ status: 'loading', id, data: null, error: '' })
    setLiked(false)
    setCoined(false)
    setFavorited(false)
    setFollowing(false)
    setDanmaku(true)
    setDanmakuText('')
    setCommentText('')
    setNotice('')
    window.scrollTo(0, 0)

    async function loadVideo() {
      try {
        const response = await fetch(`/api/videos/${id}`, { signal: controller.signal })
        if (!response.ok) {
          if (response.status === 404) throw new Error('视频不存在或已被移除')
          throw new Error(`视频加载失败（${response.status}）`)
        }
        const data = await response.json()
        if (requestId !== requestIdRef.current || data.video.id !== id) return
        setRequestState({ status: 'success', id, data, error: '' })
      } catch (error) {
        if (error.name === 'AbortError' || requestId !== requestIdRef.current) return
        setRequestState({ status: 'error', id, data: null, error: error.message || '视频加载失败' })
      }
    }

    loadVideo()
    return () => controller.abort()
  }, [id, retry])

  const announce = (message) => {
    window.clearTimeout(noticeTimer.current)
    setNotice(message)
    noticeTimer.current = window.setTimeout(() => setNotice(''), 2200)
  }

  const submitDanmaku = () => {
    if (!danmakuText.trim()) return
    announce(`弹幕“${danmakuText.trim()}”已在本地演示发送`)
    setDanmakuText('')
  }

  const submitComment = () => {
    if (!commentText.trim()) return
    announce('评论已在本地演示发布')
    setCommentText('')
  }

  const isCurrent = requestState.id === id

  if (!isCurrent || requestState.status === 'loading') {
    return <div className="page-detail"><Header compact /><div className="detail-loading" role="status">正在加载视频…</div></div>
  }

  if (requestState.status === 'error') {
    return <div className="page-detail"><Header compact /><div className="error-state" role="alert"><AlertCircle size={42} /><h2>视频没有加载成功</h2><p>{requestState.error}</p><div><button type="button" onClick={() => setRetry((current) => current + 1)}>重新加载</button><button type="button" className="secondary-button" onClick={() => navigate('/')}>返回首页</button></div></div></div>
  }

  const { video, related } = requestState.data

  return (
    <div className="page-detail">
      <Header compact />
      <main className="detail-shell">
        <button type="button" className="back-button" onClick={() => navigate('/')}><ArrowLeft size={18} /> 返回首页</button>
        <div className="detail-layout">
          <section className="main-video-column">
            <div className="video-title-row"><div><h1>{video.title}</h1><p>{video.views}播放 · {video.danmaku}弹幕 · 发布于 {video.date}</p></div></div>
            <div className="player-frame">
              <video key={video.id} controls poster={video.cover} preload="metadata" data-testid="video-player">
                <source src={video.mediaUrl} type="video/mp4" />
                你的浏览器不支持视频播放。
              </video>
              <span className="demo-media-label">{video.mediaLabel} · {video.duration}</span>
            </div>
            <div className="danmaku-bar">
              <span><b>{video.danmaku}</b> 人正在看，已装填 1000+ 条弹幕</span>
              <label className="danmaku-switch"><input type="checkbox" checked={danmaku} onChange={(event) => setDanmaku(event.target.checked)} aria-label="显示弹幕" /><i aria-hidden="true" /> 弹幕</label>
              <div className="danmaku-input"><span>Aa</span><input value={danmakuText} onChange={(event) => setDanmakuText(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submitDanmaku()} placeholder="发个友善的弹幕见证当下" /><button type="button" disabled={!danmakuText.trim()} onClick={submitDanmaku}>发送</button></div>
            </div>
            <div className="action-bar">
              <button type="button" aria-pressed={liked} className={liked ? 'selected' : ''} onClick={() => setLiked((current) => !current)}><ThumbsUp fill={liked ? 'currentColor' : 'none'} />{liked ? '已点赞' : video.likes}</button>
              <button type="button" aria-pressed={coined} className={coined ? 'selected' : ''} onClick={() => { setCoined((current) => !current); announce(coined ? '已取消投币演示' : '已完成投币演示') }}><Coins />{coined ? '已投币' : video.coins}</button>
              <button type="button" aria-pressed={favorited} className={favorited ? 'selected' : ''} onClick={() => setFavorited((current) => !current)}><Heart fill={favorited ? 'currentColor' : 'none'} />{favorited ? '已收藏' : video.favorites}</button>
              <button type="button" onClick={() => announce('分享链接已在本地演示生成')}><Share2 />分享</button>
            </div>
            <p className="video-description">{video.description}</p>
            <div className="tags"><span>{video.category}</span><span>统一演示片段</span><span>界面复刻</span></div>
            <div className="comments">
              <h2>评论 <small>1286</small></h2>
              <div className="comment-editor"><div className="comment-avatar">游</div><textarea value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="发一条友善的评论" /><button type="button" disabled={!commentText.trim()} onClick={submitComment}>发布</button></div>
              <div className="comment-item"><div className="comment-avatar blue">夏日气泡</div><div><b>夏日气泡</b><p>镜头和音乐都太舒服了，已经循环三遍！</p><small>09-11 · 赞 386</small></div></div>
            </div>
          </section>
          <aside className="side-column">
            <div className="creator-card">
              <div className="creator-avatar">{video.author.slice(0, 1)}</div>
              <div className="creator-info"><strong>{video.author}</strong><span>用镜头记录每一个发光的日常</span><div><button type="button" className="message-button" onClick={() => announce('私信功能为演示状态')}>发消息</button><button type="button" aria-pressed={following} className="follow-button" onClick={() => setFollowing((current) => !current)}><Bell size={15} />{following ? '已关注' : '+ 关注 42.6万'}</button></div></div>
            </div>
            <h3 className="related-title">接下来播放</h3>
            <div className="related-list">{related.map((item) => <VideoCard key={item.id} video={item} compact />)}</div>
          </aside>
        </div>
      </main>
      {notice ? <div className="demo-toast detail-toast" role="status">{notice}</div> : null}
      <div className="sr-only" aria-live="polite">{notice}</div>
    </div>
  )
}
