import { defineStore } from 'pinia';

/** 本地用户态：观看历史 / 稍后再看 / 收藏 / 点赞投币 / 关注 / 搜索历史。
 *  演示项目无账号体系，统一持久化在 localStorage（见 README 简化项）。 */
const KEY = 'bili-clone-user-v1';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function brief(video) {
  // 只保存面板展示需要的最小字段
  return {
    bvid: video.bvid,
    title: video.title,
    cover: video.cover,
    duration: video.duration,
    ownerName: video.owner?.name,
    view: video.stat?.view,
    at: Date.now(),
  };
}

export const useUserStore = defineStore('user', {
  state: () => {
    const saved = load();
    return {
      history: saved.history || [], // [{bvid,title,cover,at}]
      watchLater: saved.watchLater || [],
      favorites: saved.favorites || [],
      likes: saved.likes || {}, // bvid -> 1
      coins: saved.coins || {}, // bvid -> 硬币数
      followed: saved.followed || {}, // mid -> 1
      searchHistory: saved.searchHistory || [], // [string]
      localComments: saved.localComments || {}, // bvid -> [comment]
    };
  },
  actions: {
    persist() {
      const { history, watchLater, favorites, likes, coins, followed, searchHistory, localComments } = this;
      localStorage.setItem(KEY, JSON.stringify({ history, watchLater, favorites, likes, coins, followed, searchHistory, localComments }));
    },
    recordHistory(video) {
      this.history = [brief(video), ...this.history.filter((h) => h.bvid !== video.bvid)].slice(0, 50);
      this.persist();
    },
    toggleWatchLater(video) {
      const exists = this.watchLater.some((w) => w.bvid === video.bvid);
      this.watchLater = exists ? this.watchLater.filter((w) => w.bvid !== video.bvid) : [brief(video), ...this.watchLater];
      this.persist();
      return !exists;
    },
    hasWatchLater(bvid) {
      return this.watchLater.some((w) => w.bvid === bvid);
    },
    toggleFavorite(video) {
      const exists = this.favorites.some((f) => f.bvid === video.bvid);
      this.favorites = exists ? this.favorites.filter((f) => f.bvid !== video.bvid) : [brief(video), ...this.favorites];
      this.persist();
      return !exists;
    },
    hasFavorite(bvid) {
      return this.favorites.some((f) => f.bvid === bvid);
    },
    toggleLike(bvid) {
      if (this.likes[bvid]) delete this.likes[bvid];
      else this.likes[bvid] = 1;
      this.persist();
      return !!this.likes[bvid];
    },
    addCoins(bvid, n) {
      this.coins[bvid] = (this.coins[bvid] || 0) + n;
      this.persist();
    },
    toggleFollow(mid) {
      if (this.followed[mid]) delete this.followed[mid];
      else this.followed[mid] = 1;
      this.persist();
      return !!this.followed[mid];
    },
    pushSearch(q) {
      const t = q.trim();
      if (!t) return;
      this.searchHistory = [t, ...this.searchHistory.filter((s) => s !== t)].slice(0, 10);
      this.persist();
    },
    removeSearch(q) {
      this.searchHistory = this.searchHistory.filter((s) => s !== q);
      this.persist();
    },
    addLocalComment(bvid, content, user = { name: '游客_114514', face: null }) {
      const list = this.localComments[bvid] || [];
      list.unshift({ id: `local-${Date.now()}`, user, content, time: '刚刚', likes: 0, liked: false, replyCount: 0, isMine: true });
      this.localComments[bvid] = list;
      this.persist();
    },
    toggleCommentLike(bvid, id) {
      const c = (this.localComments[bvid] || []).find((x) => x.id === id);
      if (c) {
        c.liked = !c.liked;
        c.likes += c.liked ? 1 : -1;
        this.persist();
      }
    },
  },
});
