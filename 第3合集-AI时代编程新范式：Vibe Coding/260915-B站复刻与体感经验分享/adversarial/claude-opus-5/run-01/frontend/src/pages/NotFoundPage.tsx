import { Link } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import './NotFoundPage.css';

export function NotFoundPage() {
  return (
    <div className="not-found">
      <Logo size={56} color="#fb7299" />
      <h1>（゜-゜）つロ 这里什么都没有</h1>
      <p>页面走丢了，回首页继续看视频吧。</p>
      <Link className="not-found__back" to="/">
        返回首页
      </Link>
    </div>
  );
}
