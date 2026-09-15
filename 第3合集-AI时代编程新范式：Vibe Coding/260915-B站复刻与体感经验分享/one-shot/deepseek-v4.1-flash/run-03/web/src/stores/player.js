import { defineStore } from 'pinia';
import { videoApi } from '@/api/http.js';

/**
 * 播放器仓库：播放地址、进度、清晰度、弹幕开关、历史记录。
 */
export const usePlayerStore = defineStore('player', {
  state: () => ({
    bvid: '',
    playInfo: null,
    loadingInfo: false,
    error: '',
    quality: 64,
    playing: false,
    muted: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    showDanmaku: true,
    danmakuList: [],
    favorite: false,
    lastHistoryAt: 0,
  }),

  getters: {
    /** 当前清晰度标签 */
    qualityLabel: (state) => {
      const hit = (state.playInfo?.qualities || []).find((q) => q.qn === state.quality);
      return hit?.label || `${state.quality}P`;
    },
    streamUrl: (state) =>
      state.playInfo ? `${state.playInfo.streamUrl}&t=${state.playInfo.cid || ''}` : '',
  },

  actions: {
    async loadPlayInfo(bvid, qn) {
      this.bvid = bvid;
      this.loadingInfo = true;
      this.error = '';
      try {
        this.playInfo = await videoApi.playInfo(bvid, qn);
        this.quality = this.playInfo.quality;
      } catch (err) {
        this.error = err.message;
        this.playInfo = null;
      } finally {
        this.loadingInfo = false;
      }
    },

    async switchQuality(qn) {
      if (qn === this.quality) return;
      await this.loadPlayInfo(this.bvid, qn);
    },

    setDanmaku(list) {
      this.danmakuList = list || [];
    },

    reset() {
      this.bvid = '';
      this.playInfo = null;
      this.error = '';
      this.playing = false;
      this.currentTime = 0;
      this.duration = 0;
      this.danmakuList = [];
    },

    /** 节流上报观看进度 */
    async reportProgress(force = false) {
      if (!this.bvid || !this.duration) return;
      const now = Date.now();
      if (!force && now - this.lastHistoryAt < 8000) return;
      this.lastHistoryAt = now;
      try {
        await videoApi.recordHistory(this.bvid, Math.floor(this.currentTime));
      } catch {
        /* 忽略上报失败 */
      }
    },

    async toggleFavorite(bvid) {
      const res = await videoApi.toggleFavorite?.(bvid);
      this.favorite = Boolean(res?.favorited);
      return this.favorite;
    },
  },
});

export default usePlayerStore;
