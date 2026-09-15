/** 统一请求封装：走 Vite 代理（3802 → 5802），与后端 API 一一对应 */
async function get(path, params = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v);
  }
  const url = qs.toString() ? `${path}?${qs}` : path;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `请求失败 ${res.status}`);
  }
  return res.json();
}

export const api = {
  health: () => get('/api/health'),
  categories: () => get('/api/categories'),
  feed: (category, page = 1, pagesize = 30) => get('/api/feed', { category, page, pagesize }),
  video: (id) => get(`/api/video/${id}`),
  suggest: (q = '') => get('/api/suggest', { q }),
  search: (q, page = 1) => get('/api/search', { q, page }),
  rank: () => get('/api/rank'),
};
