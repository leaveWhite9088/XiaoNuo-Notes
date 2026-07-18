import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { VideoCard } from '../components/video/VideoCard';
import { Loading } from '../components/common/Loading';
import { videoApi } from '../services/api';
import { VideoInfo } from '../types';

export const HomePage: React.FC = () => {
  const [popularVideos, setPopularVideos] = useState<VideoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    fetchPopularVideos();
  }, []);

  const fetchPopularVideos = async () => {
    try {
      const res = await videoApi.getPopular(10);
      if (res.code === 0) {
        setPopularVideos(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch popular videos:', error);
    } finally {
      setLoading(false);
    }
  };

  // 展示前几个热门视频作为轮播
  const bannerVideos = popularVideos.slice(0, 5);

  useEffect(() => {
    if (bannerVideos.length <= 1) return;
    const timer = setInterval(() => {
      setBannerIndex(prev => (prev + 1) % bannerVideos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerVideos.length]);

  if (loading) {
    return <Loading text="加载中..." fullScreen />;
  }

  return (
    <div className="min-h-screen">
      {bannerVideos.length > 0 && (
        <div className="relative h-96 bg-gradient-to-r from-bili-pink to-bili-blue overflow-hidden">
          {bannerVideos.map((video, idx) => (
            <Link
              key={video.aid}
              to={`/video/${video.bvid}`}
              className={`absolute inset-0 transition-opacity duration-500 ${
                idx === bannerIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <img
                src={video.cover}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-8 text-white max-w-2xl">
                  <h2 className="text-3xl font-bold mb-2 line-clamp-2">{video.title}</h2>
                  <p className="text-white/80 mb-2">UP主: {video.owner.name}</p>
                  <p className="text-sm text-white/60">
                    {video.stat.view.toLocaleString()} 播放 · {video.stat.danmaku.toLocaleString()} 弹幕
                  </p>
                </div>
              </div>
            </Link>
          ))}

          {/* Banner Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {bannerVideos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setBannerIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === bannerIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Categories */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {['全部', '动画', '音乐', '舞蹈', '游戏', '科技', '生活', '鬼畜', '影视'].map(cat => (
            <Link
              key={cat}
              to={`/category/${cat === '全部' ? 'all' : cat.toLowerCase()}`}
              className="px-4 py-1.5 bg-bili-card-bg border border-bili-border rounded-full text-sm text-bili-text hover:bg-bili-pink hover:text-white hover:border-transparent transition-colors whitespace-nowrap"
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Video Grid */}
        <section>
          <h2 className="text-xl font-bold text-bili-text mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-bili-pink rounded"></span>
            热门推荐
          </h2>
          {popularVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {popularVideos.map((video) => (
                <VideoCard key={video.aid} video={video} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-bili-text-gray">
              没有找到相关结果
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
