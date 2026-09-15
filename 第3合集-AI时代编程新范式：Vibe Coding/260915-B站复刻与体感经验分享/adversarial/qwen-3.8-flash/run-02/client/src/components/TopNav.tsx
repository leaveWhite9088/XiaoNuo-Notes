import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { FaceImg } from './FallbackImg';
import type { Category } from '../types';
import { showToast } from '../utils/toast';
import { IconChevronDown, IconDynamic, IconHistory, IconLike, IconLogo, IconMsg, IconStar } from './icons';
import SearchBox from './SearchBox';

const NOOP_LINKS = ['番剧', '直播', '游戏中心', '会员购', '漫画', '赛事'];
const USER_MENU = ['个人空间', '我的消息', '创作中心', '收藏调度', '大会员', '退出登录'];

/** 可键盘触发的下拉菜单项（Tab 聚焦 + Enter/空格 执行） */
function MenuItem({ children, onClick, active }: { children: ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <li
      role="menuitem"
      tabIndex={0}
      className={active ? 'zone-active' : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </li>
  );
}

const noop = (label: string) => () => showToast(`「${label}」为 V0 复刻展示入口`);

export default function TopNav() {
  const [cats, setCats] = useState<Category[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const cat = new URLSearchParams(location.search).get('cat') || 'tuijian';
  const atHome = location.pathname === '/';

  useEffect(() => {
    api.categories().then(setCats).catch(() => setCats([]));
  }, []);

  const toZone = (c: Category) => {
    if (c.id === 'tuijian') navigate('/');
    else navigate(`/?cat=${c.id}`);
  };

  return (
    <header className="topnav">
      <div className="topnav-inner">
        <div className="topnav-left">
          <Link to="/" className="logo" title="回到首页">
            <IconLogo />
            <span className="logo-text">bilibili</span>
          </Link>
          <nav className="main-links" aria-label="主导航">
            <Link to="/" className={atHome && cat === 'tuijian' ? 'nav-active' : ''}>
              首页
            </Link>
            {NOOP_LINKS.map((t) => (
              <button key={t} onClick={noop(t)}>
                {t}
              </button>
            ))}
          </nav>
          <div className="menu zone-menu">
            <button className="menu-btn" aria-haspopup="true">
              分区 <IconChevronDown width={14} height={14} />
            </button>
            <ul className="dropdown zone-dropdown" role="menu" aria-label="分区菜单">
              {cats.map((c) => (
                <MenuItem key={c.id} active={atHome && cat === c.id} onClick={() => toZone(c)}>
                  <span>{c.name}</span>
                  <em>{c.count}</em>
                </MenuItem>
              ))}
            </ul>
          </div>
        </div>

        <div className="topnav-center">
          <SearchBox />
        </div>

        <div className="topnav-right">
          <div className="icon-menu menu">
            <button className="menu-btn icon-btn" title="消息" aria-haspopup="true">
              <IconMsg />
            </button>
            <ul className="dropdown" role="menu">
              <MenuItem onClick={noop('消息中心')}>消息列表</MenuItem>
              <MenuItem onClick={noop('消息中心')}>回复我的</MenuItem>
              <MenuItem onClick={noop('消息中心')}>收到的赞</MenuItem>
            </ul>
          </div>
          <div className="icon-menu menu">
            <button className="menu-btn icon-btn" title="动态" aria-haspopup="true">
              <IconDynamic />
            </button>
            <ul className="dropdown" role="menu">
              <MenuItem onClick={noop('关注动态')}>我的关注</MenuItem>
              <MenuItem onClick={noop('投稿动态')}>最近投稿</MenuItem>
            </ul>
          </div>
          <div className="icon-menu menu">
            <button className="menu-btn icon-btn" title="收藏" aria-haspopup="true">
              <IconStar />
            </button>
            <ul className="dropdown" role="menu">
              <MenuItem onClick={noop('我的收藏')}>我的收藏</MenuItem>
              <MenuItem onClick={noop('稍后再看')}>稍后再看</MenuItem>
            </ul>
          </div>
          <div className="icon-menu menu">
            <button className="menu-btn icon-btn" title="历史" aria-haspopup="true">
              <IconHistory />
            </button>
            <ul className="dropdown" role="menu">
              <MenuItem onClick={noop('观看历史')}>观看历史</MenuItem>
            </ul>
          </div>
          <div className="user-menu menu">
            <button className="menu-btn avatar-btn" aria-haspopup="true">
              <FaceImg
                className="avatar"
                src="https://i0.hdslb.com/bfs/face/member/noface.jpg"
                alt="用户头像"
              />
              <span className="user-name">未登录</span>
              <IconChevronDown width={14} height={14} />
            </button>
            <ul className="dropdown user-dropdown" role="menu">
              <li className="user-head">
                <img src="https://i0.hdslb.com/bfs/face/member/noface.jpg" alt="" referrerPolicy="no-referrer" />
                <div>
                  <b>演示用户</b>
                  <i>Lv0 · 模拟登录态</i>
                </div>
              </li>
              {USER_MENU.map((t) => (
                <MenuItem key={t} onClick={() => showToast(`「${t}」为 V0 展示项`)}>
                  {t}
                </MenuItem>
              ))}
            </ul>
          </div>
          <button className="vip-btn" onClick={noop('充值中心')}>
            <IconLike width={14} height={14} /> 大会员
          </button>
        </div>
      </div>
    </header>
  );
}
