import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import Banner from '../components/Banner.jsx';
import CategoryBar from '../components/CategoryBar.jsx';
import VideoCard from '../components/VideoCard.jsx';

const PAGE_SIZE = 12;

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '推荐';

  const [categories, setCategories] = useState(['推荐']);
  const [feed, setFeed] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const reqId = useRef(0);

  useEffect(() => {
    api.categories().then((d) => setCategories(d.list)).catch(() => {});
  }, []);

  const load = useCallback(async (p, replace) => {
    const id = ++reqId.current;
    setLoading(true);
    try {
      const data = await api.feed({ category: categoryParam, q, page: p, pageSize: PAGE_SIZE });
      if (id !== reqId.current) return;
      setFeed((old) => (replace ? data.list : [...old, ...data.list]));
      setHasMore(data.hasMore);
      setTotal(data.total);
      setPage(p);
    } catch {
      // 网络异常时保持现状
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [categoryParam, q]);

  useEffect(() => {
    load(1, true);
  }, [load]);

  const onCategory = (c) => {
    setSearchParams(q ? { q, category: c } : { category: c });
  };

  const clearSearch = () => {
    setSearchParams({ category: '推荐' });
  };

  return (
    <main className="home">
      <Banner />
      <CategoryBar categories={categories} current={categoryParam} onChange={onCategory} />

      {q && (
        <div className="search-result-bar">
          <span>
            搜索「<b>{q}</b>」共找到 {total} 个相关视频
          </span>
          <button className="clear-search" onClick={clearSearch}>清除搜索，回到推荐</button>
        </div>
      )}

      <div className="feed-grid">
        {feed.map((v) => (
          <VideoCard key={v.bvid} video={v} />
        ))}
      </div>

      {!loading && feed.length === 0 && (
        <div className="empty-state">
          <div className="empty-text">什么都没有找到 (´；ω；`)</div>
          <button className="clear-search" onClick={clearSearch}>回到首页推荐</button>
        </div>
      )}

      <div className="load-more-wrap">
        {loading && <span className="loading-text">加载中…</span>}
        {!loading && hasMore && (
          <button className="load-more" onClick={() => load(page + 1, false)}>
            加载更多
          </button>
        )}
        {!loading && !hasMore && feed.length > 0 && (
          <span className="loading-text">已经到底啦～</span>
        )}
      </div>
    </main>
  );
}
