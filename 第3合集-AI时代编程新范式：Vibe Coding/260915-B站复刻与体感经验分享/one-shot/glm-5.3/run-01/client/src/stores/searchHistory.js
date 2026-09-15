import { defineStore } from 'pinia';

const STORAGE_KEY = 'bili-search-history';
const MAX = 10;

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export const useSearchHistoryStore = defineStore('searchHistory', {
  state: () => ({ list: load() }),
  actions: {
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.list));
    },
    add(keyword) {
      const q = String(keyword || '').trim();
      if (!q) return;
      this.list = [q, ...this.list.filter((k) => k !== q)].slice(0, MAX);
      this.persist();
    },
    remove(keyword) {
      this.list = this.list.filter((k) => k !== keyword);
      this.persist();
    },
    clear() {
      this.list = [];
      this.persist();
    },
  },
});
