/** 与后端 backend/src/types.ts 对应的数据契约 */

export interface Owner {
  mid: number;
  name: string;
  face: string;
  sign: string;
  fans: number;
  videoCount: number;
  level: number;
}

export interface VideoStat {
  view: number;
  danmaku: number;
  reply: number;
  favorite: number;
  coin: number;
  share: number;
  like: number;
}

export interface VideoCard {
  bvid: string;
  title: string;
  cover: string;
  duration: number;
  pubdate: number;
  channelId: string;
  partitionName: string;
  owner: Owner;
  /** 当前用户是否已加入稍后再看 */
  watchLater: boolean;
  stat: VideoStat;
}

export interface VideoDetail extends VideoCard {
  aid: number;
  cid: number;
  desc: string;
  playUrl: string;
  copyright: number;
  pubLocation: string;
  width: number;
  height: number;
  tags: string[];
  actions: { like: boolean; coin: boolean; favorite: boolean };
}

export interface Channel {
  id: string;
  name: string;
  icon: string;
  color: string;
  videoCount: number;
}

export interface Comment {
  id: string;
  bvid: string;
  content: string;
  like: number;
  replyCount: number;
  ctime: number;
  user: Pick<Owner, 'mid' | 'name' | 'face' | 'level'>;
}

export interface Danmaku {
  id: string;
  time: number;
  mode: string;
  color: string;
  text: string;
}

export interface Banner {
  id: string;
  bvid: string;
  title: string;
  image: string;
  badge: string;
}

export interface Paged<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export type FeedSort = 'recommend' | 'hot' | 'latest' | 'danmaku';
export type SearchOrder = 'default' | 'view' | 'pubdate' | 'danmaku';

export interface SearchSuggestion {
  keyword: string;
  type: 'video' | 'up' | 'tag' | 'hot';
  extra?: string;
  cover?: string;
}

export interface HotSearch {
  rank: number;
  keyword: string;
  showName: string;
}

export interface HistoryItem extends VideoCard {
  progress: number;
  viewedAt: number;
}

export interface StatSnapshot {
  view_count: number;
  like_count: number;
  coin_count: number;
  favorite_count: number;
  share_count: number;
  danmaku_count: number;
  reply_count: number;
}
