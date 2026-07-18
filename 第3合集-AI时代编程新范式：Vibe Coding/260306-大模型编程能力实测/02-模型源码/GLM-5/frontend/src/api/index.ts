import axios from 'axios'
import type { APIResponse } from '@/types'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default api

// 认证API
export const authAPI = {
  getQRCode: () => api.get<any, APIResponse>('/auth/qrcode'),
  checkQRCode: (oauthKey: string) => api.get<any, APIResponse>(`/auth/qrcode/check?oauth_key=${oauthKey}`),
  loginByCookie: (data: { sessdata: string; bili_jct: string; buvid3?: string }) =>
    api.post<any, APIResponse>('/auth/login/cookie', data),
  logout: () => api.post<any, APIResponse>('/auth/logout'),
  getMyInfo: () => api.get<any, APIResponse>('/auth/me'),
  getStatus: () => api.get<any, APIResponse>('/auth/status')
}

// 视频API
export const videoAPI = {
  getInfo: (bvid?: string, aid?: number) => {
    const params = new URLSearchParams()
    if (bvid) params.append('bvid', bvid)
    if (aid) params.append('aid', String(aid))
    return api.get<any, APIResponse>(`/video/info?${params}`)
  },
  getPages: (bvid?: string, aid?: number) => {
    const params = new URLSearchParams()
    if (bvid) params.append('bvid', bvid)
    if (aid) params.append('aid', String(aid))
    return api.get<any, APIResponse>(`/video/pages?${params}`)
  },
  getPlayUrl: (params: { bvid?: string; aid?: number; cid?: number; quality?: number }) => {
    const searchParams = new URLSearchParams()
    if (params.bvid) searchParams.append('bvid', params.bvid)
    if (params.aid) searchParams.append('aid', String(params.aid))
    if (params.cid) searchParams.append('cid', String(params.cid))
    if (params.quality) searchParams.append('quality', String(params.quality))
    return api.get<any, APIResponse>(`/video/playurl?${searchParams}`)
  },
  getRelated: (bvid?: string, aid?: number) => {
    const params = new URLSearchParams()
    if (bvid) params.append('bvid', bvid)
    if (aid) params.append('aid', String(aid))
    return api.get<any, APIResponse>(`/video/related?${params}`)
  },
  search: (keyword: string, page = 1, pageSize = 20) =>
    api.get<any, APIResponse>(`/video/search?keyword=${encodeURIComponent(keyword)}&page=${page}&page_size=${pageSize}`),
  getPopular: (page = 1, pageSize = 20) =>
    api.get<any, APIResponse>(`/video/popular?page=${page}&page_size=${pageSize}`)
}

// 评论API
export const commentAPI = {
  getList: (oid: number, page = 1, pageSize = 20) =>
    api.get<any, APIResponse>(`/comment/list?oid=${oid}&page=${page}&page_size=${pageSize}`),
  send: (data: { oid: number; message: string; root?: number; parent?: number }) =>
    api.post<any, APIResponse>('/comment/send', data),
  like: (oid: number, rpid: number, status = true) =>
    api.post<any, APIResponse>(`/comment/like?oid=${oid}&rpid=${rpid}&status=${status}`)
}

// 弹幕API
export const danmakuAPI = {
  getList: (cid: number, bvid?: string, aid?: number) => {
    const params = new URLSearchParams()
    params.append('cid', String(cid))
    if (bvid) params.append('bvid', bvid)
    if (aid) params.append('aid', String(aid))
    return api.get<any, APIResponse>(`/danmaku/list?${params}`)
  },
  send: (data: { oid: number; message: string; time: number; color?: number; fontsize?: number; mode?: number }) =>
    api.post<any, APIResponse>('/danmaku/send', data)
}

// 用户API
export const userAPI = {
  getFavorites: () => api.get<any, APIResponse>('/user/favorites'),
  getFavoriteVideos: (folderId: number, page = 1, pageSize = 20) =>
    api.get<any, APIResponse>(`/user/favorites/videos?folder_id=${folderId}&page=${page}&page_size=${pageSize}`),
  favoriteVideo: (aid: number, folderIds?: number[]) =>
    api.post<any, APIResponse>('/user/favorite', { aid, folder_ids: folderIds }),
  unfavoriteVideo: (aid: number, folderId: number) =>
    api.post<any, APIResponse>(`/user/unfavorite?aid=${aid}&folder_id=${folderId}`),
  getHistory: (page = 1, pageSize = 20) =>
    api.get<any, APIResponse>(`/user/history?page=${page}&page_size=${pageSize}`),
  getFollowings: (page = 1, pageSize = 20) =>
    api.get<any, APIResponse>(`/user/followings?page=${page}&page_size=${pageSize}`)
}
