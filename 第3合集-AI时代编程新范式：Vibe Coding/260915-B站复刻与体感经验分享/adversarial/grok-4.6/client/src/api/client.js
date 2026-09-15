async function request(path) {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`请求失败 ${res.status}`)
  const json = await res.json()
  if (json.code !== 0) throw new Error(json.message || '接口错误')
  return json.data
}

export const api = {
  health: () => request('/api/health'),
  channels: () => request('/api/channels'),
  videos: (params = {}) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
    )
    return request(`/api/videos?${q.toString()}`)
  },
  carousel: () => request('/api/videos/carousel'),
  video: (id) => request(`/api/videos/${id}`),
  related: (id) => request(`/api/videos/${id}/related`),
  comments: (id) => request(`/api/videos/${id}/comments`),
  act: async (id, type) => {
    const res = await fetch(`/api/videos/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    })
    const json = await res.json()
    return json.data
  },
  suggest: (q) => request(`/api/search/suggest?q=${encodeURIComponent(q || '')}`),
  search: (q, sort) => {
    const params = new URLSearchParams({ q: q || '' })
    if (sort) params.set('sort', sort)
    return request(`/api/search?${params.toString()}`)
  }
}
