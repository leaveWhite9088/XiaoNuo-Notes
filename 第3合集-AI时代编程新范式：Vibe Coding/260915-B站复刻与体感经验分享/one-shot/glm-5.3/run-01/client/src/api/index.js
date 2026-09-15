const BASE = '/api';

async function http(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json().catch(() => ({ code: res.status, message: `HTTP ${res.status}` }));
  if (!res.ok || json.code !== 0) throw new Error(json.message || `请求失败(HTTP ${res.status})`);
  return json.data;
}

const qs = (params = {}) => {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') s.set(k, v);
  });
  const str = s.toString();
  return str ? `?${str}` : '';
};

export const api = {
  health: () => http('/health'),
  categories: () => http('/categories'),
  feed: ({ region = 'home', page = 1, pageSize = 20 } = {}) => http(`/feed${qs({ region, page, page_size: pageSize })}`),
  video: (id) => http(`/video/${encodeURIComponent(id)}`),
  related: (id, limit = 10) => http(`/video/${encodeURIComponent(id)}/related${qs({ limit })}`),
  comments: (id) => http(`/comments/${encodeURIComponent(id)}`),
  postComment: (id, content) =>
    http(`/comments/${encodeURIComponent(id)}`, { method: 'POST', body: JSON.stringify({ content }) }),
  suggest: (q) => http(`/search/suggest${qs({ q })}`),
  hotSearch: () => http('/search/hot'),
  search: (q, page = 1, pageSize = 20) => http(`/search${qs({ q, page, page_size: pageSize })}`),
  banners: () => http('/banners'),
};
