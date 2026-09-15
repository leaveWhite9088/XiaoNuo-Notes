import { Link } from 'react-router-dom';
import { AppHeader } from '../components/layout/AppHeader';
import { AppFooter } from '../components/layout/AppFooter';

export function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: 'var(--header-height)' }}>
      <AppHeader />
      <div style={{ padding: '120px 0', textAlign: 'center', color: 'var(--text-2)' }}>
        <p style={{ fontSize: 20, marginBottom: 12 }}>(⊙﹏⊙) 页面走丢了</p>
        <Link to="/" style={{ color: 'var(--brand-pink)' }}>
          返回首页
        </Link>
      </div>
      <AppFooter />
    </div>
  );
}
