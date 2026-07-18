import { clsx } from 'clsx'
import { Clock3, DoorOpen, MessageSquareMore, QrCode, Search, Send, Sparkles, Star, Tv, UserRound, Waypoints } from 'lucide-react'
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'

import { api } from './lib/api'
import type { AuthStatus, CommentItem, DanmakuItem, FavoriteGroup, VideoCard, VideoDetail } from './types/api'
import './App.css'

const loginTips: Record<string, string> = {
  pending: '请使用哔哩哔哩 App 扫描二维码',
  scan: '已扫码，请在手机端确认登录',
  confirm: '等待最终登录结果',
  timeout: '二维码已失效，请重新生成',
  done: '登录成功，正在同步你的账户信息',
}

function formatTime(seconds: number | string) {
  const numeric = typeof seconds === 'string' ? Number(seconds) : seconds
  if (!Number.isFinite(numeric)) return String(seconds)
  const mins = Math.floor(numeric / 60)
  const secs = Math.floor(numeric % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function formatDate(timestamp: number) {
  if (!timestamp) return '未知时间'
  return new Date(timestamp * 1000).toLocaleString('zh-CN')
}

function App() {
  const [hotVideos, setHotVideos] = useState<VideoCard[]>([])
  const [searchResults, setSearchResults] = useState<VideoCard[]>([])
  const [keyword, setKeyword] = useState('')
  const deferredKeyword = useDeferredValue(keyword)
  const [selectedBvid, setSelectedBvid] = useState('')
  const [detail, setDetail] = useState<VideoDetail | null>(null)
  const [comments, setComments] = useState<CommentItem[]>([])
  const [danmaku, setDanmaku] = useState<DanmakuItem[]>([])
  const [auth, setAuth] = useState<AuthStatus>({ logged_in: false })
  const [favorites, setFavorites] = useState<FavoriteGroup[]>([])
  const [qrcode, setQrcode] = useState<{ sessionId: string; imageBase64: string; status: string } | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [danmakuDraft, setDanmakuDraft] = useState('')
  const [danmakuTime, setDanmakuTime] = useState('12')
  const [loading, setLoading] = useState('正在加载首页内容…')
  const [feedback, setFeedback] = useState('')

  const cards = searchResults.length > 0 ? searchResults : hotVideos
  const spotlight = useMemo(() => cards.slice(0, 3), [cards])

  async function bootstrap() {
    try {
      const [hotData, authData] = await Promise.all([api.getHotVideos(), api.getAuthStatus()])
      setHotVideos(hotData.items)
      setAuth(authData)
      if (hotData.items[0]) {
        setSelectedBvid(hotData.items[0].bvid)
      }
      if (authData.logged_in) {
        const favoriteData = await api.getMyFavorites()
        setFavorites(favoriteData.items)
      }
      setLoading('')
    } catch (error) {
      setLoading('')
      setFeedback(getErrorMessage(error))
    }
  }

  async function refreshAuth() {
    const authData = await api.getAuthStatus()
    setAuth(authData)
    if (authData.logged_in) {
      const favoriteData = await api.getMyFavorites()
      setFavorites(favoriteData.items)
    } else {
      setFavorites([])
    }
  }

  async function loadVideo(bvid: string) {
    try {
      setLoading('正在同步视频详情、评论与弹幕…')
      const [detailData, commentData, danmakuData] = await Promise.all([
        api.getVideoDetail(bvid),
        api.getComments(bvid),
        api.getDanmaku(bvid),
      ])
      setDetail(detailData)
      setComments(commentData.items)
      setDanmaku(danmakuData.items)
      setLoading('')
    } catch (error) {
      setLoading('')
      setFeedback(getErrorMessage(error))
    }
  }

  async function handleSearch() {
    if (!keyword.trim()) {
      setSearchResults([])
      return
    }
    try {
      setLoading('正在搜索视频…')
      const result = await api.searchVideos(keyword.trim())
      setSearchResults(result.items)
      if (result.items[0]) {
        startTransition(() => setSelectedBvid(result.items[0].bvid))
      }
      setLoading('')
    } catch (error) {
      setLoading('')
      setFeedback(getErrorMessage(error))
    }
  }

  async function handleCreateQrcode() {
    try {
      const result = await api.createLoginQrcode()
      setQrcode({
        sessionId: result.session_id,
        imageBase64: result.image_base64,
        status: result.status,
      })
      setFeedback('')
    } catch (error) {
      setFeedback(getErrorMessage(error))
    }
  }

  async function handleSendComment() {
    if (!detail || !commentDraft.trim()) return
    try {
      await api.sendComment(detail.bvid, commentDraft.trim())
      setCommentDraft('')
      const commentData = await api.getComments(detail.bvid)
      setComments(commentData.items)
      setFeedback('评论已发送')
    } catch (error) {
      setFeedback(getErrorMessage(error))
    }
  }

  async function handleSendDanmaku() {
    if (!detail || !danmakuDraft.trim()) return
    try {
      await api.sendDanmaku(detail.bvid, danmakuDraft.trim(), Number(danmakuTime || 0), 0)
      setDanmakuDraft('')
      const danmakuData = await api.getDanmaku(detail.bvid)
      setDanmaku(danmakuData.items)
      setFeedback('弹幕已发送')
    } catch (error) {
      setFeedback(getErrorMessage(error))
    }
  }

  async function handleLogout() {
    try {
      await api.logout()
      await refreshAuth()
      setFeedback('已退出登录')
    } catch (error) {
      setFeedback(getErrorMessage(error))
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void bootstrap()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!selectedBvid) return
    const timer = window.setTimeout(() => {
      void loadVideo(selectedBvid)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [selectedBvid])

  useEffect(() => {
    if (!qrcode?.sessionId) return
    const timer = window.setInterval(async () => {
      try {
        const result = await api.pollLoginQrcode(qrcode.sessionId)
        setQrcode((current) => (current ? { ...current, status: result.status } : current))
        if (result.status === 'done') {
          window.clearInterval(timer)
          await refreshAuth()
          setQrcode(null)
          setFeedback('登录状态已同步')
        }
        if (result.status === 'timeout') {
          window.clearInterval(timer)
        }
      } catch (error) {
        window.clearInterval(timer)
        setFeedback(getErrorMessage(error))
      }
    }, 2200)
    return () => window.clearInterval(timer)
  }, [qrcode?.sessionId])

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand__mark">哔</div>
          <div>
            <p className="eyebrow">Bili Portal</p>
            <h1>哔哩风格视频平台</h1>
          </div>
        </div>

        <div className="searchbox">
          <Search size={18} />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void handleSearch()
            }}
            placeholder="搜索视频、UP 主、关键词"
          />
          <button className="primary-button" onClick={() => void handleSearch()}>
            搜索
          </button>
        </div>

        <div className="authbox">
          {auth.logged_in ? (
            <>
              <div className="profile-chip">
                <img src={auth.profile?.avatar} alt={auth.profile?.name} />
                <div>
                  <strong>{auth.profile?.name}</strong>
                  <span>Lv.{auth.profile?.level ?? 0}</span>
                </div>
              </div>
              <button className="ghost-button" onClick={() => void handleLogout()}>
                <DoorOpen size={16} />
                退出
              </button>
            </>
          ) : (
            <button className="primary-button" onClick={() => void handleCreateQrcode()}>
              <QrCode size={16} />
              登录
            </button>
          )}
        </div>
      </header>

      <main className="layout">
        <section className="hero">
          <div className="player-panel">
            <div className="panel-head">
              <span className="panel-label">正在播放</span>
              <span className="panel-note">{detail?.bvid ?? '等待选择视频'}</span>
            </div>
            {detail ? (
              <>
                <div className="player-frame">
                  <iframe src={detail.player_url} title={detail.title} allowFullScreen />
                </div>
                <div className="detail-block">
                  <div className="detail-main">
                    <h2>{detail.title}</h2>
                    <p>{detail.desc || '视频简介暂未提供。'}</p>
                  </div>
                  <div className="detail-actions">
                    <button className="primary-button" onClick={() => window.open(detail.official_url, '_blank', 'noopener,noreferrer')}>
                      <Waypoints size={16} />
                      跳转官网
                    </button>
                    <div className="author-chip">
                      <img src={detail.author_avatar} alt={detail.author} />
                      <div>
                        <strong>{detail.author}</strong>
                        <span>{formatDate(detail.published_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="stats-grid">
                  {Object.entries(detail.stats).map(([label, value]) => (
                    <div key={label} className="stat-card">
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-panel">请选择左下方视频卡片开始浏览</div>
            )}
          </div>

          <aside className="side-panel">
            <div className="accent-card">
              <div className="panel-head">
                <span className="panel-label">平台能力</span>
                <Sparkles size={16} />
              </div>
              <ul className="feature-list">
                <li>播放视频并跳转哔哩哔哩官网</li>
                <li>展示视频信息、评论与弹幕</li>
                <li>二维码登录并读取账号状态</li>
                <li>登录后发送评论、发送弹幕、查看收藏夹</li>
              </ul>
            </div>

            <div className="login-card">
              <div className="panel-head">
                <span className="panel-label">账户中心</span>
                <UserRound size={16} />
              </div>

              {auth.logged_in ? (
                <div className="account-panel">
                  <div className="account-head">
                    <img src={auth.profile?.avatar} alt={auth.profile?.name} />
                    <div>
                      <h3>{auth.profile?.name}</h3>
                      <p>{auth.profile?.sign || '这个人很神秘，什么都没有写。'}</p>
                    </div>
                  </div>
                  <div className="account-stats">
                    <span>等级 Lv.{auth.profile?.level}</span>
                    <span>硬币 {auth.profile?.coins ?? 0}</span>
                  </div>
                </div>
              ) : qrcode ? (
                <div className="qrcode-panel">
                  <img src={`data:image/png;base64,${qrcode.imageBase64}`} alt="登录二维码" />
                  <p>{loginTips[qrcode.status] ?? '等待登录'}</p>
                  <button className="ghost-button" onClick={() => void handleCreateQrcode()}>
                    刷新二维码
                  </button>
                </div>
              ) : (
                <div className="empty-login">
                  <p>使用 Bilibili App 扫码登录后，即可发送评论、弹幕，并查看自己的收藏视频。</p>
                  <button className="primary-button" onClick={() => void handleCreateQrcode()}>
                    <QrCode size={16} />
                    生成登录二维码
                  </button>
                </div>
              )}
            </div>

            <div className="favorites-card">
              <div className="panel-head">
                <span className="panel-label">我的收藏</span>
                <Star size={16} />
              </div>
              {favorites.length > 0 ? (
                favorites.slice(0, 2).map((group) => (
                  <div key={group.id} className="favorite-group">
                    <div className="favorite-group__head">
                      <strong>{group.title}</strong>
                      <span>{group.count} 个视频</span>
                    </div>
                    {group.items.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        className="favorite-item"
                        onClick={() => startTransition(() => setSelectedBvid(item.bvid))}
                      >
                        <img src={item.cover} alt={item.title} />
                        <div>
                          <strong>{item.title}</strong>
                          <span>{item.upper}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ))
              ) : (
                <div className="empty-panel">{auth.logged_in ? '暂无可展示的收藏内容' : '登录后可查看自己的收藏夹'}</div>
              )}
            </div>
          </aside>
        </section>

        <section className="content-grid">
          <div className="feed-panel">
            <div className="panel-head">
              <span className="panel-label">{searchResults.length > 0 ? `搜索结果 · ${deferredKeyword}` : '热门推荐'}</span>
              <Tv size={16} />
            </div>

            {spotlight.length > 0 && (
              <div className="spotlight-grid">
                {spotlight.map((item, index) => (
                  <button
                    key={`${item.bvid}-${index}`}
                    className={clsx('spotlight-card', selectedBvid === item.bvid && 'is-active')}
                    onClick={() => startTransition(() => setSelectedBvid(item.bvid))}
                  >
                    <img src={item.cover} alt={item.title} />
                    <div>
                      <span className="spotlight-tag">精选 {index + 1}</span>
                      <h3>{item.title}</h3>
                      <p>{item.author}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="video-grid">
              {cards.map((item) => (
                <button
                  key={item.bvid}
                  className={clsx('video-card', selectedBvid === item.bvid && 'is-active')}
                  onClick={() => startTransition(() => setSelectedBvid(item.bvid))}
                >
                  <div className="video-card__cover">
                    <img src={item.cover} alt={item.title} />
                    <span>{formatTime(item.duration)}</span>
                  </div>
                  <div className="video-card__body">
                    <strong>{item.title}</strong>
                    <p>{item.desc || '点击查看完整视频详情'}</p>
                    <div className="video-card__meta">
                      <span>{item.author}</span>
                      <span>{item.play} 播放</span>
                      <span>{item.danmaku} 弹幕</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="interaction-panel">
            <div className="editor-card">
              <div className="panel-head">
                <span className="panel-label">互动中心</span>
                <Send size={16} />
              </div>

              <div className="editor-grid">
                <div className="editor-block">
                  <h3>发送评论</h3>
                  <textarea
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                    placeholder={auth.logged_in ? '输入评论内容，直接发送到当前视频' : '请先登录后发送评论'}
                    disabled={!auth.logged_in}
                  />
                  <button className="primary-button" disabled={!auth.logged_in} onClick={() => void handleSendComment()}>
                    <MessageSquareMore size={16} />
                    发送评论
                  </button>
                </div>

                <div className="editor-block">
                  <h3>发送弹幕</h3>
                  <input
                    value={danmakuDraft}
                    onChange={(event) => setDanmakuDraft(event.target.value)}
                    placeholder={auth.logged_in ? '输入弹幕内容' : '请先登录后发送弹幕'}
                    disabled={!auth.logged_in}
                  />
                  <label className="time-input">
                    <Clock3 size={16} />
                    <span>发送时间（秒）</span>
                    <input
                      value={danmakuTime}
                      onChange={(event) => setDanmakuTime(event.target.value)}
                      disabled={!auth.logged_in}
                    />
                  </label>
                  <button className="primary-button" disabled={!auth.logged_in} onClick={() => void handleSendDanmaku()}>
                    <Send size={16} />
                    发送弹幕
                  </button>
                </div>
              </div>
            </div>

            <div className="dual-panel">
              <div className="comment-panel">
                <div className="panel-head">
                  <span className="panel-label">评论区</span>
                  <MessageSquareMore size={16} />
                </div>
                <div className="scroll-area">
                  {comments.map((item) => (
                    <article key={item.id} className="comment-item">
                      <img src={item.user.avatar} alt={item.user.name} />
                      <div>
                        <div className="comment-item__head">
                          <strong>{item.user.name}</strong>
                          <span>Lv.{item.user.level}</span>
                        </div>
                        <p>{item.message}</p>
                        <div className="comment-item__meta">
                          <span>{formatDate(item.ctime)}</span>
                          <span>{item.like} 点赞</span>
                          <span>{item.replies} 回复</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="danmaku-panel">
                <div className="panel-head">
                  <span className="panel-label">弹幕流</span>
                  <Sparkles size={16} />
                </div>
                <div className="scroll-area danmaku-list">
                  {danmaku.map((item, index) => (
                    <div key={`${item.time}-${index}`} className="danmaku-item">
                      <span>{formatTime(item.time)}</span>
                      <strong style={{ color: item.color }}>{item.text}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {(loading || feedback) && (
        <div className="status-bar">
          {loading ? <span>{loading}</span> : null}
          {feedback ? <span>{feedback}</span> : null}
        </div>
      )}
    </div>
  )
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = error.response as { data?: { detail?: string; message?: string } }
    return response.data?.detail || response.data?.message || '请求失败'
  }
  if (error instanceof Error) {
    return error.message
  }
  return '请求失败'
}

export default App
