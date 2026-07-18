import { useEffect, useState } from 'react';
import { Layout, Row, Col, Tabs, Empty, Spin, Avatar, Card, Statistic } from 'antd';
import { VideoCard } from '../components/VideoCard';
import { getFavorites, getFavoriteVideos } from '../api/bilibili';
import { useUserStore } from '../stores/user';
import type { FavoriteItem, VideoInfo } from '../types';

const { Content } = Layout;

export const Favorites = () => {
  const { isLogin, userInfo } = useUserStore();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [videos, setVideos] = useState<VideoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (isLogin && userInfo) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [isLogin, userInfo]);

  const loadFavorites = async () => {
    if (!userInfo) return;
    
    setLoading(true);
    const favs = await getFavorites(userInfo.mid);
    setFavorites(favs);
    
    if (favs.length > 0) {
      const videosData = await getFavoriteVideos(favs[0].id);
      setVideos(videosData);
    }
    
    setLoading(false);
  };

  const handleTabChange = async (key: string) => {
    setActiveTab(key);
    if (key === 'all') {
      if (favorites.length > 0) {
        const videosData = await getFavoriteVideos(favorites[0].id);
        setVideos(videosData);
      }
    } else {
      const favId = parseInt(key);
      const videosData = await getFavoriteVideos(favId);
      setVideos(videosData);
    }
  };

  if (!isLogin) {
    return (
      <Content style={{ padding: '24px 48px', marginTop: 64, background: '#F1F2F3', minHeight: '100vh' }}>
        <Empty
          description="请先登录后查看收藏"
          style={{ padding: '100px 0' }}
        />
      </Content>
    );
  }

  const tabItems = [
    { key: 'all', label: '全部收藏' },
    ...favorites.map((fav) => ({
      key: fav.id.toString(),
      label: fav.title,
    })),
  ];

  return (
    <Content style={{ padding: '24px 48px', marginTop: 64, background: '#F1F2F3', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1800, margin: '0 auto' }}>
        <Card style={{ marginBottom: 24, borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Avatar src={userInfo?.face} size={80} style={{ border: '3px solid #00AEEC' }} />
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>{userInfo?.name}</h1>
              <p style={{ color: '#9499A0' }}>{userInfo?.sign || '这个人很懒，什么都没有写~'}</p>
            </div>
            <div style={{ display: 'flex', gap: 40 }}>
              <Statistic title="关注" value={userInfo?.following || 0} />
              <Statistic title="粉丝" value={userInfo?.follower || 0} />
              <Statistic title="等级" value={`LV${userInfo?.level || 0}`} />
            </div>
          </div>
        </Card>

        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          style={{
            background: '#fff',
            padding: '0 24px',
            borderRadius: 8,
          }}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
          </div>
        ) : videos.length === 0 ? (
          <Empty description="暂无收藏视频" style={{ padding: '100px 0' }} />
        ) : (
          <Row gutter={[24, 24]}>
            {videos.map((video) => (
              <Col key={video.bvid} xs={24} sm={12} md={8} lg={6} xl={4}>
                <VideoCard video={video} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </Content>
  );
};
