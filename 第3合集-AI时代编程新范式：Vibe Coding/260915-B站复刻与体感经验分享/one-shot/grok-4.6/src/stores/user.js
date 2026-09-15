import { defineStore } from 'pinia'

const KEY = 'bili-user-state-v1'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: {
      name: '暮色小电视',
      avatar: '/images/avatars/up-coral.jpg',
      vip: true,
      coins: 42
    },
    watchLater: load().watchLater || [],
    history: load().history || [],
    likes: load().likes || [],
    coins: load().coins || [],
    favorites: load().favorites || [],
    following: load().following || [],
    searchHistory: load().searchHistory || ['重庆小面', '装机'],
    toasts: []
  }),
  actions: {
    persist() {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          watchLater: this.watchLater,
          history: this.history,
          likes: this.likes,
          coins: this.coins,
          favorites: this.favorites,
          following: this.following,
          searchHistory: this.searchHistory
        })
      )
    },
    toast(text) {
      const id = Date.now() + Math.random()
      this.toasts.push({ id, text })
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id)
      }, 2200)
    },
    toggleWatchLater(video) {
      const i = this.watchLater.findIndex((v) => v.bvid === video.bvid)
      if (i >= 0) {
        this.watchLater.splice(i, 1)
        this.toast('已从稍后再看移除')
      } else {
        this.watchLater.unshift({
          bvid: video.bvid,
          title: video.title,
          cover: video.cover,
          owner: video.owner?.name
        })
        this.toast('已添加至稍后再看')
      }
      this.persist()
    },
    isWatchLater(bvid) {
      return this.watchLater.some((v) => v.bvid === bvid)
    },
    pushHistory(video) {
      this.history = [
        { bvid: video.bvid, title: video.title, cover: video.cover, owner: video.owner?.name, at: Date.now() },
        ...this.history.filter((v) => v.bvid !== video.bvid)
      ].slice(0, 20)
      this.persist()
    },
    toggle(listName, bvid) {
      const list = this[listName]
      const i = list.indexOf(bvid)
      if (i >= 0) list.splice(i, 1)
      else list.unshift(bvid)
      this.persist()
      return i < 0
    },
    follow(mid) {
      const on = this.toggle('following', mid)
      this.toast(on ? '关注成功' : '取消关注')
      return on
    },
    addSearch(q) {
      const t = q.trim()
      if (!t) return
      this.searchHistory = [t, ...this.searchHistory.filter((x) => x !== t)].slice(0, 8)
      this.persist()
    },
    clearSearch() {
      this.searchHistory = []
      this.persist()
    }
  }
})
