import { defineStore } from 'pinia';

const STORAGE_KEY = 'bili-user-actions';
const GROUPS = ['like', 'coin', 'favorite', 'follow', 'later'];

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return Object.fromEntries(GROUPS.map((g) => [g, new Set(raw[g] || [])]));
  } catch {
    return Object.fromEntries(GROUPS.map((g) => [g, new Set()]));
  }
}

// 用户行为状态：点赞/投币/收藏/关注/稍后再看，localStorage 持久化
export const useUserStore = defineStore('user', {
  state: () => ({ actions: load(), profile: { name: 'bili_演示用户', face: '/static/avatars/me.jpg' } }),
  getters: {
    has: (state) => (group, id) => state.actions[group]?.has(id) || false,
  },
  actions: {
    persist() {
      const raw = Object.fromEntries(GROUPS.map((g) => [g, [...this.actions[g]]]));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
    },
    toggle(group, id) {
      const set = this.actions[group];
      if (!set) return false;
      if (set.has(id)) set.delete(id);
      else set.add(id);
      this.persist();
      return set.has(id);
    },
  },
});
