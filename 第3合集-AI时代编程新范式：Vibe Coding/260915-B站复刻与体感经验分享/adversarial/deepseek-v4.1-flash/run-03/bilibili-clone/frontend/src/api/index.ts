import { http } from './http';
import type {
  Banner,
  Category,
  CommentItem,
  DanmakuItem,
  HistoryItem,
  HomeOverview,
  Interaction,
  Paged,
  RankItem,
  SuggestResult,
  VideoCard,
  VideoDetail,
} from '@/types';

/** 接口层：与后端 /api 一一对应的薄封装 */
export const homeApi = {
  overview: () => http.get<HomeOverview>('/api/home'),
  feed: (params: { category?: string; sort?: string; page?: number; pageSize?: number }) =>
    http.get<Paged<VideoCard>>('/api/feed', params),
  categories: () => http.get<Required<Category>[]>('/api/categories'),
  sidebar: (category = 'all') =>
    http.get<{ ranking: RankItem[]; online: number }>('/api/sidebar', { category }),
};

export const videoApi = {
  detail: (bvid: string) => http.get<VideoDetail>(`/api/videos/${bvid}`),
  play: (bvid: string) =>
    http.get<{ bvid: string; url: string; cover: string; title: string }>(`/api/videos/${bvid}/play`),
  danmaku: (bvid: string) => http.get<DanmakuItem[]>(`/api/videos/${bvid}/danmaku`),
  sendDanmaku: (bvid: string, text: string, timeMs: number, color = '#ffffff') =>
    http.post<DanmakuItem>(`/api/videos/${bvid}/danmaku`, { text, timeMs, color }),
  comments: (bvid: string, page = 1) =>
    http.get<Paged<CommentItem>>(`/api/videos/${bvid}/comments`, { page }),
  addComment: (bvid: string, content: string, author = '我') =>
    http.post<CommentItem>(`/api/videos/${bvid}/comments`, { content, author }),
  likeComment: (id: number) => http.post<{ id: number; ok: boolean }>(`/api/comments/${id}/like`),
  toggle: (bvid: string, field: 'liked' | 'coined' | 'faved' | 'followed') =>
    http.post<Interaction>(`/api/videos/${bvid}/toggle/${field}`),
};

export const searchApi = {
  suggest: (keyword: string) => http.get<SuggestResult>('/api/search/suggest', { keyword }),
  search: (keyword: string, params: { page?: number; sort?: string } = {}) =>
    http.get<Paged<VideoCard> & { keyword: string }>('/api/search', { keyword, ...params }),
  hot: () => http.get<string[]>('/api/search/hot'),
};

export const historyApi = {
  list: () => http.get<HistoryItem[]>('/api/history'),
  record: (bvid: string, progress: number) => http.post<{ ok: boolean }>('/api/history', { bvid, progress }),
  clear: () => http.del<{ ok: boolean }>('/api/history'),
};

/** 顶栏面板（收藏 / 动态 / 消息 / 创作中心） */
export const meApi = {
  favorites: (limit = 12) =>
    http.get<{ list: VideoCard[]; total: number }>('/api/me/favorites', { limit }),
  dynamics: (limit = 8) =>
    http.get<{ list: VideoCard[]; source: 'following' | 'latest' }>('/api/me/dynamics', { limit }),
  notifications: () =>
    http.get<{
      items: { id: string; type: string; title: string; desc: string; bvid?: string }[];
      unread: number;
    }>('/api/me/notifications'),
  creatorStats: () =>
    http.get<{
      faved: number;
      liked: number;
      coined: number;
      followed: number;
      watched: number;
      note: string;
    }>('/api/me/creator-stats'),
};

export type { Banner };
