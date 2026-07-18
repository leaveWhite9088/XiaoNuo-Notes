import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import VideoCard from '../components/VideoCard';

const REGIONS = [
  { id: 1, name: '动画' },
  { id: 3, name: '音乐' },
  { id: 4, name: '游戏' },
  { id: 5, name: '娱乐' },
  { id: 36, name: '科技' },
  { id: 119, name: '鬼畜' },
  { id: 129, name: '舞蹈' },
  { id: 188, name: '科技' },
  { id: 211, name: '资讯' }
];

export default function HomePage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRegion, setActiveRegion] = useState(0);
  const [tabs, setTabs] = useState(['推荐', '流行', '番剧', '电影']);
  const [activeTab, setActiveTab] = useState('推荐');

  useEffect(() => {
    loadVideos();
  }, [activeRegion, activeTab]);

  async function loadVideos() {
    try {
      let url;
      if (activeRegion === 0) {
        url = 'http://localhost:3001/api/videos/recommend';
      } else {
        url = `http://localhost:3001/api/videos/region/${REGIONS[activeRegion - 1].id}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setVideos(data.data || []);
      }
    } catch (error) {
      console.error('加载视频失败:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bili-gray">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <nav className="flex items-center space-x-8 mb-6 overflow-x-auto">
          {REGIONS.map((region, index) => (
            <button
              key={region.id}
              onClick={() => setActiveRegion(index)}
              className={`whitespace-nowrap text-sm font-medium transition-colors ${
                activeRegion === index
                  ? 'text-bili-pink'
                  : 'text-bili-gray-text hover:text-bili-text'
              }`}
            >
              {region.name}
            </button>
          ))}
        </nav>

        {loading ? (
          <div className="text-center py-16 text-bili-gray-text">
            加载中...
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-16 text-bili-gray-text">
            暂无视频内容
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {videos.map((video) => (
              <VideoCard key={video.bvid} video={video} />
            ))}
          </div>
        )}
      </div>

      <footer className="mt-16 py-8 border-t border-bili-border bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-bili-gray-text">
          <p>哔哩哔哩弹幕视频网 &copy; 2024</p>
          <p className="mt-2">This is a demo project for educational purposes</p>
        </div>
      </footer>
    </div>
  );
}
