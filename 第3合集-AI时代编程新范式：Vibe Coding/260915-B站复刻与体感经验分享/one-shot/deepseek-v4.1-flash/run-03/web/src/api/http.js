import axios from 'axios';

/**
 * HTTP 客户端：统一 baseURL、响应解包（{code,message,data} -> data）、错误提示。
 */
const http = axios.create({
  baseURL: '/api',
  timeout: 20000,
});

http.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 0) return body.data;
      return Promise.reject(new Error(body.message || '接口返回异常'));
    }
    return body;
  },
  (error) => {
    const message =
      error?.response?.data?.message || error?.message || '网络请求失败，请稍后重试';
    return Promise.reject(new Error(message));
  },
);

export default http;

/* ------------------------------ 各业务接口 ------------------------------ */

export const homeApi = {
  getHome: () => http.get('/home'),
  getFeed: (params) => http.get('/feed', { params }),
  getFilters: () => http.get('/filters'),
  getStats: () => http.get('/stats'),
};

export const catalogApi = {
  list: (scope = 'all') => http.get('/categories', { params: { scope } }),
  detail: (slug, params) => http.get(`/categories/${slug}`, { params }),
};

export const videoApi = {
  detail: (bvid) => http.get(`/videos/${bvid}`),
  related: (bvid, limit = 12) => http.get(`/videos/${bvid}/related`, { params: { limit } }),
  comments: (bvid, params) => http.get(`/videos/${bvid}/comments`, { params }),
  addComment: (bvid, payload) => http.post(`/videos/${bvid}/comments`, payload),
  addDanmaku: (bvid, payload) => http.post(`/videos/${bvid}/danmaku`, payload),
  recordHistory: (bvid, progress) => http.post(`/videos/${bvid}/history`, { progress }),
  history: (limit = 12) => http.get('/videos/history', { params: { limit } }),
  playInfo: (bvid, qn) => http.get(`/play/${bvid}/info`, { params: { qn } }),
};

export const searchApi = {
  suggest: (keyword, limit = 10) => http.get('/search/suggest', { params: { keyword, limit } }),
  search: (params) => http.get('/search', { params }),
  history: () => http.get('/search/history'),
  clearHistory: () => http.delete('/search/history'),
};

export const userApi = {
  me: () => http.get('/users/me'),
  top: (limit = 12) => http.get('/users/top', { params: { limit } }),
  toggleFavorite: (bvid) => http.post(`/users/favorites/${bvid}`),
};
