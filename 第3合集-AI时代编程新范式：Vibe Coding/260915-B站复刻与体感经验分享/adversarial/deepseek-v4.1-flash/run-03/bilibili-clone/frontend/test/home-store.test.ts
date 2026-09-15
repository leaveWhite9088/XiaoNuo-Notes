import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { VideoCard } from '@/types';

const overview = vi.fn();
const feed = vi.fn();

vi.mock('@/api', () => ({
  homeApi: {
    overview: (...args: unknown[]) => overview(...args),
    feed: (...args: unknown[]) => feed(...args),
    categories: vi.fn(),
    sidebar: vi.fn(),
  },
}));

const { useHomeStore } = await import('@/stores/home');

const card = (bvid: string, categorySlug: string): VideoCard =>
  ({
    bvid,
    title: `标题 ${bvid}`,
    categorySlug,
    play: 1,
    cover: '',
    videoUrl: '',
  }) as unknown as VideoCard;

const paged = (list: VideoCard[], total = list.length, hasMore = false) => ({
  list,
  total,
  page: 1,
  pageSize: 24,
  hasMore,
});

describe('home store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    overview.mockReset();
    feed.mockReset();
  });

  it('并发调用 loadOverview 只会真正请求一次（首页重复请求回归）', async () => {
    let resolve!: (v: unknown) => void;
    overview.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );

    const store = useHomeStore();
    const a = store.loadOverview();
    const b = store.loadOverview();
    const c = store.loadOverview();
    expect(overview).toHaveBeenCalledTimes(1);

    resolve({
      banners: [],
      categories: [{ slug: 'all', name: '全部', icon: 'home' }],
      hotSearch: ['x'],
      totalVideos: 1,
    });
    await Promise.all([a, b, c]);
    expect(store.overviewLoaded).toBe(true);
    expect(store.totalVideos).toBe(1);

    // 已经加载过则不再请求
    await store.loadOverview();
    expect(overview).toHaveBeenCalledTimes(1);
  });

  it('按「分区 + 排序」缓存并互不串台', async () => {
    feed.mockImplementation(({ category }: { category: string }) =>
      Promise.resolve(paged([card(`${category}-1`, category)])),
    );

    const store = useHomeStore();
    await store.setCategory('dance');
    expect(store.feed.list[0]!.categorySlug).toBe('dance');

    await store.setCategory('game');
    expect(store.feed.list[0]!.categorySlug).toBe('game');

    // 回到 dance 命中缓存，不再发请求
    const calls = feed.mock.calls.length;
    await store.setCategory('dance');
    expect(store.feed.list[0]!.categorySlug).toBe('dance');
    expect(feed.mock.calls.length).toBe(calls);
  });

  it('响应返回时分区已切换：结果只写回自己的缓存桶，不污染当前视图', async () => {
    let resolveDance!: (v: unknown) => void;
    feed.mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolveDance = r;
        }),
    );
    feed.mockImplementationOnce(() => Promise.resolve(paged([card('game-1', 'game')])));

    const store = useHomeStore();
    const dancePromise = store.setCategory('dance');
    await store.setCategory('game');
    resolveDance(paged([card('dance-1', 'dance')]));
    await dancePromise;

    expect(store.activeCategory).toBe('game');
    expect(store.feed.list[0]!.categorySlug).toBe('game');
    expect(store.feeds['dance::default']?.list[0]?.categorySlug).toBe('dance');
  });

  it('接口失败时写入 error 而不是抛出未处理异常', async () => {
    feed.mockRejectedValue(new Error('后端挂了'));
    const store = useHomeStore();
    await store.setCategory('dance');
    expect(store.feed.error).toBe('后端挂了');
    expect(store.feed.list).toEqual([]);
    expect(store.feed.loading).toBe(false);
  });

  it('排序切换到不同维度会重新请求', async () => {
    feed.mockImplementation(({ sort }: { sort: string }) =>
      Promise.resolve(paged([card(`x-${sort}`, 'all')])),
    );
    const store = useHomeStore();
    await store.setSort('play');
    expect(feed).toHaveBeenCalledWith(expect.objectContaining({ sort: 'play' }));
    await store.setSort('newest');
    expect(feed).toHaveBeenCalledWith(expect.objectContaining({ sort: 'newest' }));
  });
});
