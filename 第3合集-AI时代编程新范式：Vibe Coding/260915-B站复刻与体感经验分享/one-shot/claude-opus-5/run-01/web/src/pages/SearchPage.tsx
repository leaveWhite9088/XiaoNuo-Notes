/**
 * 搜索结果页：关键词来自 URL，可按综合 / 最多播放 / 最新发布 / 最多弹幕 排序，
 * 并支持按分区二次筛选（分类筛选）与翻页加载。
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppHeader } from '../components/layout/AppHeader';
import { AppFooter } from '../components/layout/AppFooter';
import { SideToolbar } from '../components/layout/SideToolbar';
import { VideoGrid } from '../components/home/VideoGrid';
import { fetchSearch } from '../api/bili';
import type { VideoCardData } from '../types';
import './search.css';

const ORDERS = [
  { id: 'totalrank', name: '综合排序' },
  { id: 'click', name: '最多播放' },
  { id: 'pubdate', name: '最新发布' },
  { id: 'dm', name: '最多弹幕' },
];

export function SearchPage() {
  const [params] = useSearchParams();
  const keyword = params.get('keyword') ?? '';

  const [order, setOrder] = useState('totalrank');
  const [channel, setChannel] = useState('all');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<VideoCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1);
    setChannel('all');
  }, [keyword, order]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchSearch({ keyword, page, order })
      .then((res) => {
        if (!alive) return;
        setItems((prev) => (page === 1 ? res.items : [...prev, ...res.items]));
        setTotal(res.total);
        setHasMore(res.hasMore);
        setLoading(false);
      })
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [keyword, page, order]);

  useEffect(() => {
    document.title = keyword ? `${keyword}的搜索结果_哔哩哔哩` : '搜索_哔哩哔哩';
  }, [keyword]);

  /** 结果内出现过的分区，用于二次筛选 */
  const channelChips = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((item) => map.set(item.channelId, item.channelName));
    return [...map.entries()];
  }, [items]);

  const visible = channel === 'all' ? items : items.filter((item) => item.channelId === channel);

  return (
    <div className="search-page">
      <AppHeader searchKeyword={keyword} />

      <main className="search-page__main container">
        <header className="search-page__head">
          <h2>
            <em>{keyword}</em> 的搜索结果
          </h2>
          <span>共 {total} 个相关视频</span>
        </header>

        <div className="search-page__filters">
          <div className="search-page__orders">
            {ORDERS.map((item) => (
              <button
                key={item.id}
                className={order === item.id ? 'is-active' : ''}
                onClick={() => setOrder(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>

          {channelChips.length > 1 && (
            <div className="search-page__chips">
              <button
                className={channel === 'all' ? 'is-active' : ''}
                onClick={() => setChannel('all')}
              >
                全部分区
              </button>
              {channelChips.map(([id, name]) => (
                <button
                  key={id}
                  className={channel === id ? 'is-active' : ''}
                  onClick={() => setChannel(id)}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {!loading && visible.length === 0 ? (
          <div className="search-page__empty">
            <p>没有找到与「{keyword}」相关的内容</p>
            <Link to="/">回到首页看看别的 →</Link>
          </div>
        ) : (
          <VideoGrid videos={visible} loading={loading && items.length === 0} skeletonCount={10} showChannel />
        )}

        <div className="search-page__footer">
          {!loading && hasMore && channel === 'all' && (
            <button onClick={() => setPage((p) => p + 1)}>加载更多结果</button>
          )}
          {!loading && !hasMore && items.length > 0 && <span>已显示全部结果</span>}
        </div>
      </main>

      <SideToolbar />
      <AppFooter />
    </div>
  );
}
