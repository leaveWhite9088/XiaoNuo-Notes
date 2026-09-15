import { Link } from 'react-router-dom';
import { useState } from 'react';
import SearchBox from './SearchBox.jsx';

const NAV_LINKS = ['首页', '番剧', '直播', '游戏中心', '会员购', '漫画', '赛事'];
const RIGHT_ICONS = ['大会员', '消息', '动态', '收藏', '历史', '创作中心'];
const USER_MENU = ['个人中心', '投稿管理', '我的钱包', '直播中心', '我的收藏夹', '退出登录'];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="logo" title="哔哩哔哩">
          <svg viewBox="0 0 32 32" width="30" height="30" className="logo-icon">
            <rect x="2" y="7" width="28" height="21" rx="5" fill="#fb7299" />
            <path d="M9 2l4 5M23 2l-4 5" stroke="#fb7299" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="11.5" cy="16" r="2.2" fill="#fff" />
            <circle cx="20.5" cy="16" r="2.2" fill="#fff" />
            <path d="M12 21.5c1.4 1.6 6.6 1.6 8 0" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
          <span className="logo-text">哔哩哔哩</span>
        </Link>

        <nav className="header-nav">
          {NAV_LINKS.map((n, i) => (
            <Link key={n} to="/" className={`nav-link ${i === 0 ? 'on' : ''}`}>
              {n}
            </Link>
          ))}
        </nav>

        <SearchBox />

        <div className="header-right">
          <div
            className="avatar-wrap"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <img
              className="header-avatar"
              src="https://picsum.photos/seed/me-avatar/80/80"
              alt="我的头像"
            />
            {menuOpen && (
              <div className="user-menu">
                <div className="user-menu-name">bili_260909</div>
                <div className="user-menu-level">LV5 · 年度大会员</div>
                {USER_MENU.map((m) => (
                  <div key={m} className="user-menu-item">{m}</div>
                ))}
              </div>
            )}
          </div>
          {RIGHT_ICONS.map((n) => (
            <span key={n} className="right-link">{n}</span>
          ))}
          <button className="upload-btn">投稿</button>
        </div>
      </div>
    </header>
  );
}
