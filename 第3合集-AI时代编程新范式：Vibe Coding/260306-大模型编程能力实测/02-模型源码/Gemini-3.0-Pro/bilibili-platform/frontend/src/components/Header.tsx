import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, LogOut } from 'lucide-react';
import { getMyInfo } from '../api';

const Header: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMyInfo().then(setUser).catch(() => setUser(null));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/?q=${keyword}`);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-bilibili-pink rounded flex items-center justify-center text-white font-bold text-xl">
            B
          </div>
          <span className="text-bilibili-pink font-bold text-2xl">Bilibili Platform</span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索视频..."
              className="w-full bg-gray-100 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-bilibili-blue"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
        </form>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2">
              <img src={user.face} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200" />
              <span className="text-sm font-medium">{user.name}</span>
              {/* Logout implementation would clear local state, but backend holds credential. 
                  Ideally add logout endpoint. For now just show user. */}
            </div>
          ) : (
            <Link to="/login" className="bg-bilibili-pink text-white px-4 py-1.5 rounded hover:bg-pink-600 transition-colors text-sm font-medium">
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
