import { defineStore } from 'pinia';
import { searchApi } from '@/api';
import type { Suggestion, VideoCard } from '@/types';

const RECENT_KEY = 'bili-clone:recent-search';

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

/** 搜索状态：热搜 / 实时建议 / 结果列表 / 本地搜索历史 */
export const useSearchStore = defineStore('search', {
  state: () => ({
    keyword: '',
    mode: 'hot' as 'hot' | 'suggest',
    hotSearch: [] as string[],
    suggestions: [] as Suggestion[],
    suggestLoading: false,
    results: [] as VideoCard[],
    total: 0,
    page: 0,
    hasMore: false,
    searching: false,
    resultKeyword: '',
    recent: readRecent(),
    sort: 'default' as 'default' | 'play' | 'newest' | 'danmaku',
    error: '',
  }),

  actions: {
    async loadSuggest(keyword: string) {
      this.keyword = keyword;
      this.suggestLoading = true;
      try {
        const data = await searchApi.suggest(keyword);
        this.mode = data.mode;
        this.hotSearch = data.hotSearch;
        this.suggestions = data.suggestions;
        this.error = '';
      } catch (err) {
        // 建议失败不应打断输入，降级为热搜榜
        this.mode = 'hot';
        this.suggestions = [];
        this.error = err instanceof Error ? err.message : '搜索建议加载失败';
      } finally {
        this.suggestLoading = false;
      }
    },

    async loadHot() {
      if (this.hotSearch.length) return;
      try {
        this.hotSearch = await searchApi.hot();
      } catch (err) {
        this.error = err instanceof Error ? err.message : '热搜加载失败';
      }
    },

    pushRecent(keyword: string) {
      const kw = keyword.trim();
      if (!kw) return;
      this.recent = [kw, ...this.recent.filter((k) => k !== kw)].slice(0, 8);
      localStorage.setItem(RECENT_KEY, JSON.stringify(this.recent));
    },

    clearRecent() {
      this.recent = [];
      localStorage.removeItem(RECENT_KEY);
    },

    async runSearch(keyword: string, reset = true) {
      const kw = keyword.trim();
      if (!kw) return;
      this.searching = true;
      this.resultKeyword = kw;
      this.error = '';
      this.pushRecent(kw);
      try {
        const page = reset ? 1 : this.page + 1;
        const data = await searchApi.search(kw, { page, sort: this.sort });
        this.results = reset ? data.list : [...this.results, ...data.list];
        this.total = data.total;
        this.page = page;
        this.hasMore = data.hasMore;
      } catch (err) {
        if (reset) {
          this.results = [];
          this.total = 0;
          this.hasMore = false;
        }
        this.error = err instanceof Error ? err.message : '搜索失败，请稍后重试';
      } finally {
        this.searching = false;
      }
    },

    async setSort(sort: 'default' | 'play' | 'newest' | 'danmaku') {
      this.sort = sort;
      await this.runSearch(this.resultKeyword || this.keyword, true);
    },
  },
});
