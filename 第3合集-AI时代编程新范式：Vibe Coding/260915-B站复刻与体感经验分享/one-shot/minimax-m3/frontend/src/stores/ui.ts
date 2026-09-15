import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 一些简单 UI 状态：稍后再看、登录态、搜索历史
const HISTORY_KEY = 'bv-clone:search-history'

export const useUIStore = defineStore('ui', () => {
  const isLogged = ref(false)
  const username = ref('未登录')

  const searchHistory = ref<string[]>(loadHistory())
  const watchLater = ref<string[]>(loadWatchLater())

  function loadHistory(): string[] {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      return raw ? (JSON.parse(raw) as string[]) : []
    } catch {
      return []
    }
  }

  function loadWatchLater(): string[] {
    try {
      const raw = localStorage.getItem('bv-clone:watch-later')
      return raw ? (JSON.parse(raw) as string[]) : []
    } catch {
      return []
    }
  }

  function pushHistory(kw: string) {
    const k = kw.trim()
    if (!k) return
    const list = [k, ...searchHistory.value.filter((x) => x !== k)].slice(0, 8)
    searchHistory.value = list
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
  }

  function clearHistory() {
    searchHistory.value = []
    localStorage.removeItem(HISTORY_KEY)
  }

  function toggleWatchLater(bvid: string) {
    const list = watchLater.value.includes(bvid)
      ? watchLater.value.filter((x) => x !== bvid)
      : [bvid, ...watchLater.value]
    watchLater.value = list
    localStorage.setItem('bv-clone:watch-later', JSON.stringify(list))
  }

  const isInWatchLater = (bvid: string) => watchLater.value.includes(bvid)

  function fakeLogin() {
    isLogged.value = !isLogged.value
    username.value = isLogged.value ? '演示用户' : '未登录'
  }

  return {
    isLogged,
    username,
    searchHistory,
    watchLater,
    pushHistory,
    clearHistory,
    toggleWatchLater,
    isInWatchLater,
    fakeLogin,
  }
})
