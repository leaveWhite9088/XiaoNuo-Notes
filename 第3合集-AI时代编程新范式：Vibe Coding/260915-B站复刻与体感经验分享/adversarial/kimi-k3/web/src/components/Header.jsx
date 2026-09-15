import { useEffect, useRef, useState } from 'react'
import { api } from '../api.js'

export default function Header({ onLogoClick, onToggleSidebar, onSearch }) {
  const [input, setInput] = useState('')
  const [suggests, setSuggests] = useState([])
  const [showSuggests, setShowSuggests] = useState(false)
  const timer = useRef(null)
  const boxRef = useRef(null)

  useEffect(() => {
    if (!input.trim()) {
      setSuggests([])
      return
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      try {
        setSuggests(await api.suggest(input.trim()))
      } catch {
        setSuggests([])
      }
    }, 200)
    return () => clearTimeout(timer.current)
  }, [input])

  useEffect(() => {
    const onClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setShowSuggests(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const submit = (q) => {
    const kw = (q ?? input).trim()
    setShowSuggests(false)
    if (!kw) return
    setInput(kw)
    onSearch(kw)
  }

  return (
    <header className="header">
      <div className="header-left">
        <button className="icon-btn" onClick={onToggleSidebar} title="展开/收起菜单" aria-label="菜单">
          <span className="hamburger" />
        </button>
        <button className="logo" onClick={onLogoClick} title="哔哩哔哩首页">
          <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
            <rect x="2" y="7" width="28" height="21" rx="5" fill="#FB7299" />
            <path d="M9 2l5 5M23 2l-5 5" stroke="#FB7299" strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="11.5" cy="17" r="2.4" fill="#fff" />
            <circle cx="20.5" cy="17" r="2.4" fill="#fff" />
            <path d="M12.5 22.5c1.2 1.2 2.3 1.2 3.5 0 1.2 1.2 2.3 1.2 3.5 0" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </svg>
          <span className="logo-text">哔哩哔哩</span>
        </button>
      </div>

      <div className="search-box" ref={boxRef}>
        <div className="search-input-wrap">
          <input
            className="search-input"
            placeholder="搜索视频、UP主"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setShowSuggests(true)
            }}
            onFocus={() => setShowSuggests(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit()
              if (e.key === 'Escape') setShowSuggests(false)
            }}
          />
          {input && (
            <button
              className="search-clear"
              onClick={() => {
                setInput('')
                setSuggests([])
                onSearch('')
              }}
              aria-label="清空"
            >
              ×
            </button>
          )}
          <button className="search-btn" onClick={() => submit()} aria-label="搜索">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </button>
        </div>
        {showSuggests && suggests.length > 0 && (
          <ul className="suggest-list">
            {suggests.map((s) => (
              <li key={s}>
                <button onClick={() => submit(s)}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" />
                  </svg>
                  <span dangerouslySetInnerHTML={{ __html: highlight(s, input) }} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="header-right">
        <button className="header-link">大会员</button>
        <button className="header-link">消息</button>
        <button className="header-link">动态</button>
        <button className="header-link">收藏</button>
        <button className="avatar-btn" title="个人中心">
          <img src="https://picsum.photos/seed/bili-me/80/80" alt="我的头像" />
        </button>
        <button className="upload-btn">投稿</button>
      </div>
    </header>
  )
}

function highlight(text, kw) {
  if (!kw) return escapeHtml(text)
  const t = escapeHtml(text)
  const k = escapeHtml(kw.trim())
  if (!k) return t
  return t.replaceAll(k, `<em>${k}</em>`)
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}
