import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

export const videoApi = {
  getInfo: (bvid: string) => api.get(`/videos/${bvid}`).then(res => res.data),
  getPlayUrl: (bvid: string, cid: number, quality?: number) =>
    api.get(`/videos/${bvid}/play/${cid}`, { params: { quality } }).then(res => res.data),
  getRelated: (bvid: string) => api.get(`/videos/${bvid}/related`).then(res => res.data),
  search: (keyword: string, page?: number) =>
    api.get(`/videos/search/${keyword}`, { params: { page } }).then(res => res.data),
  getPopular: (ps?: number) => api.get(`/videos/popular`, { params: { ps } }).then(res => res.data),
};

export const commentApi = {
  getComments: (bvid: string, page?: number, sort?: number) =>
    api.get(`/comments/video/${bvid}`, { params: { page, sort } }).then(res => res.data),
  sendComment: (bvid: string, content: string, replyId?: number) =>
    api.post(`/comments/video/${bvid}`, { content, replyId }).then(res => res.data),
  likeComment: (rpid: number, type: 'add' | 'cancel') =>
    api.post(`/comments/${rpid}/like`, { type }).then(res => res.data),
};

export const danmakuApi = {
  getDanmaku: (bvid: string, cid: number) =>
    api.get(`/danmaku/video/${bvid}`, { params: { cid } }).then(res => res.data),
  sendDanmaku: (bvid: string, cid: number, content: string, time: number, color?: number) =>
    api.post(`/danmaku/video/${bvid}`, { cid, content, time, color }).then(res => res.data),
};

export const userApi = {
  getInfo: () => api.get('/user/info').then(res => res.data),
  getUserInfo: (mid: number) => api.get(`/user/${mid}`).then(res => res.data),
  getFavorites: () => api.get('/user/favorites').then(res => res.data),
  getFavoriteVideos: (fid: number, page?: number) =>
    api.get(`/user/favorites/${fid}/videos`, { params: { page } }).then(res => res.data),
  checkFavorite: (aid: number) => api.get(`/user/favorites/check/${aid}`).then(res => res.data),
  toggleFavorite: (aid: number, fid: number) =>
    api.post('/user/favorites/toggle', { aid, fid }).then(res => res.data),
};

export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }).then(res => res.data),
  logout: () => api.post('/auth/logout').then(res => res.data),
  getStatus: () => api.get('/auth/status').then(res => res.data),
};

export default api;