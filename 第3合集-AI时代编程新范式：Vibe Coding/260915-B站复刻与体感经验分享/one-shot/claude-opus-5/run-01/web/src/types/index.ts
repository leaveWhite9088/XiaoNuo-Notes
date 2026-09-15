/** 前后端共享的数据结构定义。 */

export interface UpBrief {
  mid: number;
  name: string;
  avatar: string;
  followers: number;
}

export interface VideoStats {
  view: number;
  danmaku: number;
  like?: number;
  coin?: number;
  favorite?: number;
  share?: number;
  reply?: number;
}

/** 信息流卡片 */
export interface VideoCardData {
  bvid: string;
  title: string;
  cover: string;
  duration: number;
  publishedAt: string;
  channelId: string;
  channelName: string;
  up: UpBrief;
  stats: VideoStats;
  previewUrl: string;
}

/** 播放页详情 */
export interface VideoDetail extends VideoCardData {
  aid: number;
  desc: string;
  tags: string[];
  copyright: string;
  subChannel: string;
  videoUrl: string;
  stats: Required<VideoStats>;
  related: VideoCardData[];
}

export interface Channel {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

export interface NavConfig {
  primaryNav: { id: string; name: string; href: string }[];
  channels: Channel[];
  morePanel: { group: string; items: { id: string; name: string; icon: string }[] }[];
  sorts: { id: string; name: string }[];
  hotSearches: string[];
  searchPlaceholders: string[];
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  subTitle: string;
  bvid: string;
}

export interface FeedResponse {
  channel: Channel;
  sort: string;
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  items: VideoCardData[];
}

export interface CommentUser {
  name: string;
  avatar: string;
  level: number;
  isVip?: boolean;
}

export interface CommentReply {
  id: string;
  user: CommentUser;
  content: string;
  likes: number;
  publishedAt: string;
}

export interface Comment extends CommentReply {
  dislikes: number;
  top: boolean;
  replies: CommentReply[];
}

export interface CommentPage {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  items: Comment[];
}

export interface DanmakuItem {
  id: string;
  /** 进度百分比 0~1，前端按播放器真实时长换算成秒 */
  p: number;
  time: number;
  text: string;
  color: string;
  mode: 'scroll' | 'top';
  fontSize: number;
  self?: boolean;
}

export interface SuggestItem {
  text: string;
  type: 'video' | 'word' | 'user';
  bvid: string;
}

export interface HotSearchItem {
  rank: number;
  text: string;
  hot: number;
}

export interface SearchResponse {
  keyword: string;
  order: string;
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  items: VideoCardData[];
}
