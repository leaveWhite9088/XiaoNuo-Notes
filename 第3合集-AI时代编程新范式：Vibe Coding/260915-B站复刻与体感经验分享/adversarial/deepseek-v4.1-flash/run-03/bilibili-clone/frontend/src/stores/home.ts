import { defineStore } from 'pinia';
import { homeApi } from '@/api';
import type { Banner, Category, VideoCard } from '@/types';

interface FeedState {
  list: VideoCard[];
  page: number;
  total: number;
  hasMore: boolean;
  loading: boolean;
  loaded: boolean;
  error: string;
}

export type FeedSort = 'default' | 'play' | 'newest' | 'danmaku';

const emptyFeed = (): FeedState => ({
  list: [],
  page: 0,
  total: 0,
  hasMore: true,
  loading: false,
  loaded: false,
  error: '',
});

/**
 * 首页 / 分区页共用的浏览状态。
 *
 * 关键约定：
 * - `activeCategory` 表示「当前页面正在浏览的分区」，由页面挂载时显式设置：
 *   首页 → all，分区页 → 路由里的 slug；
 * - 分区页切换 tab 走路由跳转（URL / 标题 / 筛选三者保持一致）；
 * - 视频流按「分区 + 排序」缓存，互不串台。
 */
export const useHomeStore = defineStore('home', {
  state: () => ({
    banners: [] as Banner[],
    categories: [] as Category[],
    hotSearch: [] as string[],
    totalVideos: 0,
    overviewLoaded: false,
    overviewError: '',
    activeCategory: 'all',
    activeSort: 'default' as FeedSort,
    feeds: {} as Record<string, FeedState>,
    /** 聚合请求的并发去重句柄（不参与渲染） */
    _overviewPromise: null as Promise<void> | null,
  }),

  getters: {
    feedKey(state): string {
      return `${state.activeCategory}::${state.activeSort}`;
    },
    feed(state): FeedState {
      return state.feeds[`${state.activeCategory}::${state.activeSort}`] ?? emptyFeed();
    },
    categoryName(state) {
      return (slug: string) => state.categories.find((c) => c.slug === slug)?.name ?? '全部';
    },
  },

  actions: {
    /** 首屏聚合数据：App 与页面并发调用时只会真正请求一次 */
    async loadOverview() {
      if (this.overviewLoaded) return;
      if (!this._overviewPromise) {
        this._overviewPromise = (async () => {
          try {
            const data = await homeApi.overview();
            this.banners = data.banners;
            this.categories = data.categories;
            this.hotSearch = data.hotSearch;
            this.totalVideos = data.totalVideos;
            this.overviewLoaded = true;
            this.overviewError = '';
          } catch (err) {
            this.overviewError = err instanceof Error ? err.message : '首页数据加载失败';
            throw err;
          } finally {
            this._overviewPromise = null;
          }
        })();
      }
      return this._overviewPromise;
    },

    async loadFeed(reset = false) {
      const key = `${this.activeCategory}::${this.activeSort}`;
      if (!this.feeds[key]) this.feeds[key] = emptyFeed();
      const feed = this.feeds[key];
      if (feed.loading) return;
      if (!reset && feed.loaded && !feed.hasMore) return;

      feed.loading = true;
      feed.error = '';
      try {
        const page = reset ? 1 : feed.page + 1;
        const data = await homeApi.feed({
          category: this.activeCategory,
          sort: this.activeSort,
          page,
          pageSize: 24,
        });
        // 结果始终写回它自己的分区缓存桶：即使请求期间用户已切走，
        // 也只是「预热缓存」，绝不影响当前视图（当前视图读的是自己的桶）
        feed.list = reset ? data.list : [...feed.list, ...data.list];
        feed.page = page;
        feed.total = data.total;
        feed.hasMore = data.hasMore;
        feed.loaded = true;
      } catch (err) {
        feed.error = err instanceof Error ? err.message : '加载失败，请稍后重试';
      } finally {
        feed.loading = false;
      }
    },

    /** 分区筛选：首页在页内切换（不改变 URL），分区页由路由驱动 */
    async setCategory(slug: string) {
      if (this.activeCategory === slug) {
        await this.ensureFeed();
        return;
      }
      this.activeCategory = slug;
      // 命中的缓存直接复用，未缓存才发起请求（切换分区不闪白）
      await this.ensureFeed();
    },

    async setSort(sort: FeedSort) {
      if (this.activeSort === sort) return;
      this.activeSort = sort;
      await this.loadFeed(true);
    },

    async ensureFeed() {
      const feed = this.feed;
      if (!feed.loaded && !feed.loading) await this.loadFeed(true);
    },

    async retryFeed() {
      await this.loadFeed(true);
    },

    loadMore() {
      return this.loadFeed(false);
    },
  },
});
