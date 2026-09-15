import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  timeout: 8000
})

export const fetchMeta = () => api.get('/meta').then((r) => r.data)
export const fetchCarousel = () => api.get('/carousel').then((r) => r.data)
export const fetchVideos = (params) => api.get('/videos', { params }).then((r) => r.data)
export const fetchVideo = (bvid) => api.get(`/videos/${bvid}`).then((r) => r.data)
export const fetchRelated = (bvid) => api.get(`/videos/${bvid}/related`).then((r) => r.data)
export const fetchComments = (bvid) => api.get(`/videos/${bvid}/comments`).then((r) => r.data)
export const postStat = (bvid, type) => api.post(`/videos/${bvid}/stat`, { type }).then((r) => r.data)
export const fetchHot = () => api.get('/search/hot').then((r) => r.data)
export const fetchSuggest = (q) => api.get('/search/suggest', { params: { q } }).then((r) => r.data)
