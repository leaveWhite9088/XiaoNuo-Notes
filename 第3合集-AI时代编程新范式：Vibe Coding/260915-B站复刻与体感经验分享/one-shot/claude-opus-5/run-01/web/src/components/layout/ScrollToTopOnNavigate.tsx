import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** 路由切换时回到页面顶部（首页 → 播放页 → 返回首页 体验一致）。 */
export function ScrollToTopOnNavigate() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname, search]);
  return null;
}
