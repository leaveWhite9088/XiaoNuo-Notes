import { defineStore } from 'pinia';
import { homeApi, catalogApi } from '@/api/http.js';

/**
 * 首页数据仓库：整页聚合 + 分类分页加载。
 */
export const useHomeStore = defineStore('home', {
  state: () => ({
    loading: false,
    error: '',
    banners: [],
    categories: [],
    navCategories: [],
    hotSearches: [],
    feed: { list: [], total: 0, page: 1, pageSize: 20, hasMore: false },
    ranking: [],
    rankCategory: null,
    trending: [],
    hotComments: [],
    // 信息流筛选状态
    activeCategory: 'all',
    activeSort: 'hot',
    loadingMore: false,
  }),

  getters: {
    /** 5 列网格里除轮播占位外还需要展示的卡片 */
    visibleVideos: (state) => state.feed.list,
  },

  actions: {
    async fetchHome() {
      this.loading = true;
      this.error = '';
      try {
        const data = await homeApi.getHome();
        this.banners = data.banners || [];
        this.categories = data.categories || [];
        this.navCategories = data.navCategories || [];
        this.hotSearches = data.hotSearches || [];
        this.feed = data.feed || this.feed;
        this.ranking = data.ranking || [];
        this.rankCategory = data.rankCategory || null;
        this.trending = data.trending || [];
        this.hotComments = data.hotComments || [];
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    /** 切换分区筛选项 */
    async applyFilter({ category, sort } = {}) {
      if (category !== undefined) this.activeCategory = category;
      if (sort !== undefined) this.activeSort = sort;
      this.loading = true;
      try {
        const data = await homeApi.getFeed({
          category: this.activeCategory,
          sort: this.activeSort,
          page: 1,
          pageSize: this.feed.pageSize || 20,
        });
        this.feed = data;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    /** 滚动加载更多 */
    async loadMore() {
      if (this.loadingMore || !this.feed.hasMore) return;
      this.loadingMore = true;
      try {
        const nextPage = (this.feed.page || 1) + 1;
        const data = await homeApi.getFeed({
          category: this.activeCategory,
          sort: this.activeSort,
          page: nextPage,
          pageSize: this.feed.pageSize || 20,
        });
        this.feed = {
          ...data,
          list: [...this.feed.list, ...(data.list || [])],
        };
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loadingMore = false;
      }
    },

    async refreshFilters() {
      try {
        const data = await catalogApi.list('filter');
        this.categories = data || [];
      } catch {
        /* 静默失败，保留旧数据 */
      }
    },
  },
});

export default useHomeStore;
