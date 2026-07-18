import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Input, Spin, Empty, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { searchService } from '../services';
import VideoCard from '../components/VideoCard';
import { Video } from '../types';

const SearchContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SearchHeader = styled.div`
  margin-bottom: 20px;
`;

const SearchTitle = styled.h2`
  margin: 0 0 16px 0;
  color: #212121;
`;

const SearchInputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const SearchInput = styled(Input)`
  margin-right: 12px;
`;

const SearchButton = styled(Button)`
  background-color: #23ade5;
  border-color: #23ade5;
  
  &:hover, &:focus {
    background-color: #00a1d6;
    border-color: #00a1d6;
  }
`;

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-top: 16px;
`;

const NoResultsContainer = styled.div`
  text-align: center;
  padding: 40px 0;
  color: #999;
`;

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [keyword, setKeyword] = useState<string>('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const keywordFromUrl = searchParams.get('keyword');
    if (keywordFromUrl) {
      setKeyword(keywordFromUrl);
      searchVideos(keywordFromUrl, 1);
    }
  }, [searchParams]);

  const searchVideos = async (searchKeyword: string, page: number = 1) => {
    if (!searchKeyword.trim()) {
      setVideos([]);
      setTotal(0);
      return;
    }

    try {
      setLoading(true);
      
      // 在实际应用中，这里应该调用API搜索视频
      // 由于演示需要，使用一些示例数据
      const mockVideo: Video = {
        bvid: 'BV1xx411c7mD',
        aid: 170001,
        title: `关于"${searchKeyword}"的搜索结果`,
        pic: 'https://i0.hdslb.com/bfs/archive/864276411c43a65fa07715c438ff735993684a78.jpg',
        desc: `这是一个关于${searchKeyword}的视频描述`,
        duration: 245,
        owner: {
          mid: 28638698,
          name: '搜索结果UP主',
          face: 'https://i0.hdslb.com/bfs/face/c12b1e60b4474469c7760590fa3a31b32480907.jpg'
        },
        stat: {
          view: 21876434,
          danmaku: 415497,
          reply: 19996,
          favorite: 162316,
          coin: 986494,
          share: 29018,
          like: 2869711
        },
        pubdate: 1612137600
      };
      
      // 生成一些搜索结果
      const mockVideos = Array(page === 1 ? 12 : 6).fill(null).map((_, index) => ({
        ...mockVideo,
        bvid: `BV1${Math.random().toString(36).substring(2, 15)}`,
        aid: 170001 + (page - 1) * 12 + index,
        title: `${mockVideo.title} - 第${page === 1 ? index + 1 : 12 + index + 1}个结果`,
        view: Math.floor(Math.random() * 10000000),
        like: Math.floor(Math.random() * 1000000)
      }));
      
      if (page === 1) {
        setVideos(mockVideos);
      } else {
        setVideos([...videos, ...mockVideos]);
      }
      
      setTotal(50); // 模拟总结果数
      setCurrentPage(page);
    } catch (error) {
      console.error('搜索视频失败', error);
      // message.error('搜索失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (keyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
      searchVideos(keyword.trim(), 1);
    }
  };

  const handleLoadMore = () => {
    searchVideos(keyword, currentPage + 1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <SearchContainer>
      <Card className="bili-card">
        <SearchHeader>
          <SearchTitle>搜索结果</SearchTitle>
          <SearchInputContainer>
            <SearchInput
              placeholder="搜索视频"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              size="large"
            />
            <SearchButton
              type="primary"
              icon={<SearchOutlined />}
              size="large"
              onClick={handleSearch}
            >
              搜索
            </SearchButton>
          </SearchInputContainer>
        </SearchHeader>
        
        {loading ? (
          <div className="page-loading">
            <Spin size="large" />
          </div>
        ) : videos.length > 0 ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              共找到 {total} 个关于"<strong>{keyword}</strong>"的结果
            </div>
            
            <VideoGrid>
              {videos.map((video) => (
                <VideoCard key={video.bvid} video={video} />
              ))}
            </VideoGrid>
            
            {videos.length < total && (
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <Button 
                  onClick={handleLoadMore} 
                  loading={loading}
                  style={{ width: 120 }}
                >
                  {loading ? '加载中...' : '加载更多'}
                </Button>
              </div>
            )}
          </div>
        ) : keyword ? (
          <NoResultsContainer>
            <div className="page-empty-icon">
              <SearchOutlined />
            </div>
            <div className="page-empty-text">
              没有找到关于"<strong>{keyword}</strong>"的视频
            </div>
            <Button 
              type="primary" 
              onClick={() => navigate('/')}
              style={{ marginTop: 16 }}
            >
              返回首页
            </Button>
          </NoResultsContainer>
        ) : (
          <NoResultsContainer>
            <div className="page-empty-icon">
              <SearchOutlined />
            </div>
            <div className="page-empty-text">
              输入关键词搜索视频
            </div>
          </NoResultsContainer>
        )}
      </Card>
    </SearchContainer>
  );
};

export default Search;