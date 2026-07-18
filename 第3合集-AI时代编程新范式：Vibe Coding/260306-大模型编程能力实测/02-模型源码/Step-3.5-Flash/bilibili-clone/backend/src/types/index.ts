export interface VideoInfo {
  bvid: string;
  aid: number;
  title: string;
  description: string;
  cover: string;
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
  duration: number;
  pubdate: number;
  tname: string;
  videos: number;
  cid: number;
  pages?: Array<{ cid: number }>;
}

export interface VideoPlayUrl {
  quality: number;
  format: string;
  timelength: number;
  accept_description: string[];
  accept_quality: number[];
  from: string;
  result: {
    quality: number;
    format: string;
    timelength: number;
    accept_description: string[];
    accept_quality: number[];
    durl: {
      order: number;
      length: number;
      size: number;
      url: string;
      backup_url: string[];
    }[];
  }[];
}

export interface Comment {
  rpid: number;
  oid: number;
  bvid: string;
  mid: number;
  content: string;
  ctime: number;
  like: number;
  count: number;
  rcount: number;
  up_like: boolean;
  up_action: number;
  member: {
    mid: number;
    uname: string;
    avatar: string;
    level_info: {
      current_level: number;
    };
    pendant: {
      pid: number;
      image: string;
    };
    nickname: string;
    sig?: string;
  };
  replies?: Comment[];
  show_follow: boolean;
  assist?: {
    likes: number;
  };
  is_up: boolean;
}

export interface Danmaku {
  id: number;
  cid: number;
  mid: number;
  name: string;
  content: string;
  date: number;
  action: number;
  mode: number;
  color: number;
  fontsize: number;
  pool: number;
  shadow: boolean;
}

export interface DanmakuSegment {
  segment: {
    start: number;
    end: number;
    content: string[];
  };
}

export interface UserInfo {
  mid: number;
  name: string;
  face: string;
  top_photo: string;
  sign: string;
  level: number;
  coins: number;
  vip: {
    type: number;
    status: number;
    due_date: number;
  };
  pendant: {
    pid: number;
    image: string;
  };
  album_count: number;
  article_count: number;
  following: number;
  follower: number;
  video_count: number;
  favourite_count: number;
  black_count: number;
  tag: string[];
  is_host_bili: boolean;
  is_followed: boolean;
}

export interface UserFavorites {
  fid: number;
  mid: number;
  title: string;
  upper: {
    mid: number;
    name: string;
  };
  media_count: number;
  cover: string;
  member_count: number;
  type: number;
}

export interface LoginResult {
  code: number;
  message: string;
  cookie: string;
  csrf: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface SessionUser {
  mid: number;
  uname: string;
  face: string;
  cookie: string;
  csrf: string;
  isLogin: boolean;
}

export interface DanmakuSendResult {
  code: number;
  message: string;
  data?: {
    dmid?: number;
  };
}

export interface CommentSendResult {
  code: number;
  message: string;
  data?: {
    rpid?: number;
  };
}