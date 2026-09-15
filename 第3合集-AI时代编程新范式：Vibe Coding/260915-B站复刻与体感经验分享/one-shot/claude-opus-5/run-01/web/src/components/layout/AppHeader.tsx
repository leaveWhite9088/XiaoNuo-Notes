/**
 * 全站顶栏。首页在页面顶部时为「悬浮透明」态（叠在首页顶部背景图上），
 * 向下滚动后切换为白色实心固定栏，与 B 站行为一致。
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BiliLogo } from '../common/BiliLogo';
import { SearchBox } from './SearchBox';
import { UserZone } from './UserZone';
import { useConfig } from '../../context/ConfigContext';
import './header.css';

interface Props {
  /** 页面顶部是否悬浮透明（首页使用） */
  floating?: boolean;
  searchKeyword?: string;
}

export function AppHeader({ floating = false, searchKeyword = '' }: Props) {
  const { config } = useConfig();
  const [solid, setSolid] = useState(!floating);

  useEffect(() => {
    if (!floating) {
      setSolid(true);
      return;
    }
    const onScroll = () => setSolid(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [floating]);

  return (
    <header className={`header ${solid ? 'header--solid' : 'header--float'}`}>
      <div className="header__inner">
        <div className="header__left">
          <Link to="/" className="header__logo" title="哔哩哔哩 (゜-゜)つロ 干杯~-bilibili">
            <BiliLogo size={26} />
          </Link>
          <nav className="header__nav">
            {config.primaryNav.map((item) => (
              <Link key={item.id} to={item.href} className="header__nav-item">
                {item.name}
              </Link>
            ))}
            <a className="header__nav-item" href="#download">
              下载客户端
            </a>
          </nav>
        </div>

        <div className="header__center">
          <SearchBox initialKeyword={searchKeyword} />
        </div>

        <div className="header__right">
          <UserZone />
        </div>
      </div>
    </header>
  );
}
