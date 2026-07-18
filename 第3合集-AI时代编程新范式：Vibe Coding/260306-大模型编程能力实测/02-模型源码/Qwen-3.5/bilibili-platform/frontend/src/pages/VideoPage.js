import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import CommentSection from '../components/CommentSection';
import VideoCard from '../components/VideoCard';
import { favoriteApi } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

export default function VideoPage() {
  const { bvid } = useParams();
  const { isLogin, user } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteFolders, setFavoriteFolders] = useState([]);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);

  useEffect(() => {
    loadVideoDetail();
    loadRelatedVideos();
  }, [bvid]);

  async function loadVideoDetail() {
    try {
      const res = await fetch(`http://localhost:3001/api/videos/detail/${bvid}`);
      const data = await res.json();
      if (data.success) {
        setVideo(data.data);
      }
    } catch (error) {
      console.error('加载视频详情失败:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadRelatedVideos() {
    try {
      const res = await fetch('http://localhost:3001/api/videos/recommend');
      const data = await res.json();
      if (data.success) {
        setRelatedVideos((data.data || []).slice(0, 10));
      }
    } catch (error) {
      console.error('加载推荐视频失败:', error);
    }
  }

  async function loadFavoriteFolders() {
    if (!isLogin) return;
    try {
      const res = await favoriteApi.getFolders();
      if (res.data.success) {
        setFavoriteFolders(res.data.data || []);
        setShowFavoriteModal(true);
      }
    } catch (error) {
      console.error('加载收藏夹失败:', error);
    }
  }

  async function addToFavorite(mediaId) {
    try {
      await favoriteApi.add(video.aid, [mediaId], []);
      setIsFavorite(true);
      setShowFavoriteModal(false);
    } catch (error) {
      alert('收藏失败');
    }
  }

  function formatNum(num) {
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    return num;
  }

  function openLink() {
    window.open(`https://www.bilibili.com/video/${bvid}`, '_blank');
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8">加载中...</div>;
  }

  if (!video) {
    return <div className="max-w-7xl mx-auto px-4 py-8">视频不存在</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VideoPlayer bvid={bvid} cid={video.cid} />
          
          <div className="mt-4 bg-white rounded-lg p-6">
            <h1 className="text-xl font-bold text-bili-text mb-2">{video.title}</h1>
            
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-6 text-sm text-bili-gray-text">
                <span>播放 {formatNum(video.stat?.view || 0)}</span>
                <span>弹幕 {formatNum(video.stat?.danmaku || 0)}</span>
                <span>发布时间：{new Date(video.pubdate * 1000).toLocaleDateString('zh-CN')}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={openLink}
                  className="bili-btn bili-btn-secondary"
                >
                  🔗 跳转官网
                </button>
                <button className="bili-btn bili-btn-secondary">
                  👍 {formatNum(video.stat?.like || 0)}
                </button>
                <button
                  onClick={loadFavoriteFolders}
                  className={`bili-btn ${isFavorite ? 'bg-bili-pink text-white' : 'bili-btn-secondary'}`}
                >
                  ⭐ 收藏
                </button>
                <button className="bili-btn bili-btn-secondary">
                  🔄 分享
                </button>
              </div>
            </div>
          </div>

          <CommentSection bvid={bvid} />
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-bili-pink to-bili-blue text-white flex items-center justify-center text-lg font-bold">
                {video.owner?.name?.[0] || 'U'}
              </div>
              <div>
                <div className="font-medium text-bili-text">{video.owner?.name || 'UP 主'}</div>
                <div className="text-xs text-bili-gray-text">粉丝数 {formatNum(video.stat?.favorite || 0)}</div>
              </div>
              <button className="ml-auto bili-btn bili-btn-primary text-sm">
                关注
              </button>
            </div>
            
            <div className="text-sm text-bili-text line-clamp-3">
              {video.desc || '这个人很懒，什么都没写~'}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-bold text-bili-text mb-3">相关推荐</h3>
            <div className="space-y-4">
              {relatedVideos.map((v) => (
                <div key={v.bvid} className="flex space-x-3">
                  <img src={v.pic} alt={v.title} className="w-28 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <Link to={`/video/${v.bvid}`} className="text-sm text-bili-text line-clamp-2 hover:text-bili-pink">
                      {v.title}
                    </Link>
                    <div className="text-xs text-bili-gray-text mt-1">{v.owner?.name || v.author}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showFavoriteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">选择收藏夹</h3>
            <div className="space-y-2">
              {favoriteFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => addToFavorite(folder.id)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-bili-hover transition-colors"
                >
                  <div className="font-medium">{folder.title}</div>
                  <div className="text-xs text-bili-gray-text">{folder.media_count} 个视频</div>
                </button>
              ))}
              <button
                onClick={() => setShowFavoriteModal(false)}
                className="w-full mt-3 bili-btn bili-btn-secondary"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
