import { defineStore } from 'pinia';
import { searchApi } from '@/api/http.js';

/**
 * 搜索仓库：输入联想（防抖）、热搜、历史、结果。
 */
export const useSearchStore = defineStore('search', {
  state: () => ({
    keyword: '',
    suggestions: [],
    hotSearches: [],
    history: [],
    suggesting: false,
    result: { list: [], total: 0, page: 1, hasMore: false },
    loadingResult: false,
    panelOpen: false,
  }),

  actions: {
    async fetchHot() {
      if (this.hotSearches.length) return;
      try {
        const data = await searchApi.suggest('', 10);
        this.hotSearches = data || [];
      } catch {
        this.hotSearches = [];
      }
    },

    async fetchHistory() {
      try {
        this.history = (await searchApi.history()) || [];
      } catch {
        this.history = [];
      }
    },

    async clearHistory() {
      await searchApi.clearHistory();
      this.history = [];
    },

    async suggest(keyword) {
      this.keyword = keyword;
      if (!keyword.trim()) {
        this.suggestions = [];
        await this.fetchHot();
        return;
      }
      this.suggesting = true;
      try {
        this.suggestions = (await searchApi.suggest(keyword, 10)) || [];
      } catch {
        this.suggestions = [];
      } finally {
        this.suggesting = false;
      }
    },

    async search(keyword, extra = {}) {
      const kw = (keyword ?? this.keyword ?? '').trim();
      if (!kw) return;
      this.keyword = kw;
      this.loadingResult = true;
      try {
        const data = await searchApi.search({ keyword: kw, page: 1, pageSize: 20, ...extra });
        this.result = data;
      } finally {
        this.loadingResult = false;
      }
    },
  },
});

export default useSearchStore;
