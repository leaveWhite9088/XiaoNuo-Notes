import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Clock3, Download, Gamepad2, History, Search, Star, Upload, UserRound } from 'lucide-react'

const leftLinks = ['首页', '番剧', '直播', '游戏中心', '会员购', '漫画', '赛事']

export default function Header({ compact = false }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [suggestionState, setSuggestionState] = useState({ status: 'idle', suggestions: [], error: '' })
  const [suggestionRetry, setSuggestionRetry] = useState(0)
  const [focused, setFocused] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const suggestionRequestId = useRef(0)
  const noticeTimer = useRef(null)

  useEffect(() => setQuery(searchParams.get('q') || ''), [searchParams])

  useEffect(() => {
    if (!focused) return
    const requestId = ++suggestionRequestId.current
    const controller = new AbortController()
    setSuggestionState((current) => ({ ...current, status: 'loading', error: '' }))

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search/suggest?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        if (!response.ok) throw new Error(`搜索建议加载失败（${response.status}）`)
        const data = await response.json()
        if (requestId !== suggestionRequestId.current) return
        setSuggestionState({ status: 'success', suggestions: data.suggestions, error: '' })
      } catch (error) {
        if (error.name === 'AbortError' || requestId !== suggestionRequestId.current) return
        setSuggestionState({ status: 'error', suggestions: [], error: error.message || '搜索建议加载失败' })
      }
    }, 160)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query, focused, suggestionRetry])

  const announce = (message) => {
    window.clearTimeout(noticeTimer.current)
    setNotice(message)
    noticeTimer.current = window.setTimeout(() => setNotice(''), 2200)
  }

  const submitSearch = (value = query) => {
    const finalQuery = typeof value === 'string' ? value.trim() : query.trim()
    if (!finalQuery) {
      announce('请输入搜索内容')
      return
    }
    navigate(`/?q=${encodeURIComponent(finalQuery)}`)
    setFocused(false)
  }

  const handleNav = (item) => {
    if (item === '首页') navigate('/')
    else announce(`${item}为界面演示入口`)
  }

  const handleSearchBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
  }

  return (
    <header className={`top-header ${compact ? 'top-header--compact' : ''}`}>
      <div className="header-shade" />
      <nav className="top-nav" aria-label="主导航">
        <div className="nav-left">
          <button type="button" className="nav-home" onClick={() => navigate('/')} aria-label="返回首页"><span className="bili-mini">bilibili</span></button>
          {leftLinks.map((item) => <button type="button" key={item} className="nav-link" onClick={() => handleNav(item)}>{item}</button>)}
          <button type="button" className="nav-link" onClick={() => announce('客户端下载安装为演示入口')}><Download size={15} /> 下载客户端</button>
        </div>

        <form className={`search-box ${focused ? 'is-focused' : ''}`} onSubmit={(event) => { event.preventDefault(); submitSearch() }} onBlur={handleSearchBlur}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setFocused(true)} placeholder="今天想看点什么？" aria-label="搜索视频" aria-expanded={focused} aria-controls="search-suggestions" autoComplete="off" />
          <button type="submit" className="search-button" aria-label="全站搜索"><Search size={20} /></button>
          {focused && (
            <div className="suggestion-panel" id="search-suggestions" role="listbox" onMouseDown={(event) => event.preventDefault()}>
              <div className="suggestion-title">{query ? '全站搜索建议' : '大家都在搜'}</div>
              {suggestionState.status === 'loading' ? <div className="no-suggestion">正在加载建议…</div> : null}
              {suggestionState.status === 'error' ? <div className="suggestion-error" role="alert"><span>{suggestionState.error}</span><button type="button" onClick={() => setSuggestionRetry((current) => current + 1)}>重试</button></div> : null}
              {suggestionState.status === 'success' && suggestionState.suggestions.length ? suggestionState.suggestions.map((item, index) => {
                const label = typeof item === 'string' ? item : item.title
                return <button type="button" role="option" aria-selected="false" key={typeof item === 'string' ? item : item.id} onClick={() => submitSearch(label)}><span className={`rank rank-${index + 1}`}>{index + 1}</span><span>{label}</span>{typeof item !== 'string' && <em>{item.category}</em>}</button>
              }) : null}
              {suggestionState.status === 'success' && !suggestionState.suggestions.length ? <div className="no-suggestion">没有找到相关内容</div> : null}
            </div>
          )}
        </form>

        <div className="nav-right">
          <div className="profile-wrap" onMouseEnter={() => setProfileOpen(true)} onMouseLeave={() => setProfileOpen(false)} onFocus={() => setProfileOpen(true)} onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setProfileOpen(false)}>
            <button type="button" className="avatar" aria-label="个人中心" aria-expanded={profileOpen}><UserRound size={19} /></button>
            {profileOpen && <div className="profile-menu"><strong>登录后你可以：</strong><span><History size={16} /> 免费观看高清视频</span><span><Clock3 size={16} /> 多端同步播放记录</span><span><Star size={16} /> 发表弹幕与评论</span><button type="button" onClick={() => announce('登录功能为演示状态')}>立即登录</button><small>首次使用？<button type="button" className="text-button" onClick={() => announce('注册功能为演示状态')}>点我注册</button></small></div>}
          </div>
          <button type="button" className="nav-icon" onClick={() => announce('动态为演示入口')}><Gamepad2 size={20} /><span>动态</span></button>
          <button type="button" className="nav-icon" onClick={() => announce('收藏为演示入口')}><Star size={20} /><span>收藏</span></button>
          <button type="button" className="nav-icon" onClick={() => announce('历史为演示入口')}><History size={20} /><span>历史</span></button>
          <button type="button" className="upload-button" onClick={() => announce('投稿为演示入口')}><Upload size={18} /> 投稿</button>
        </div>
      </nav>
      {!compact && <button type="button" className="brand-lockup" onClick={() => navigate('/')} aria-label="bilibili 首页"><span className="brand-icon">▰</span><span className="brand-text">bilibili</span></button>}
      {notice ? <div className="demo-toast" role="status">{notice}</div> : null}
      <div className="sr-only" aria-live="polite">{notice}</div>
    </header>
  )
}
