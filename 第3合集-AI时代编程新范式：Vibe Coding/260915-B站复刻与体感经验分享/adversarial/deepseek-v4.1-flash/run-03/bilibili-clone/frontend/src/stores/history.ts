import { defineStore } from 'pinia';
import { historyApi } from '@/api';
import type { HistoryItem } from '@/types';

/** 观看历史：播放器上报进度，历史页读取 */
export const useHistoryStore = defineStore('history', {
  state: () => ({
    items: [] as HistoryItem[],
    loading: false,
    loaded: false,
    error: '',
  }),

  actions: {
    async load(force = false) {
      if (this.loaded && !force) return;
      this.loading = true;
      this.error = '';
      try {
        this.items = await historyApi.list();
        this.loaded = true;
      } catch (err) {
        this.error = err instanceof Error ? err.message : '历史记录加载失败';
      } finally {
        this.loading = false;
      }
    },

    async record(bvid: string, progress: number) {
      // 进度上报失败不应打断播放，静默降级
      try {
        await historyApi.record(bvid, progress);
        this.loaded = false;
      } catch {
        /* ignore */
      }
    },

    async clear() {
      try {
        await historyApi.clear();
        this.items = [];
        this.error = '';
      } catch (err) {
        this.error = err instanceof Error ? err.message : '清空失败';
      }
    },
  },
});
