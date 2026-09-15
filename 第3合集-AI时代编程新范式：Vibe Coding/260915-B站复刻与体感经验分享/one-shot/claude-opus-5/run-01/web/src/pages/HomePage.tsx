/**
 * 首页：顶栏 + 分区导航 + 轮播 + 推荐信息流（分区筛选 / 排序 / 换一换 / 滚动加载）。
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppHeader } from '../components/layout/AppHeader';
import { ChannelNav } from '../components/layout/ChannelNav';
import { AppFooter } from '../components/layout/AppFooter';
import { SideToolbar } from '../components/layout/SideToolbar';
import { BannerCarousel } from '../components/home/BannerCarousel';
import { FeedToolbar } from '../components/home/FeedToolbar';
import { VideoGrid } from '../components/home/VideoGrid';
import { fetchBanners } from '../api/bili';
import { useAsync } from '../hooks/useAsync';
import { useFeed } from '../hooks/useFeed';
import './home.css';

export function HomePage() {
  const [params, setParams] = useSearchParams();
  const channel = params.get('channel') ?? 'all';
  const [sort, setSort] = useState('recommend');

  const { data: banners } = useAsync(() => fetchBanners(), []);
  const { items, loading, hasMore, error, loadMore, shuffle, page } = useFeed(channel, sort);

  const sentinel = useRef<HTMLDivElement>(null);

  const selectChannel = useCallback(
    (id: string) => {
      setParams(id === 'all' ? {} : { channel: id }, { replace: false });
    },
    [setParams],
  );

  // 滚动到底部自动加载下一页
  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) loadMore();
      },
      { rootMargin: '400px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  return (
    <div className="home">
      <div className="home__hero" aria-hidden="true">
        <img src="/media/banners/banner-2.jpg" alt="" />
        <span className="home__hero-mask" />
      </div>

      <AppHeader floating />
      <ChannelNav activeId={channel} onSelect={selectChannel} />

      <main className="home__main container">
        <FeedToolbar
          channelId={channel}
          sort={sort}
          onSortChange={setSort}
          onShuffle={shuffle}
          shuffling={loading && page === 1}
        />

        {error ? (
          <div className="home__error">
            加载失败：{error}
            <br />
            请确认后端服务已在 5601 端口启动。
          </div>
        ) : (
          <>
            <VideoGrid
              videos={items}
              loading={loading && items.length === 0}
              skeletonCount={14}
              leading={channel === 'all' ? <BannerCarousel banners={banners ?? []} /> : undefined}
            />

            <div className="home__loadmore" ref={sentinel}>
              {loading && items.length > 0 && <span className="home__loading">加载中…</span>}
              {!loading && hasMore && (
                <button className="home__loadmore-btn" onClick={loadMore}>
                  点击加载更多
                </button>
              )}
              {!hasMore && items.length > 0 && <span className="home__end">没有更多内容了 ~</span>}
            </div>
          </>
        )}
      </main>

      <SideToolbar />
      <AppFooter />
    </div>
  );
}
