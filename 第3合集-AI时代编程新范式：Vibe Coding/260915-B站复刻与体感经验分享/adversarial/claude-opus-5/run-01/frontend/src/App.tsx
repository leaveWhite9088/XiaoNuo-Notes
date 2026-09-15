import { Outlet, useLocation } from 'react-router-dom';
import { HeaderBar } from './components/layout/HeaderBar';
import { SideTools } from './components/layout/SideTools';
import { AppFooter } from './components/layout/AppFooter';
import { useEffect } from 'react';

export function App() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  // 路由切换回到顶部（首页 -> 详情 -> 返回首页 的滚动体验与 B 站一致）
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <>
      <HeaderBar variant={isHome ? 'transparent' : 'solid'} />
      <main className="app-main">
        <Outlet />
      </main>
      <AppFooter />
      <SideTools />
    </>
  );
}
