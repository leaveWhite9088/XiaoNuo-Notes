// 前端 API 客户端：统一走 /api 前缀（由 Vite 代理到 5132 后端）
// 抛出的 Error 带 status（HTTP 状态码，网络层失败时为 undefined），供 UI 区分 404 与网络错误
const BASE = '/api';

async function request(path, params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  ).toString();
  const url = qs ? `${BASE}${path}?${qs}` : `${BASE}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  const json = await res.json();
  if (json.code !== 0) {
    const err = new Error(json.message || 'API error');
    err.code = json.code;
    throw err;
  }
  return json.data;
}

export const api = {
  getChannels: () => request('/channels'),
  getVideos: ({ channel, keyword, page, pageSize }) =>
    request('/videos', { channel, keyword, page, pageSize }),
  getVideo: (id) => request(`/videos/${encodeURIComponent(id)}`),
  suggest: (keyword) => request('/search/suggest', { keyword }),
  hotSearches: () => request('/hot-searches'),
};
