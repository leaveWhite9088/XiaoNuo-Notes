import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../services/api';
import { VideoCard } from '../components/video/VideoCard';
import { Button, Card, Loading } from '../components/common';
import { UserInfo, UserFavorites } from '../types';

export const UserCenterPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [favorites, setFavorites] = useState<UserFavorites[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'favorites'>('info');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [infoRes, favRes] = await Promise.all([
        userApi.getInfo(),
        userApi.getFavorites()
      ]);
      if (infoRes.code === 0) setUserInfo(infoRes.data);
      if (favRes.code === 0) setFavorites(favRes.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 100000) return (num / 10000).toFixed(1) + '万';
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    if (num >= 1000) return (num / 1000).toFixed(1) + '千';
    return num.toString();
  };

  if (loading) {
    return <Loading text="加载中..." fullScreen />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Card className="mb-6 p-6">
        <div className="flex items-start gap-6">
          <img
            src={userInfo?.face || user?.face || '/default-avatar.png'}
            alt={userInfo?.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-bili-pink"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-bili-text mb-1">{userInfo?.name || user?.uname}</h1>
            <p className="text-bili-text-gray mb-3">{userInfo?.sign || '这个人很懒，什么都没写'}</p>
            <div className="flex items-center gap-4 text-sm text-bili-text-gray mb-4">
              <span>Lv.{userInfo?.level || 1}</span>
              <span>{formatNumber(userInfo?.follower || 0)} 粉丝</span>
              <span>{formatNumber(userInfo?.following || 0)} 关注</span>
              <span>{userInfo?.video_count || 0} 个视频</span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">编辑资料</Button>
              <Button variant="outline" size="sm" onClick={logout}>退出登录</Button>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-3xl font-bold text-bili-pink mb-1">{userInfo?.coins || 0}</div>
            <div className="text-sm text-bili-text-gray">硬币</div>
          </div>
        </div>
      </Card>

      <div className="flex gap-6 border-b border-bili-border mb-6">
        <button
          onClick={() => setActiveTab('info')}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === 'info' ? 'text-bili-pink border-b-2 border-bili-pink' : 'text-bili-text-gray hover:text-bili-text'
          }`}
        >
          我的收藏
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === 'favorites' ? 'text-bili-pink border-b-2 border-bili-pink' : 'text-bili-text-gray hover:text-bili-text'
          }`}
        >
          个人资料
        </button>
      </div>

      {/* Content */}
      {activeTab === 'info' ? (
        <div>
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favorites.map(fav => (
                <Card key={fav.fid} hoverable className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={fav.cover}
                      alt={fav.title}
                      className="w-32 h-20 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-bili-text line-clamp-2 mb-2">{fav.title}</h4>
                      <div className="flex items-center justify-between text-sm text-bili-text-gray">
                        <span>UP主: {fav.upper.name}</span>
                        <span>{fav.media_count} 个视频</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-bili-text-gray">
              还没有收藏夹
            </div>
          )}
        </div>
      ) : (
        <div>
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-bili-text mb-4">基本信息</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-bili-border">
                    <span className="text-bili-text-gray">用户名</span>
                    <span className="text-bili-text">{userInfo?.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-bili-border">
                    <span className="text-bili-text-gray">等级</span>
                    <span className="text-bili-text">Lv.{userInfo?.level}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-bili-border">
                    <span className="text-bili-text-gray">硬币</span>
                    <span className="text-bili-pink font-medium">{userInfo?.coins}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-bili-border">
                    <span className="text-bili-text-gray">注册时间</span>
                    <span className="text-bili-text">-</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-bili-text mb-4">统计数据</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-bili-border">
                    <span className="text-bili-text-gray">粉丝数</span>
                    <span className="text-bili-text">{formatNumber(userInfo?.follower || 0)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-bili-border">
                    <span className="text-bili-text-gray">关注数</span>
                    <span className="text-bili-text">{formatNumber(userInfo?.following || 0)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-bili-border">
                    <span className="text-bili-text-gray">视频数</span>
                    <span className="text-bili-text">{userInfo?.video_count || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-bili-border">
                    <span className="text-bili-text-gray">收藏数</span>
                    <span className="text-bili-text">{userInfo?.favourite_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
