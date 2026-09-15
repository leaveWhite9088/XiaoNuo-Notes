async function get(path) {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  return res.json();
}

export const api = {
  categories: () => get('/categories'),
  feed: ({ category = '推荐', q = '', page = 1, pageSize = 12 } = {}) =>
    get(`/feed?category=${encodeURIComponent(category)}&q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`),
  video: (bvid) => get(`/video/${bvid}`),
  suggest: (q) => get(`/search/suggest?q=${encodeURIComponent(q)}`)
};
