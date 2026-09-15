export interface Owner {
  name: string;
  face: string;
  mid: number;
}

export interface Stat {
  view: number;
  danmaku: number;
  like: number;
  coin: number;
  favorite: number;
  share: number;
  reply: number;
}

export interface VideoCard {
  id: number;
  bvid: string;
  title: string;
  pic: string;
  duration: number;
  cat: string;
  tname: string;
  pubdate: number;
  stream: string;
  owner: Owner;
  stat: Pick<Stat, 'view' | 'danmaku' | 'like' | 'reply'>;
}

export interface VideoDetail extends VideoCard {
  desc: string;
  stream: string;
  stat: Stat;
}

export interface Category {
  id: string;
  name: string;
  count: number;
}

export interface FeedPage {
  list: VideoCard[];
  total: number;
  page: number;
  size: number;
  hasMore: boolean;
}

export interface VideoComment {
  id: number;
  uname: string;
  level: number;
  content: string;
  like: number;
  ctime: number;
}

export interface DetailData {
  video: VideoDetail;
  related: VideoCard[];
  comments: VideoComment[];
}

export interface SuggestItem {
  text: string;
  kind: 'bili' | 'title' | 'hot';
  id?: number;
  bvid?: string;
}
