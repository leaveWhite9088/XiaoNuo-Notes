import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import VideoCard from '../components/VideoCard';
import { useAuth } from '../hooks/useAuth';

export default function FavoritePage() {
  const { isLogin, user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLogin) {
      loadFolders();
    }
  }, [isLogin]);

  useEffect(() => {
    if (currentFolder) {
      loadFolderVideos();
    }
  }, [currentFolder]);

  async function loadFolders() {
    try {
      const res = await fetch('http://localhost:3001/api/favorites/folders');
      const data = await res.json();
      if (data.success) {
        setFolders(data.data || []);
        if (data.data?.length > 0) {
          setCurrentFolder(data.data[0]);
        }
      }
    } catch (error) {
      console.error('加载收藏夹失败:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadFolderVideos() {
    try {
      const res = await fetch(`http://localhost:3001/api/favorites/detail/${currentFolder.id}`);
      const data = await res.json();
      if (data.success) {
        setVideos(data.data?.medias || []);
      }
    } catch (error) {
      console.error('加载收藏视频失败:', error);
    }
  }

  if (!isLogin) {
    return (
      <div className="min-h-screen bg-bili-gray">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h2 className="text-2xl font-bold text-bili-text mb-2">请先登录</h2>
          <p className="text-bili-gray-text mb-6">登录后即可查看您的收藏视频</p>
          <Link to="/" className="bili-btn bili-btn-primary">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bili-gray">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">我的收藏</h1>
        
        <div className="flex space-x-4 mb-6 overflow-x-auto">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setCurrentFolder(folder)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
                currentFolder?.id === folder.id
                  ? 'bg-bili-pink text-white'
                  : 'bg-white text-bili-text hover:bg-bili-hover'
              }`}
            >
              {folder.title} ({folder.media_count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-bili-gray-text">加载中...</div>
        ) : videos.length === 0 ? (
          <div className="text-center py-16 text-bili-gray-text">
            收藏夹空空如也
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
