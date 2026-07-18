import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-white border-b border-bili-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-bili-pink">
              📺 哔哩哔哩
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-bili-text hover:text-bili-pink transition-colors">
                首页
              </Link>
              <Link to="/anime" className="text-bili-text hover:text-bili-pink transition-colors">
                动画
              </Link>
              <Link to="/bangumi" className="text-bili-text hover:text-bili-pink transition-colors">
                番剧
              </Link>
              <Link to="/music" className="text-bili-text hover:text-bili-pink transition-colors">
                音乐
              </Link>
              <Link to="/dance" className="text-bili-text hover:text-bili-pink transition-colors">
                舞蹈
              </Link>
              <Link to="/game" className="text-bili-text hover:text-bili-pink transition-colors">
                游戏
              </Link>
              <Link to="/tech" className="text-bili-text hover:text-bili-pink transition-colors">
                科技
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索视频、UP 主..."
                className="w-64 px-4 py-2 border border-bili-border rounded-full focus:outline-none focus:ring-2 focus:ring-bili-pink"
              />
              <button className="absolute right-0 top-0 h-full px-4 text-bili-gray-text hover:text-bili-pink">
                🔍
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative text-bili-text hover:text-bili-pink">
                📩
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-bili-pink text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="text-bili-text hover:text-bili-pink">
                📁
              </button>
              <button className="text-bili-text hover:text-bili-pink">
                👤
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
