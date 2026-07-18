export type VideoCard = {
  bvid: string
  title: string
  cover: string
  desc: string
  author: string
  play: string
  danmaku: string
  like?: string
  duration: string | number
}

export type VideoDetail = {
  aid: number
  bvid: string
  cid: number | null
  title: string
  desc: string
  cover: string
  published_at: number
  author: string
  author_mid: number
  author_avatar: string
  player_url: string
  official_url: string
  stats: Record<string, string>
  pages: Array<{
    page: number
    cid: number
    part: string
    duration: number
  }>
}

export type CommentItem = {
  id: number
  message: string
  like: number
  replies: number
  ctime: number
  user: {
    name: string
    avatar: string
    level: number
    mid: number
  }
}

export type DanmakuItem = {
  text: string
  time: number
  mode: number
  font_size: number
  color: string
}

export type Profile = {
  mid: number
  name: string
  avatar: string
  sign: string
  level: number
  coins: number
}

export type FavoriteGroup = {
  id: number
  title: string
  count: number
  cover: string
  items: Array<{
    id: number
    title: string
    cover: string
    upper: string
    duration: number
    bvid: string
    play: string
  }>
}

export type AuthStatus = {
  logged_in: boolean
  profile?: Profile
}

export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}
