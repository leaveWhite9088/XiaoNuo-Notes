const BASE = '/api'

async function get(url) {
  const res = await fetch(BASE + url)
  if (!res.ok) throw new Error(`请求失败: ${res.status}`)
  return res.json()
}

export const api = {
  categories: () => get('/categories'),
  videos: ({ category, q } = {}) => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (q) params.set('q', q)
    const qs = params.toString()
    return get('/videos' + (qs ? `?${qs}` : ''))
  },
  video: (id) => get(`/videos/${id}`),
  suggest: (q) => get(`/search/suggest?q=${encodeURIComponent(q)}`),
}
