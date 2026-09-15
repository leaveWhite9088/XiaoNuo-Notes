/**
 * API 客户端：所有请求都走 Vite 代理（/api -> http://127.0.0.1:4000）
 * 错误统一抛出 Error，组件层用 try/catch 处理
 */
const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${path} -> ${res.status} ${text}`);
  }
  return res.json();
}

export const api = {
  health: () => request('/health'),
  categories: () => request('/categories'),
  videos: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    ).toString();
    return request(`/videos${qs ? '?' + qs : ''}`);
  },
  video: (id) => request(`/videos/${encodeURIComponent(id)}`),
  search: (q) => request(`/search?q=${encodeURIComponent(q || '')}`),
  ranking: () => request('/ranking'),
  up: (id) => request(`/up/${encodeURIComponent(id)}`),
};
