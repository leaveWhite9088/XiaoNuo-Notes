import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../common';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="bg-bili-card-bg border-b border-bili-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-bg rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold text-bili-text hidden sm:block">Bilibili</span>
            </Link>

            <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="搜索视频、番剧、UP主..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pr-10 pl-4 py-1.5 rounded-full border-bili-border focus:border-bili-pink"
                />
                <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-bili-pink text-white rounded-full hover:bg-bili-pinkHover">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </button>
              </div>
            </form>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/upload" className="hidden md:flex items-center gap-1 text-bili-text hover:text-bili-pink">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm">投稿</span>
            </Link>

            <button className="p-2 text-bili-text hover:text-bili-pink hidden sm:block">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2"
                >
                  <img
                    src={user.face || '/default-avatar.png'}
                    alt={user.uname}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden lg:block text-sm text-bili-text">{user.uname}</span>
                  <svg className="w-4 h-4 text-bili-text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-bili-card-bg border border-bili-border rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/user"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2 text-sm text-bili-text hover:bg-bili-hover"
                    >
                      个人中心
                    </Link>
                    <Link
                      to="/user/favorites"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2 text-sm text-bili-text hover:bg-bili-hover"
                    >
                      我的收藏
                    </Link>
                    <hr className="my-1 border-bili-border" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-bili-text hover:bg-bili-hover"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button size="sm">登录</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};