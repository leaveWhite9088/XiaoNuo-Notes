import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import { Icon, type IconName } from '../common/Icon';
import { Logo } from '../common/Logo';
import { HoverPanel } from '../common/HoverPanel';
import { SearchBox } from '../search/SearchBox';
import { UserPanel } from './UserPanel';
import { MiniVideoList } from './MiniVideoList';
import { ChannelMenu } from './ChannelMenu';
import './HeaderBar.css';

const LEFT_LINKS: { label: string; icon?: IconName; to?: string }[] = [
  { label: '首页', icon: 'home', to: '/' },
  { label: '番剧', icon: 'tv' },
  { label: '直播', icon: 'live' },
  { label: '游戏中心', icon: 'game' },
  { label: '会员购', icon: 'shop' },
  { label: '漫画', icon: 'manga' },
  { label: '赛事', icon: 'match' },
  { label: '下载客户端', icon: 'download' },
];

interface HeaderBarProps {
  /** 首页顶栏浮在头图上，滚动后变白；其它页面固定白底 */
  variant: 'transparent' | 'solid';
}

export function HeaderBar({ variant }: HeaderBarProps) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solid = variant === 'solid' || scrolled;

  return (
    <header className={`header ${solid ? 'header--solid' : 'header--transparent'}`}>
      <div className="header__inner">
        <nav className="header__left">
          <Link className="header__logo" to="/" aria-label="返回首页">
            <Logo size={28} color={solid ? '#fb7299' : '#ffffff'} />
            <span className="header__logo-text">bilibili</span>
          </Link>

          {LEFT_LINKS.map((link) =>
            link.label === '首页' ? (
              <HoverPanel
                key={link.label}
                align="left"
                width={560}
                panelClassName="header__panel"
                trigger={
                  <Link className="header__link" to={link.to ?? '/'}>
                    {link.icon && <Icon name={link.icon} size={16} />}
                    <span>{link.label}</span>
                  </Link>
                }
              >
                <ChannelMenu onPick={(id) => navigate(id === 'all' ? '/' : `/?channel=${id}`)} />
              </HoverPanel>
            ) : link.label === '下载客户端' ? (
              <HoverPanel
                key={link.label}
                width={180}
                panelClassName="header__panel header__panel--qr"
                trigger={
                  <button className="header__link">
                    {link.icon && <Icon name={link.icon} size={16} />}
                    <span>{link.label}</span>
                  </button>
                }
              >
                <div className="header__qr">
                  <div className="header__qr-code">
                    <Icon name="tv" size={56} />
                  </div>
                  <p>扫一扫下载</p>
                  <span>APP 内打开体验更佳</span>
                </div>
              </HoverPanel>
            ) : (
              <button
                key={link.label}
                className="header__link"
                title={`${link.label}（演示站点仅首页与视频详情可用）`}
              >
                {link.icon && <Icon name={link.icon} size={16} />}
                <span>{link.label}</span>
              </button>
            ),
          )}
        </nav>

        <div className="header__center">
          <SearchBox />
        </div>

        <div className="header__right">
          <HoverPanel
            align="right"
            width={330}
            panelClassName="header__panel"
            trigger={
              <button className="header__avatar" aria-label="个人中心">
                <img src="/media/avatars/mine.jpg" alt="我的头像" onError={hideBrokenAvatar} />
                <span className="header__avatar-fallback">我</span>
              </button>
            }
          >
            <UserPanel />
          </HoverPanel>

          <button className="header__entry header__entry--vip">
            <Icon name="vip" size={18} />
            <span>大会员</span>
          </button>

          <HoverPanel
            align="right"
            width={220}
            panelClassName="header__panel"
            trigger={
              <button className="header__entry">
                <Icon name="message" size={18} />
                <span>消息</span>
              </button>
            }
          >
            <ul className="header__simple-menu">
              {['回复我的', '@ 我的', '收到的赞', '系统消息', '我的消息'].map((t) => (
                <li key={t}>
                  <button>{t}</button>
                </li>
              ))}
            </ul>
          </HoverPanel>

          <HoverPanel
            align="right"
            width={240}
            panelClassName="header__panel"
            trigger={
              <button className="header__entry">
                <Icon name="dynamic" size={18} />
                <span>动态</span>
              </button>
            }
          >
            <ul className="header__simple-menu">
              {['全部动态', '视频投稿', '追番追剧', '专栏', '直播'].map((t) => (
                <li key={t}>
                  <button>{t}</button>
                </li>
              ))}
            </ul>
          </HoverPanel>

          <FavoritePanelEntry />
          <HistoryPanelEntry />

          <button className="header__entry">
            <Icon name="upload" size={18} />
            <span>创作中心</span>
          </button>

          <button className="header__upload">
            <Icon name="upload" size={16} />
            <span>投稿</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function FavoritePanelEntry() {
  const [enabled, setEnabled] = useState(false);
  const { data = [], isLoading } = useQuery({
    queryKey: ['me', 'favorites'],
    queryFn: api.favorites,
    enabled,
  });
  return (
    <HoverPanel
      align="right"
      width={330}
      panelClassName="header__panel"
      onOpen={() => setEnabled(true)}
      trigger={
        <button className="header__entry">
          <Icon name="star" size={18} />
          <span>收藏</span>
        </button>
      }
    >
      <MiniVideoList
        title="我的收藏"
        items={data}
        loading={isLoading}
        emptyText="还没有收藏，去视频详情页点个收藏试试"
      />
    </HoverPanel>
  );
}

function HistoryPanelEntry() {
  const [enabled, setEnabled] = useState(false);
  const { data = [], isLoading } = useQuery({
    queryKey: ['me', 'history'],
    queryFn: api.history,
    enabled,
  });
  return (
    <HoverPanel
      align="right"
      width={330}
      panelClassName="header__panel"
      onOpen={() => setEnabled(true)}
      trigger={
        <button className="header__entry">
          <Icon name="history" size={18} />
          <span>历史</span>
        </button>
      }
    >
      <MiniVideoList
        title="观看历史"
        items={data}
        loading={isLoading}
        emptyText="还没有观看记录"
      />
    </HoverPanel>
  );
}

function hideBrokenAvatar(event: React.SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.style.display = 'none';
}
