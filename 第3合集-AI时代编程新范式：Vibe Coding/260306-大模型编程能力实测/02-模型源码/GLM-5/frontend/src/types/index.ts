// API 响应类型
export interface APIResponse<T = any> {
  success: boolean
  message: string
  data: T
  code: number
}

// 用户信息
export interface UserInfo {
  mid: number
  name: string
  face: string
  sign: string
  level: number
  vip_status: number
  is_login: boolean
}

// 视频信息
export interface VideoInfo {
  bvid: string
  aid: number
  title: string
  description: string
  cover: string
  duration: number
  view_count: number
  danmaku_count: number
  reply_count: number
  like_count: number
  coin_count: number
  share_count: number
  favorite_count: number
  pubdate: number
  owner: UserInfo
  tags: string[]
  page_url: string
}

// 视频分P
export interface VideoPage {
  cid: number
  page: number
  part: string
  duration: number
}

// 播放地址
export interface PlayUrl {
  quality: number
  timelength: number
  dash?: {
    video: any[]
    audio: any[]
  }
  durl?: any[]
}

// 评论
export interface Comment {
  rpid: number
  content: string
  ctime: number
  like: number
  member: UserInfo
  replies: Comment[]
}

// 弹幕
export interface Danmaku {
  id: number
  time: number
  content: string
  color: number
  type: number
}

// 收藏夹
export interface FavoriteFolder {
  id: number
  title: string
  intro: string
  media_count: number
  cover: string
}

// 搜索结果视频
export interface SearchVideo {
  bvid: string
  aid: number
  title: string
  cover: string
  duration: number
  play: number
  danmaku: number
  author: string
  description?: string
}

// 热门视频
export interface PopularVideo {
  bvid: string
  aid: number
  title: string
  cover: string
  duration: number
  play: number
  danmaku: number
  author: string
  description?: string
}

// 登录状态
export interface QRCodeStatus {
  success: boolean
  status: 'waiting' | 'scanned' | 'confirming' | 'done' | 'timeout' | 'error'
  message: string
}

// 收藏视频
export interface FavoriteVideo {
  bvid: string
  aid: number
  title: string
  cover: string
  duration: number
  play: number
  danmaku: number
  intro: string
  author: string
}
