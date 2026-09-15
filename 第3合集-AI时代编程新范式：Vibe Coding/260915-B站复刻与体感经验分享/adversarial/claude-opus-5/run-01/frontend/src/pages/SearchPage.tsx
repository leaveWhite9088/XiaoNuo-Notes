import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../api/endpoints';
import { VideoGrid } from '../components/home/VideoGrid';
import { Icon } from '../components/common/Icon';
import type { SearchOrder } from '../types';
import './SearchPage.css';

const ORDERS: { id: SearchOrder; label: string }[] = [
  { id: 'default', label: '综合排序' },
  { id: 'view', label: '最多播放' },
  { id: 'pubdate', label: '最新发布' },
  { id: 'danmaku', label: '最多弹幕' },
];

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const keyword = params.get('keyword') ?? '';
  const order = (ORDERS.some((o) => o.id === params.get('order'))
    ? params.get('order')
    : 'default') as SearchOrder;

  const search = useInfiniteQuery({
    queryKey: ['search', keyword, order],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => api.search({ keyword, order, page: pageParam as number }),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    enabled: keyword.length > 0,
  });

  const videos = useMemo(() => search.data?.pages.flatMap((p) => p.items) ?? [], [search.data]);
  const total = search.data?.pages[0]?.total ?? 0;

  return (
    <div className="search-page">
      <div className="container search-page__inner">
        <header className="search-page__header">
          <h1>
            {keyword ? (
              <>
                <span className="search-page__keyword">{keyword}</span> 的搜索结果
              </>
            ) : (
              '请输入搜索关键词'
            )}
          </h1>
          <span className="search-page__total">{total} 个相关视频</span>
          <Link className="search-page__back" to="/">
            <Icon name="arrowLeft" size={14} /> 返回首页
          </Link>
        </header>

        <div className="search-page__orders">
          {ORDERS.map((o) => (
            <button
              key={o.id}
              className={order === o.id ? 'is-active' : ''}
              onClick={() => {
                const next = new URLSearchParams(params);
                if (o.id === 'default') next.delete('order');
                else next.set('order', o.id);
                setParams(next);
              }}
            >
              {o.label}
            </button>
          ))}
        </div>

        <VideoGrid
          videos={videos}
          loading={search.isLoading}
          emptyText={keyword ? `没有找到与「${keyword}」相关的视频` : '试试搜索「鬼畜」「猫」或者某个 UP 主'}
        />

        {search.hasNextPage && (
          <div className="search-page__more">
            <button onClick={() => search.fetchNextPage()} disabled={search.isFetchingNextPage}>
              {search.isFetchingNextPage ? '加载中…' : '加载更多'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
