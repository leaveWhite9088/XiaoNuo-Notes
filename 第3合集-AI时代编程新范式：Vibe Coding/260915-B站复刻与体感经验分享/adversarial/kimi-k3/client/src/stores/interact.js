import { defineStore } from 'pinia';

// 互动状态：点赞过的视频、关注过的 UP 主（会话内有效）
export const useInteractStore = defineStore('interact', {
  state: () => ({
    likedIds: [],
    followedUps: [],
  }),
  actions: {
    toggleLike(videoId) {
      const i = this.likedIds.indexOf(videoId);
      if (i >= 0) this.likedIds.splice(i, 1);
      else this.likedIds.push(videoId);
    },
    toggleFollow(upName) {
      const i = this.followedUps.indexOf(upName);
      if (i >= 0) this.followedUps.splice(i, 1);
      else this.followedUps.push(upName);
    },
  },
  getters: {
    isLiked: (s) => (id) => s.likedIds.includes(id),
    isFollowed: (s) => (name) => s.followedUps.includes(name),
  },
});
