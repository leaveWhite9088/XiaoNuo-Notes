const API_BASE_URL = 'http://localhost:3001/api';

import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

export const videoApi = {
  getDetail: (bvid) => api.get(`/videos/detail/${bvid}`),
  getRecommend: () => api.get('/videos/recommend'),
  getPopular: () => api.get('/videos/popular'),
  getRegion: (rid) => api.get(`/videos/region/${rid}`)
};

export const userApi = {
  getQRCode: () => api.get('/user/login/qrcode'),
  getLoginStatus: (oauthKey) => api.get(`/user/login/status/${oauthKey}`),
  getInfo: () => api.get('/user/info'),
  check: () => api.get('/user/check'),
  logout: () => api.post('/user/logout')
};

export const commentApi = {
  get: (bvid, page = 1, size = 20) => api.get(`/comments/${bvid}`, { params: { page, size } }),
  send: (bvid, message, replyId) => api.post('/comments/send', { bvid, message, replyId }),
  reply: (bvid, rootId, message) => api.post('/comments/reply', { bvid, rootId, message }),
  like: (bvid, rpid, action) => api.post('/comments/like', { bvid, rpid, action })
};

export const danmakuApi = {
  get: (bvid) => api.get(`/danmaku/${bvid}`),
  send: (bvid, content, progress, mode, color, fontsize) => 
    api.post('/danmaku/send', { bvid, content, progress, mode, color, fontsize }),
  getConfig: (bvid) => api.get(`/danmaku/config/${bvid}`)
};

export const favoriteApi = {
  get: () => api.get('/favorites'),
  getDetail: (mediaId) => api.get(`/favorites/detail/${mediaId}`),
  add: (avid, addIds, cancelIds) => api.post('/favorites/add', { avid, addMediaIds: addIds, cancelMediaIds: cancelIds }),
  getFolders: () => api.get('/favorites/folders')
};

export const searchApi = {
  search: (keyword, page = 1, size = 20) => api.get('/search', { params: { keyword, page, pagesize: size } }),
  getSuggestion: (term) => api.get('/search/suggestion', { params: { term } })
};

export default api;
