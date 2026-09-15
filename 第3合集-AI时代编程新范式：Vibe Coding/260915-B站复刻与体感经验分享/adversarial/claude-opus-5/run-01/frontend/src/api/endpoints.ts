import { http } from './client';
import type {
  Banner,
  Channel,
  Comment,
  Danmaku,
  FeedSort,
  HistoryItem,
  HotSearch,
  Paged,
  SearchOrder,
  SearchSuggestion,
  StatSnapshot,
  VideoCard,
  VideoDetail,
} from '../types';

export const api = {
  bootstrap: () =>
    http.get<{
      channels: Channel[];
      banners: Banner[];
      featured: VideoCard[];
    }>('/api/bootstrap'),

  channels: () => http.get<Channel[]>('/api/channels'),
  banners: () => http.get<Banner[]>('/api/banners'),

  feed: (params: { channel?: string; sort?: FeedSort; page?: number; seed?: number }) =>
    http.get<Paged<VideoCard>>('/api/videos', params),

  video: (bvid: string) => http.get<VideoDetail>(`/api/videos/${bvid}`),
  related: (bvid: string, limit = 12) => http.get<VideoCard[]>(`/api/videos/${bvid}/related`, { limit }),
  comments: (bvid: string, sort: 'hot' | 'time' = 'hot') =>
    http.get<Comment[]>(`/api/videos/${bvid}/comments`, { sort }),
  danmaku: (bvid: string) => http.get<Danmaku[]>(`/api/videos/${bvid}/danmaku`),

  /** 进入播放页：播放量 +1（每次进入只调一次） */
  reportPlay: (bvid: string) => http.post<StatSnapshot>(`/api/videos/${bvid}/play`),
  /** 离开播放页：只保存进度，不计播放 */
  reportProgress: (bvid: string, progress: number) =>
    http.post<{ bvid: string; progress: number }>(`/api/videos/${bvid}/progress`, { progress }),
  toggleAction: (bvid: string, action: 'like' | 'coin' | 'favorite' | 'watchlater') =>
    http.post<{ bvid: string; action: string; active: boolean; stat: StatSnapshot }>(
      `/api/videos/${bvid}/actions/${action}`,
    ),
  triple: (bvid: string) =>
    http.post<{ bvid: string; actions: VideoDetail['actions']; stat: StatSnapshot }>(
      `/api/videos/${bvid}/triple`,
    ),

  suggest: (q: string, limit = 10) => http.get<SearchSuggestion[]>('/api/search/suggest', { q, limit }),
  searchSquare: () =>
    http.get<{ hotSearches: HotSearch[]; history: string[] }>('/api/search/square'),
  search: (params: { keyword: string; order?: SearchOrder; page?: number }) =>
    http.get<Paged<VideoCard> & { keyword: string }>('/api/search', params),
  clearSearchHistory: () => http.del<{ cleared: boolean }>('/api/search/history'),

  upVideos: (mid: number, limit = 6, exclude?: string) =>
    http.get<VideoCard[]>(`/api/up/${mid}/videos`, { limit, exclude }),
  watchLater: () => http.get<VideoCard[]>('/api/me/watchlater'),
  favorites: () => http.get<VideoCard[]>('/api/me/favorites'),
  history: () => http.get<HistoryItem[]>('/api/me/history'),
};
