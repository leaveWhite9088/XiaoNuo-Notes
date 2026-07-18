import { useEffect, useState } from 'react';
import { Layout, Row, Col, Spin, Tabs, Carousel } from 'antd';
import { VideoCard } from '../components/VideoCard';
import { getRecommendVideos } from '../api/bilibili';
import type { VideoInfo } from '../types';

const { Content } = Layout;

const bannerImages = [
  'https://i0.hdslb.com/bfs/archive/2d81dfae71c849e582daa7b605d1e77994ebdb1c.jpg',
  'https://i0.hdslb.com/bfs/archive/3f7a77c3b6cd8fd57241f29ec9874ecbdea093b0.jpg',
  'https://i0.hdslb.com/bfs/archive/8a17c5ea28374a681ee595e5cf437a49948d1637.jpg',
];

export const Home = () => {
  const [videos, setVideos] = useState<VideoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommend');

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    const data = await getRecommendVideos(1, 24);
    setVideos(data);
    setLoading(false);
  };

  const tabItems = [
    { key: 'recommend', label: '推荐' },
    { key: 'hot', label: '热门' },
    { key: 'anime', label: '动画' },
    { key: 'movie', label: '影视' },
    { key: 'tech', label: '科技' },
    { key: 'game', label: '游戏' },
    { key: 'music', label: '音乐' },
    { key: 'dance', label: '舞蹈' },
  ];

  return (
    <Content style={{ padding: '24px 48px', marginTop: 64, background: '#F1F2F3', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1800, margin: '0 auto' }}>
        <Carousel autoplay style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
          {bannerImages.map((img, index) => (
            <div key={index}>
              <img
                src={img}
                alt={`banner-${index}`}
                style={{ width: '100%', height: 280, objectFit: 'cover' }}
              />
            </div>
          ))}
        </Carousel>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{
            background: '#fff',
            padding: '0 24px',
            borderRadius: 8,
            marginBottom: 24,
          }}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
          </div>
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
