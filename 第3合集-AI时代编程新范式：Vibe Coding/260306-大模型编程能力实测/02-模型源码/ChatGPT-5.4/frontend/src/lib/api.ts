import axios from 'axios'

import type { ApiEnvelope, AuthStatus, CommentItem, DanmakuItem, FavoriteGroup, VideoCard, VideoDetail } from '../types/api'

const client = axios.create({
  baseURL: '/api',
  timeout: 20000,
})

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>) {
  const response = await promise
  return response.data.data
}

export const api = {
  getHotVideos(page = 1) {
    return unwrap<{ items: VideoCard[] }>(client.get('/home/hot', { params: { page } }))
  },
  searchVideos(keyword: string, page = 1) {
    return unwrap<{ items: VideoCard[]; num_pages: number; num_results: number }>(
      client.get('/search', { params: { keyword, page } }),
    )
  },
  getVideoDetail(bvid: string) {
    return unwrap<VideoDetail>(client.get(`/video/${bvid}`))
  },
  getComments(bvid: string, page = 1) {
    return unwrap<{ items: CommentItem[]; total: number }>(client.get(`/video/${bvid}/comments`, { params: { page } }))
  },
  getDanmaku(bvid: string, pageIndex = 0) {
    return unwrap<{ items: DanmakuItem[]; total_loaded: number }>(
      client.get(`/video/${bvid}/danmaku`, { params: { page_index: pageIndex } }),
    )
  },
  getAuthStatus() {
    return unwrap<AuthStatus>(client.get('/auth/status'))
  },
  createLoginQrcode() {
    return unwrap<{ session_id: string; image_base64: string; status: string }>(client.post('/auth/login/qrcode'))
  },
  pollLoginQrcode(sessionId: string) {
    return unwrap<{ session_id: string; status: string; logged_in?: boolean }>(client.get(`/auth/login/qrcode/${sessionId}`))
  },
  logout() {
    return unwrap<AuthStatus>(client.post('/auth/logout'))
  },
  sendComment(bvid: string, message: string) {
    return unwrap(client.post(`/video/${bvid}/comment`, { message }))
  },
  sendDanmaku(bvid: string, message: string, progressSeconds: number, pageIndex: number) {
    return unwrap(
      client.post(`/video/${bvid}/danmaku`, {
        message,
        progress_seconds: progressSeconds,
        page_index: pageIndex,
      }),
    )
  },
  getMyFavorites(page = 1) {
    return unwrap<{ items: FavoriteGroup[] }>(client.get('/me/favorites', { params: { page } }))
  },
}
