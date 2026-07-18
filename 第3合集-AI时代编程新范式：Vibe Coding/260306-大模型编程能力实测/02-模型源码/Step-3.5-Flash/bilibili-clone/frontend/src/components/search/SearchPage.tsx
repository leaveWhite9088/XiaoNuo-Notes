import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { VideoCard } from '../video/VideoCard';
import { Loading } from '../common/Loading';
import { videoApi } from '../../services/api';
import { VideoInfo } from '../../types';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('q') || '';
  const [results, setResults] = useState<VideoInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (keyword.trim()) {
      searchVideos(1);
    } else {
      setResults([]);
    }
  }, [keyword]);

  const searchVideos = async (pageNum: number) => {
    if (loading || !keyword.trim()) return;
    setLoading(true);
    try {
      const res = await videoApi.search(keyword, pageNum);
      if (res.code === 0) {
        setResults(prev => pageNum === 1 ? res.data : [...prev, ...res.data]);
        setPage(pageNum);
        setHasMore(res.data.length >= 20);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!keyword.trim()) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-bili-text-gray py-12">
          请输入搜索关键词
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl text-bili-text">
          搜索结果: <span className="text-bili-pink">"{keyword}"</span>
        </h1>
      </div>

      {loading && page === 1 ? (
        <Loading text="搜索中..." />
      ) : results.length > 0 ? (
        <>
          <div className="masonry">
            {results.map(video => (
              <div key={video.aid} className="masonry-item w-full">
                <VideoCard video={video} />
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => searchVideos(page + 1)}
                disabled={loading}
                className="px-6 py-2 bg-bili-card-bg border border-bili-border rounded text-bili-text hover:bg-bili-hover disabled:opacity-50"
              >
                {loading ? '加载中...' : '加载更多'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-bili-text-gray">
          没有找到相关结果
        </div>
      )}
    </div>
  );
};