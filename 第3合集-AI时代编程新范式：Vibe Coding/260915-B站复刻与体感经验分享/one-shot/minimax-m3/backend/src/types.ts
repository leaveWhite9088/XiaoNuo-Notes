export interface Category {
  tid: number
  name: string
  shortName?: string
  icon: string // 关键字，用于随机配图
  description: string
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
  duration: number // 秒
  pubdate: number // unix 秒
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

export interface Comment {
  rpid: number
  uname: string
  avatar: string
  message: string
  ctime: number
  like: number
  replies: number
}

export interface Section {
  id: string
  title: string
  subtitle?: string
  tid?: number
  videos: Video[]
}
