/** 与后端 DTO 对齐的前端类型定义 */

export interface Category {
  slug: string;
  name: string;
  icon: string;
  count?: number;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

export interface VideoOwner {
  mid: number;
  name: string;
  avatar: string;
}

export interface VideoCard {
  bvid: string;
  title: string;
  cover: string;
  videoUrl: string;
  duration: number;
  durationText: string;
  pubdate: number;
  pubdateText: string;
  timeAgo: string;
  tname: string;
  categorySlug: string;
  description: string;
  play: number;
  playText: string;
  danmaku: number;
  danmakuText: string;
  like: number;
  likeText: string;
  coin: number;
  favorite: number;
  reply: number;
  share: number;
  owner: VideoOwner;
}

export interface Paged<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface HomeOverview {
  banners: Banner[];
  categories: Category[];
  hotSearch: string[];
  totalVideos: number;
}

export interface OwnerDetail {
  mid: number;
  name: string;
  avatar: string;
  sign: string;
  fans: number;
  videos: number;
}

export interface Interaction {
  liked: boolean;
  coined: boolean;
  faved: boolean;
  followed: boolean;
}

export interface VideoDetail {
  video: VideoCard;
  owner: OwnerDetail;
  tags: string[];
  interaction: Interaction;
  related: VideoCard[];
  danmakuCount: number;
}

export interface CommentItem {
  id: number;
  author: string;
  avatar: string;
  content: string;
  like: number;
  likeText: string;
  createdAt: number;
  timeAgo: string;
}

export interface DanmakuItem {
  time: number;
  text: string;
  color: string;
  mode: number;
}

export interface Suggestion {
  type: 'video' | 'up' | 'keyword';
  text: string;
  bvid?: string;
  mid?: number;
  cover?: string;
  playText?: string;
}

export interface SuggestResult {
  keyword: string;
  mode: 'hot' | 'suggest';
  hotSearch: string[];
  suggestions: Suggestion[];
}

export interface HistoryItem extends VideoCard {
  progress: number;
  watchedAt: number;
}

export interface RankItem extends VideoCard {
  rank: number;
}
