/** 业务接口定义，页面只依赖这一层，不直接拼 URL。 */
import { get, post } from './client';
import type {
  Banner,
  Comment,
  CommentPage,
  DanmakuItem,
  FeedResponse,
  HotSearchItem,
  NavConfig,
  SearchResponse,
  SuggestItem,
  VideoDetail,
} from '../types';

export const fetchNavConfig = () => get<NavConfig>('/config');

export const fetchBanners = () => get<Banner[]>('/banners');

export const fetchFeed = (params: {
  channel?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
  refresh?: number;
}) => get<FeedResponse>('/feed', params);

export const fetchVideo = (bvid: string) => get<VideoDetail>(`/videos/${bvid}`);

export const fetchComments = (bvid: string, page = 1) =>
  get<CommentPage>(`/videos/${bvid}/comments`, { page });

export const fetchDanmaku = (bvid: string) => get<DanmakuItem[]>(`/videos/${bvid}/danmaku`);

export const sendDanmaku = (bvid: string, payload: { text: string; p: number; color?: string }) =>
  post<DanmakuItem>(`/videos/${bvid}/danmaku`, payload);

export const interactVideo = (
  bvid: string,
  action: 'like' | 'coin' | 'favorite' | 'share',
  delta = 1,
) => post<{ action: string; value: number }>(`/videos/${bvid}/interact`, { action, delta });

export const fetchSuggest = (keyword: string) => get<SuggestItem[]>('/search/suggest', { keyword });

export const fetchHotSearches = () => get<HotSearchItem[]>('/search/hot');

export const fetchSearch = (params: { keyword: string; page?: number; order?: string }) =>
  get<SearchResponse>('/search', params);

export type { Comment };
