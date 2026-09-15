/** 领域模型（后端内部使用；对外由 service 组装成 DTO） */
export interface Category {
  id: number;
  slug: string;
  name: string;
  rid: number;
  icon: string;
  sort: number;
}

export interface Owner {
  mid: number;
  name: string;
  avatar: string;
  sign: string;
  fans: number;
  videos: number;
}

export interface VideoRow {
  bvid: string;
  aid: number;
  cid: number;
  title: string;
  description: string;
  cover: string;
  video_url: string;
  duration: number;
  /** 演示播放源的真实片长（秒） */
  clip_duration: number;
  pubdate: number;
  tname: string;
  category_slug: string;
  play: number;
  danmaku: number;
  like_count: number;
  coin: number;
  favorite: number;
  reply: number;
  share: number;
  owner_mid: number;
  hot_score: number;
}

export interface VideoCard extends VideoRow {
  owner_name: string;
  owner_avatar: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  sort: number;
}

export interface CommentRow {
  id: number;
  bvid: string;
  author: string;
  avatar: string;
  content: string;
  like_count: number;
  /** seed = 演示数据，user = 用户真实发表 */
  source: string;
  created_at: number;
}

export interface DanmakuRow {
  id: number;
  bvid: string;
  time_ms: number;
  text: string;
  color: string;
  mode: number;
  source: string;
}

export interface Paged<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
