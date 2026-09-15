import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '../api/endpoints';
import { ChannelNav } from '../components/home/ChannelNav';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { FeedToolbar } from '../components/home/FeedToolbar';
import { VideoGrid } from '../components/home/VideoGrid';
import { ErrorState } from '../components/common/ErrorState';
import type { FeedSort } from '../types';
import './HomePage.css';

const SORTS: FeedSort[] = ['recommend', 'hot', 'latest', 'danmaku'];

export function HomePage() {
  const [params, setParams] = useSearchParams();
  const channel = params.get('channel') ?? 'all';
  const sortParam = params.get('sort');
  const sort = (SORTS.includes(sortParam as FeedSort) ? sortParam : 'recommend') as FeedSort;
  // 「换一换」的种子放进 URL，从详情页返回时仍是同一批结果
  const seed = Number(params.get('seed')) || 0;
  const sentinelRef = useRef<HTMLDivElement>(null);

  const bootstrap = useQuery({ queryKey: ['bootstrap'], queryFn: api.bootstrap });

  const feed = useInfiniteQuery({
    queryKey: ['feed', channel, sort, seed],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      api.feed({ channel, sort, page: pageParam as number, seed: seed || undefined }),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  });

  const videos = useMemo(() => feed.data?.pages.flatMap((p) => p.items) ?? [], [feed.data]);
  const total = feed.data?.pages[0]?.total ?? 0;
  const channels = bootstrap.data?.channels ?? [];
  const banners = bootstrap.data?.banners ?? [];
  const featured = bootstrap.data?.featured ?? [];

  const activeChannelName =
    channel === 'all' ? '推荐视频' : (channels.find((c) => c.id === channel)?.name ?? '分区') + ' 分区';

  const updateParams = useCallback(
    (next: Record<string, string | undefined>) => {
      const merged = new URLSearchParams(params);
      for (const [k, v] of Object.entries(next)) {
        if (!v || v === 'all' || v === '0' || (k === 'sort' && v === 'recommend')) merged.delete(k);
        else merged.set(k, v);
      }
      setParams(merged, { replace: false });
    },
    [params, setParams],
  );

  // 滚动到底自动加载下一页
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && feed.hasNextPage && !feed.isFetchingNextPage) {
          feed.fetchNextPage();
        }
      },
      { rootMargin: '600px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [feed]);

  return (
    <div className="home">
      <div className="home__hero-bg" />

      <div className="container home__content">
        {bootstrap.isError ? (
          <ErrorState title="首页数据加载失败" error={bootstrap.error} onRetry={() => bootstrap.refetch()} />
        ) : (
          <HeroCarousel banners={banners} sideVideos={featured} />
        )}

        <div className="home__nav">
          <ChannelNav
            channels={channels}
            active={channel}
            onChange={(id) => updateParams({ channel: id, seed: undefined })}
          />
        </div>

        <FeedToolbar
          title={activeChannelName}
          total={total}
          sort={sort}
          refreshing={feed.isFetching && !feed.isFetchingNextPage}
          onSortChange={(s) => updateParams({ sort: s })}
          onRefresh={() => updateParams({ seed: String((Date.now() % 100000) || 1) })}
        />

        {feed.isError ? (
          <ErrorState title="信息流加载失败" error={feed.error} onRetry={() => feed.refetch()} />
        ) : (
          <VideoGrid
            videos={videos}
            loading={feed.isLoading || (feed.isFetching && videos.length === 0)}
            emptyText="该分区暂时没有内容，换一个分区看看吧"
          />
        )}

        <div className="home__sentinel" ref={sentinelRef}>
          {feed.isFetchingNextPage && <span>正在加载更多…</span>}
          {!feed.hasNextPage && videos.length > 0 && <span>已经到底啦 ~</span>}
        </div>
      </div>
    </div>
  );
}
