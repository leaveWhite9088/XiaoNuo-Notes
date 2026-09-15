// API 封装：统一走 /api 前缀，由 Vite 代理到 http://localhost:5131
const BASE = '/api';

async function get(path, params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  const res = await fetch(`${BASE}${path}${qs ? `?${qs}` : ''}`);
  const json = await res.json();
  if (json.code !== 0) throw new Error(json.message || '请求失败');
  return json.data;
}

async function post(path) {
  const res = await fetch(`${BASE}${path}`, { method: 'POST' });
  const json = await res.json();
  if (json.code !== 0) throw new Error(json.message || '请求失败');
  return json.data;
}

export const api = {
  categories: () => get('/categories'),
  videos: (params) => get('/videos', params),
  video: (id) => get(`/videos/${id}`),
  related: (id, limit = 8) => get(`/videos/${id}/related`, { limit }),
  suggestions: (keyword) => get('/search/suggestions', { keyword }),
  like: (id) => post(`/videos/${id}/like`)
};
