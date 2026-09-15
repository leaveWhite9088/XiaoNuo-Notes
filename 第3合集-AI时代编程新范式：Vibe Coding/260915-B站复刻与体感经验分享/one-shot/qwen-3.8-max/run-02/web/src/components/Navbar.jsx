import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

const NAV_ITEMS = [
  { label: '首页', to: '/' },
  { label: '番剧', to: '/?category=动画' },
  { label: '直播', to: '/?category=音乐' },
  { label: '游戏中心', to: '/?category=游戏' },
  { label: '会员购', to: '/?category=时尚' },
  { label: '下载客户端', to: '/?category=知识' }
];

const PARTITION_MENU = ['动画', '游戏', '科技', '音乐', '舞蹈', '美食', '生活', '知识', '时尚'];

export default function Navbar() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const [activeSug, setActiveSug] = useState(-1);
  const sugTimer = useRef(null);
  const boxRef = useRef(null);

  // 输入防抖拉取搜索建议
  useEffect(() => {
    clearTimeout(sugTimer.current);
    if (!keyword.trim()) {
      setSuggestions([]);
      return;
    }
    sugTimer.current = setTimeout(async () => {
      try {
        const data = await api.suggestions(keyword);
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(sugTimer.current);
  }, [keyword]);

  // 点击外部关闭建议面板
  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setShowSug(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const doSearch = (kw) => {
    const q = (kw ?? keyword).trim();
    setShowSug(false);
    navigate(q ? `/?keyword=${encodeURIComponent(q)}` : '/');
  };

  const onSugKeyDown = (e) => {
    if (!showSug || suggestions.length === 0) {
      if (e.key === 'Enter') doSearch();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSug((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSug((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      doSearch(activeSug >= 0 ? suggestions[activeSug] : keyword);
      setActiveSug(-1);
    } else if (e.key === 'Escape') {
      setShowSug(false);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo" title="返回首页">
          <svg viewBox="0 0 64 64" width="42" height="42" aria-hidden>
            <rect x="6" y="16" width="52" height="40" rx="10" fill="#FB7299" />
            <path d="M18 4 L30 16 M46 4 L34 16" stroke="#FB7299" strokeWidth="5" strokeLinecap="round" fill="none" />
            <circle cx="24" cy="32" r="4" fill="#fff" />
            <circle cx="40" cy="32" r="4" fill="#fff" />
            <rect x="22" y="42" width="20" height="4" rx="2" fill="#fff" />
          </svg>
          <span className="logo-text">bilibili</span>
        </Link>

        <nav className="nav-links">
          {NAV_ITEMS.map((it) => (
            <Link key={it.label} to={it.to} className="nav-link">
              {it.label}
            </Link>
          ))}
        </nav>

        {/* 分区下拉菜单 */}
        <div className="menu-dropdown">
          <button className="menu-trigger" type="button">
            <span className="menu-icon">☰</span> 分区
          </button>
          <div className="menu-panel">
            {PARTITION_MENU.map((c) => (
              <Link key={c} to={`/?category=${encodeURIComponent(c)}`} className="menu-item" onClick={() => setShowSug(false)}>
                {c}
              </Link>
            ))}
          </div>
        </div>

        {/* 搜索框 + 搜索建议 */}
        <div className="search-box" ref={boxRef}>
          <input
            className="search-input"
            type="text"
            placeholder="搜视频、UP主、标签"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setShowSug(true);
              setActiveSug(-1);
            }}
            onFocus={() => setShowSug(true)}
            onKeyDown={onSugKeyDown}
          />
          <button className="search-btn" onClick={() => doSearch()} title="搜索" aria-label="搜索">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
              <path d="M10 2a8 8 0 105.3 14l5 5 1.4-1.4-5-5A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z" fill="currentColor" />
            </svg>
          </button>
          {showSug && keyword.trim() && suggestions.length > 0 && (
            <ul className="sug-panel">
              {suggestions.map((s, i) => (
                <li
                  key={s}
                  className={`sug-item ${i === activeSug ? 'active' : ''}`}
                  onMouseEnter={() => setActiveSug(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setKeyword(s);
                    doSearch(s);
                  }}
                >
                  <span className="sug-icon">🔍</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 头像 + 悬停菜单 */}
        <div className="menu-dropdown avatar-wrap">
          <img className="avatar" src="https://i.pravatar.cc/64?img=68" alt="我的头像" />
          <div className="menu-panel avatar-panel">
            <div className="avatar-panel-head">
              <img src="https://i.pravatar.cc/64?img=68" alt="" />
              <div>
                <p className="avatar-name">复刻菌</p>
                <p className="avatar-sub">LV6 · 正式会员</p>
              </div>
            </div>
            {['个人中心', '历史记录', '我的收藏', '稍后再看', '离线缓存', '退出登录'].map((m) => (
              <span key={m} className="menu-item">{m}</span>
            ))}
          </div>
        </div>

        <button className="upload-btn" type="button">投稿</button>
      </div>
    </header>
  );
}
