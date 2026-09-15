import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import ChannelTabs from '../components/ChannelTabs.jsx';
import VideoCard from '../components/VideoCard.jsx';

const PAGE_SIZE = 20;

export default function Home() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '首页';
  const keyword = params.get('keyword') || '';

  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);

  // 频道（分类）列表
  useEffect(() => {
    api.categories().then(setCategories).catch(() => setCategories(['首页']));
  }, []);

  // 拉取视频流
  const load = useCallback(
    async (p, append) => {
      setLoading(true);
      try {
        const data = await api.videos({ category, keyword, page: p, pageSize: PAGE_SIZE });
        setVideos((prev) => (append ? [...prev, ...data.list] : data.list));
        setHasMore(data.hasMore);
        setTotal(data.total);
        setPage(p);
      } finally {
        setLoading(false);
      }
    },
    [category, keyword]
  );

  useEffect(() => {
    load(1, false);
  }, [load, refreshTick]);

  const changeCategory = (c) => {
    const next = new URLSearchParams(params);
    if (c === '首页') next.delete('category');
    else next.set('category', c);
    next.delete('keyword');
    setParams(next, { replace: true });
  };

  return (
    <div className="home">
      <ChannelTabs
        categories={categories.length ? categories : ['首页']}
        active={category}
        onChange={changeCategory}
        onRefresh={() => setRefreshTick((t) => t + 1)}
      />

      {keyword && (
        <div className="search-result-bar">
          搜索「<b>{keyword}</b>」共找到 {total} 个视频
          <button className="clear-kw" onClick={() => changeCategory('首页')} type="button">清空搜索</button>
        </div>
      )}

      {videos.length > 0 && (
        <div className="video-grid">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}

      {loading && <div className="loading-tip">加载中…</div>}
      {!loading && videos.length === 0 && (
        <div className="empty-tip">
          <p>╮(￣▽￣)╭ 没有找到相关视频</p>
          <button className="upload-btn" onClick={() => changeCategory('首页')} type="button">回首页看看</button>
        </div>
      )}

      {!loading && hasMore && (
        <div className="load-more-wrap">
          <button className="load-more" onClick={() => load(page + 1, true)} type="button">
            点击加载更多
          </button>
        </div>
      )}
    </div>
  );
}
