import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout, Row, Col, Spin, Empty, Pagination, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { VideoCard } from '../components/VideoCard';
import { searchVideos } from '../api/bilibili';
import type { VideoInfo } from '../types';

const { Content } = Layout;

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const [videos, setVideos] = useState<VideoInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (keyword) {
      handleSearch(1);
    }
  }, [keyword]);

  const handleSearch = async (page: number) => {
    if (!keyword) return;
    
    setLoading(true);
    setCurrentPage(page);
    
    const result = await searchVideos(keyword, page);
    setVideos(result.result);
    setTotal(result.numResults);
    
    setLoading(false);
  };

  return (
    <Content style={{ padding: '24px 48px', marginTop: 64, background: '#F1F2F3', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1800, margin: '0 auto' }}>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Input.Search
            placeholder="搜索视频、UP主..."
            defaultValue={keyword}
            enterButton={<SearchOutlined />}
            size="large"
            style={{ maxWidth: 500 }}
            onSearch={(value) => {
              setSearchParams({ keyword: value });
            }}
          />
          <span style={{ color: '#9499A0' }}>
            共找到 {total} 个结果
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
          </div>
        ) : videos.length === 0 ? (
          <Empty
            description="暂无搜索结果"
            style={{ padding: '100px 0' }}
          />
        ) : (
          <>
            <Row gutter={[24, 24]}>
              {videos.map((video) => (
                <Col key={video.bvid} xs={24} sm={12} md={8} lg={6} xl={4}>
                  <VideoCard video={video} />
                </Col>
              ))}
            </Row>
            
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <Pagination
                current={currentPage}
                total={total}
                pageSize={20}
                showSizeChanger={false}
                onChange={handleSearch}
              />
            </div>
          </>
        )}
      </div>
    </Content>
  );
};
