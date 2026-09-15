import axios from 'axios'

export const http = axios.create({
  baseURL: '/api',
  timeout: 8000,
})

export interface Category {
  tid: number
  name: string
  description: string
  icon: string
}

export interface NavItem {
  tid: number
  name: string
  path: string
}

export interface Up {
  mid: number
  name: string
  avatar: string
  fans: number
  isVerified: boolean
  signature: string
}

export interface Video {
  bvid: string
  aid: number
  title: string
  cover: string
  duration: number
  pubdate: number
  up: Up
  tid: number
  typename: string
  views: number
  danmaku: number
  likes: number
  coins: number
  favorites: number
  description: string
  tags: string[]
  isBangumi?: boolean
  isCooperation?: boolean
}

export interface Section {
  id: string
  title: string
  subtitle?: string
  tid?: number
  videos: Video[]
}

export interface Comment {
  rpid: number
  uname: string
  avatar: string
  message: string
  ctime: number
  like: number
  replies: number
}

export const api = {
  ping: () => http.get<{ ok: boolean; time: number }>('/ping'),
  home: () => http.get<{ sections: Section[] }>('/home'),
  categories: () => http.get<{ categories: Category[]; nav: { tid: number; name: string; path: string }[] }>('/categories'),
  hot: (limit = 100) => http.get<{ items: Video[] }>('/hot', { params: { limit } }),
  search: (kw: string, limit = 20) => http.get<{ items: Video[]; total: number }>('/search', { params: { kw, limit } }),
  suggest: (kw: string) => http.get<{ items: string[] }>('/search/suggest', { params: { kw } }),
  channel: (tid: number, page = 1, pageSize = 30) =>
    http.get<{ category: Category; items: Video[]; total: number; hasMore: boolean }>(`/channel/${tid}`, {
      params: { page, pageSize },
    }),
  video: (bvid: string) => http.get<{ video: Video; related: Video[]; comments: Comment[] }>(`/video/${bvid}`),
  stats: () => http.get<{ totalVideos: number; totalCategories: number }>('/stats'),
}

// 工具函数
export function formatViews(n: number): string {
  if (n >= 100_000_000) return (n / 100_000_000).toFixed(1) + '亿'
  if (n >= 10_000) return (n / 10_000).toFixed(1) + '万'
  return String(n)
}

export function formatDuration(seconds: number): string {
  const s = Math.floor(seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
  return `${m}:${String(ss).padStart(2, '0')}`
}

export function formatPubdate(unix: number): string {
  const d = new Date(unix * 1000)
  const now = Date.now()
  const diff = (now - d.getTime()) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
  if (diff < 86400) return Math.floor(diff / 3600) + '小时前'
  if (diff < 86400 * 30) return Math.floor(diff / 86400) + '天前'
  if (diff < 86400 * 365) return Math.floor(diff / 86400 / 30) + '个月前'
  return Math.floor(diff / 86400 / 365) + '年前'
}
