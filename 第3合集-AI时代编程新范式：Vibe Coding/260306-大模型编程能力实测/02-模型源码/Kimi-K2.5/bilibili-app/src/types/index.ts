// Bilibili API 类型定义

export interface VideoInfo {
  bvid: string;
  aid: number;
  title: string;
  description: string;
  pic: string;
  duration: number;
  owner: {
    mid: number;
    name: string;
    face: string;
  };
  stat: {
    view: number;
    danmaku: number;
    reply: number;
    favorite: number;
    coin: number;
    share: number;
    like: number;
  };
  pubdate: number;
}

export interface VideoUrl {
  url: string;
  quality: number;
  format: string;
}

export interface Comment {
  rpid: number;
  oid: number;
  type: number;
  mid: number;
  root: number;
  parent: number;
  dialog: number;
  count: number;
  rcount: number;
  like: number;
  hate: number;
  ctime: number;
  floor: number;
  state: number;
  message: string;
  member: {
    mid: string;
    uname: string;
    avatar: string;
    level_info: {
      current_level: number;
    };
  };
  replies?: Comment[];
}

export interface Danmaku {
  id: string;
  text: string;
  time: number;
  mode: number;
  size: number;
  color: number;
  timestamp: number;
  pool: number;
  author: string;
}

export interface UserInfo {
  mid: number;
  name: string;
  face: string;
  level: number;
  sign: string;
  coins: number;
  following: number;
  follower: number;
}

export interface FavoriteItem {
  id: number;
  type: number;
  title: string;
  cover: string;
  intro: string;
  cnt: number;
}

export interface SearchResult {
  result: VideoInfo[];
  numPages: number;
  numResults: number;
}

export interface LoginStatus {
  isLogin: boolean;
  userInfo?: UserInfo;
  sessdata?: string;
}
