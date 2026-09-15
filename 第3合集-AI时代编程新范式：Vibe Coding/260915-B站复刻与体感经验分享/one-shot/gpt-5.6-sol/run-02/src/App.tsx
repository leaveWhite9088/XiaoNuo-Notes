import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Bell, ChevronDown, CirclePlay, Clock3, Coins, Flame, Gamepad2, Heart,
  History, Home as HomeIcon, Menu, MessageCircle, MoreHorizontal, Play,
  RefreshCw, Search, Star, ThumbsUp, Tv, Upload, Users, Video as VideoIcon,
  Zap
} from 'lucide-react'

type VideoItem = {
  id: string
  title: string
  category: string
  cover: string
  avatar: string
  author: string
  views: string
  danmaku: string
  duration: string
  date: string
  likes: string
  coins: string
  favorites: string
  source: string
  tags: string[]
  description: string
}

type Suggestion = Pick<VideoItem, 'id' | 'title' | 'category'>

const topLinks = ['首页', '番剧', '直播', '游戏中心', '会员购', '漫画', '赛事']
const userMenus = [
  { icon: Bell, label: '消息' },
  { icon: Zap, label: '动态' },
  { icon: Star, label: '收藏' },
  { icon: History, label: '历史' },
  { icon: VideoIcon, label: '创作中心' },
]

function useNotice() {
  const [notice, setNotice] = useState('')
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 1800)
    return () => window.clearTimeout(timer)
  }, [notice])
  return { notice, showNotice: setNotice }
}

function Header({ onSearch }: { onSearch?: (keyword: string) => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const isHome = location.pathname === '/'

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      fetch(`/api/search/suggestions?q=${encodeURIComponent(keyword)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => setSuggestions(data.items || []))
        .catch(() => undefined)
    }, 120)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [keyword])

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const submitSearch = (value = keyword) => {
    const clean = value.trim()
    if (!isHome) navigate(`/?search=${encodeURIComponent(clean)}`)
    else onSearch?.(clean)
    setKeyword(clean)
    setSearchOpen(false)
  }

  return (
    <header className={`top-header ${isHome ? 'over-hero' : 'detail-header'}`}>
      <nav className="top-nav left-nav" aria-label="主导航">
        <Link className="nav-link home-link" to="/"><Tv size={18} strokeWidth={2.7} /> 首页</Link>
        {topLinks.slice(1).map((item) => <button className="nav-link nav-button" key={item}>{item}</button>)}
        <div className="menu-wrap" onMouseEnter={() => setMoreOpen(true)} onMouseLeave={() => setMoreOpen(false)}>
          <button className="nav-link nav-button">更多 <ChevronDown size={13} /></button>
          {moreOpen && (
            <div className="float-menu more-menu">
              {['课堂', '社区中心', '新歌热榜', '活动中心'].map((item) => <button key={item}>{item}</button>)}
            </div>
          )}
        </div>
      </nav>

      <div className="search-shell" ref={searchRef}>
        <div className={`search-box ${searchOpen ? 'focused' : ''}`}>
          <input
            aria-label="搜索"
            value={keyword}
            placeholder="全站搜索你感兴趣的视频"
            onChange={(event) => setKeyword(event.target.value)}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(event) => event.key === 'Enter' && submitSearch()}
          />
          <button aria-label="提交搜索" onClick={() => submitSearch()}><Search size={20} /></button>
        </div>
        {searchOpen && (
          <div className="search-panel">
            <div className="search-panel-title">{keyword ? '搜索建议' : '哔哩哔哩热搜'}</div>
            {suggestions.length ? suggestions.map((item, index) => (
              <button key={item.id + item.title} onClick={() => keyword ? navigate(`/video/${item.id}`) : submitSearch(item.title)}>
                {!keyword && <span className={index < 3 ? 'hot-rank' : 'rank'}>{index + 1}</span>}
                <span>{item.title}</span><small>{item.category}</small>
              </button>
            )) : <div className="empty-suggest">没有找到相关内容，换个关键词试试</div>}
          </div>
        )}
      </div>

      <nav className="top-nav right-nav" aria-label="用户导航">
        <div className="menu-wrap login-wrap" onMouseEnter={() => setLoginOpen(true)} onMouseLeave={() => setLoginOpen(false)}>
          <button className="login-button">登录</button>
          {loginOpen && (
            <div className="float-menu login-menu">
              <strong>登录后你可以：</strong>
              <span><CirclePlay size={17} /> 免费观看高清视频</span>
              <span><Clock3 size={17} /> 多端同步播放记录</span>
              <span><MessageCircle size={17} /> 发表弹幕和评论</span>
              <button className="login-action">首次登录</button>
              <p>首次使用？<em>点我注册</em></p>
            </div>
          )}
        </div>
        {userMenus.map(({ icon: Icon, label }) => (
          <button className="icon-menu" key={label}><Icon size={18} /><span>{label}</span></button>
        ))}
        <button className="upload-button"><Upload size={18} /> 投稿</button>
      </nav>
    </header>
  )
}

function VideoCard({ video, compact = false }: { video: VideoItem; compact?: boolean }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const [watchLater, setWatchLater] = useState(false)

  return (
    <article className={`video-card ${compact ? 'compact' : ''}`}>
      <div
        className="cover-wrap"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => navigate(`/video/${video.id}`)}
      >
        <img src={video.cover} alt="" loading="lazy" />
        {hovered && !compact && <video src={video.source} muted autoPlay loop playsInline preload="metadata" poster={video.cover} />}
        <div className="cover-gradient" />
        <div className="cover-stats">
          <span><Play size={15} fill="currentColor" /> {video.views}</span>
          <span><MessageCircle size={15} fill="currentColor" /> {video.danmaku}</span>
          <b>{video.duration}</b>
        </div>
        {!compact && (
          <button
            className={`watch-later ${watchLater ? 'saved' : ''}`}
            aria-label="稍后再看"
            title={watchLater ? '已加入稍后再看' : '稍后再看'}
            onClick={(event) => { event.stopPropagation(); setWatchLater(!watchLater) }}
          ><Clock3 size={18} /></button>
        )}
        {hovered && !compact && <div className="preview-label">预览中</div>}
      </div>
      <div className="card-info">
        <Link className="video-title" to={`/video/${video.id}`}>{video.title}</Link>
        <div className="author-line"><span className="up-badge">UP</span> {video.author}<span> · {video.date}</span></div>
      </div>
    </article>
  )
}

function HomePage() {
  const location = useLocation()
  const [categories, setCategories] = useState<string[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [activeCategory, setActiveCategory] = useState('首页')
  const [search, setSearch] = useState(new URLSearchParams(location.search).get('search') || '')
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const { notice, showNotice } = useNotice()

  useEffect(() => {
    fetch('/api/categories').then((res) => res.json()).then((data) => setCategories(data.items || []))
  }, [])

  useEffect(() => {
    setLoading(true)
    const query = new URLSearchParams({ category: activeCategory, search })
    fetch(`/api/videos?${query}`).then((res) => res.json()).then((data) => {
      const items = data.items || []
      setVideos(refreshKey % 2 ? [...items].reverse() : items)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [activeCategory, search, refreshKey])

  const hero = videos[0]
  const cards = videos.slice(hero ? 1 : 0)

  return (
    <div className="home-page">
      <Header onSearch={(value) => { setSearch(value); setActiveCategory('首页') }} />
      <section className="hero-banner">
        <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2200&q=88" alt="雪山与天空" />
        <div className="hero-sky" />
        <Link to="/" className="bili-logo"><span>bili</span>bili</Link>
        <div className="hero-copy"><span>在这里，遇见每一种热爱</span></div>
      </section>

      <main className="home-main">
        <section className="channel-bar">
          <div className="channel-shortcuts">
            <button onClick={() => showNotice('动态功能演示')}><span className="round-icon pink"><Users /></span>动态</button>
            <button onClick={() => { setActiveCategory('首页'); setRefreshKey((key) => key + 1) }}><span className="round-icon blue"><Flame /></span>热门</button>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <button className={activeCategory === category ? 'active' : ''} key={category} onClick={() => { setActiveCategory(category); setSearch('') }}>{category}</button>
            ))}
          </div>
          <div className="side-channels">
            {['专栏', '直播', '活动', '课堂', '社区中心', '新歌热榜'].map((item) => <button key={item}>{item}</button>)}
          </div>
        </section>

        {(search || activeCategory !== '首页') && (
          <div className="filter-summary">
            <div><strong>{search ? `“${search}” 的搜索结果` : activeCategory}</strong><span> · {videos.length} 个视频</span></div>
            <button onClick={() => { setSearch(''); setActiveCategory('首页') }}>清除筛选</button>
          </div>
        )}

        {loading ? (
          <div className="loading-grid">{Array.from({ length: 10 }).map((_, i) => <div className="skeleton" key={i}><i /><b /><span /></div>)}</div>
        ) : videos.length ? (
          <section className="feed-grid">
            {hero && (
              <article className="featured-card" onClick={() => window.location.assign(`/video/${hero.id}`)}>
                <img src={hero.cover} alt="" />
                <div className="featured-shade" />
                <div className="featured-content"><span>编辑精选 · {hero.category}</span><h2>{hero.title}</h2><p><Play size={15} fill="currentColor" /> {hero.views} 人正在看</p></div>
                <div className="carousel-dots"><i className="active" /><i /><i /><i /><i /></div>
              </article>
            )}
            {cards.map((video) => <VideoCard video={video} key={video.id} />)}
          </section>
        ) : (
          <div className="no-results"><Search size={42} /><h2>没有找到相关视频</h2><p>换个关键词或分类看看吧</p><button onClick={() => { setSearch(''); setActiveCategory('首页') }}>返回推荐</button></div>
        )}
        {videos.length > 0 && <button className="refresh-button" onClick={() => setRefreshKey((key) => key + 1)}><RefreshCw size={18} /> 换一换</button>}
      </main>
      {notice && <div className="toast">{notice}</div>}
    </div>
  )
}

function StatButton({ icon: Icon, value, label, active, onClick }: { icon: typeof ThumbsUp; value: string; label: string; active?: boolean; onClick: () => void }) {
  return <button className={active ? 'active' : ''} onClick={onClick}><Icon size={25} fill={active ? 'currentColor' : 'none'} /><span>{value}</span><small>{label}</small></button>
}

function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [video, setVideo] = useState<VideoItem | null>(null)
  const [allVideos, setAllVideos] = useState<VideoItem[]>([])
  const [error, setError] = useState('')
  const [liked, setLiked] = useState(false)
  const [coined, setCoined] = useState(false)
  const [favored, setFavored] = useState(false)
  const [following, setFollowing] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<string[]>(['画面和音乐都好舒服，已经三连了！', '这种认真做内容的 UP 主值得被看见。'])
  const { notice, showNotice } = useNotice()

  useEffect(() => {
    setVideo(null); setError(''); window.scrollTo(0, 0)
    Promise.all([
      fetch(`/api/videos/${id}`).then(async (res) => { if (!res.ok) throw new Error((await res.json()).message); return res.json() }),
      fetch('/api/videos').then((res) => res.json())
    ]).then(([current, list]) => { setVideo(current); setAllVideos(list.items || []) }).catch((err) => setError(err.message))
  }, [id])

  const related = useMemo(() => allVideos.filter((item) => item.id !== id).slice(0, 6), [allVideos, id])

  if (error) return <><Header /><div className="error-page"><h1>404</h1><p>{error}</p><Link to="/">返回首页</Link></div></>
  if (!video) return <><Header /><div className="detail-loading">正在加载视频…</div></>

  const addComment = () => {
    if (!comment.trim()) return showNotice('先写点什么吧')
    setComments([comment.trim(), ...comments]); setComment(''); showNotice('评论发布成功')
  }

  return (
    <div className="detail-page">
      <Header />
      <main className="detail-main">
        <button className="back-link" onClick={() => navigate(-1)}><ChevronDown size={16} /> 返回</button>
        <div className="video-layout">
          <section className="player-column">
            <h1>{video.title}</h1>
            <div className="video-meta"><span><Play size={15} /> {video.views}播放</span><span><MessageCircle size={15} /> {video.danmaku}弹幕</span><span>{video.date}</span><span className="copyright">未经作者授权，禁止转载</span></div>
            <div className="player-shell">
              <video controls autoPlay poster={video.cover} src={video.source}>你的浏览器不支持视频播放。</video>
            </div>
            <div className="danmaku-bar"><span>{video.danmaku} 条弹幕</span><label><input type="checkbox" defaultChecked /> 弹幕礼仪</label><input placeholder="发个友善的弹幕见证当下" /><button onClick={() => showNotice('弹幕发送成功')}>发送</button></div>
            <div className="action-row">
              <StatButton icon={ThumbsUp} value={video.likes} label="点赞" active={liked} onClick={() => setLiked(!liked)} />
              <StatButton icon={Coins} value={video.coins} label="投币" active={coined} onClick={() => setCoined(!coined)} />
              <StatButton icon={Star} value={video.favorites} label="收藏" active={favored} onClick={() => setFavored(!favored)} />
              <button onClick={() => { navigator.clipboard?.writeText(window.location.href); showNotice('链接已复制') }}><MoreHorizontal size={25} /><span>分享</span><small>分享</small></button>
            </div>
            <p className="description">{video.description}</p>
            <div className="tag-list">{video.tags.map((tag) => <button key={tag}>{tag}</button>)}</div>
            <div className="comment-section">
              <h2>评论 <small>{comments.length}</small></h2>
              <div className="comment-editor"><img src={video.avatar} alt="" /><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="发一条友善的评论" /><button onClick={addComment}>发布</button></div>
              {comments.map((item, index) => <div className="comment" key={item + index}><div className="comment-avatar">{index === 0 ? 'B' : '小'}</div><div><b>{index === 0 ? '哔哩小伙伴' : '路过的观众'}</b><p>{item}</p><span>今天 · <ThumbsUp size={13} /> {32 + index * 19}</span></div></div>)}
            </div>
          </section>

          <aside className="side-column">
            <div className="author-card"><img src={video.avatar} alt={video.author} /><div><strong>{video.author}</strong><p>分享有趣、有用、有温度的内容</p><button className={following ? 'following' : ''} onClick={() => setFollowing(!following)}>{following ? '已关注' : '+ 关注 12.8万'}</button></div></div>
            <div className="related-title"><h3>相关推荐</h3><button><RefreshCw size={14} /> 换一换</button></div>
            <div className="related-list">{related.map((item) => <VideoCard video={item} compact key={item.id} />)}</div>
          </aside>
        </div>
      </main>
      {notice && <div className="toast">{notice}</div>}
    </div>
  )
}

export default function App() {
  return <Routes><Route path="/" element={<HomePage />} /><Route path="/video/:id" element={<DetailPage />} /><Route path="*" element={<HomePage />} /></Routes>
}
