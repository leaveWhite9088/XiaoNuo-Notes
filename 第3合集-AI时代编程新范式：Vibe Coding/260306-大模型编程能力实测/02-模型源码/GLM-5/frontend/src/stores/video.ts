import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { VideoInfo, Danmaku } from '@/types'
import { videoAPI, danmakuAPI } from '@/api'

export const useVideoStore = defineStore('video', () => {
  // 当前视频
  const currentVideo = ref<VideoInfo | null>(null)
  const danmakuList = ref<Danmaku[]>([])
  const loading = ref(false)

  // 搜索
  const searchResults = ref<any[]>([])
  const searchKeyword = ref('')
  const searchTotal = ref(0)

  // 热门视频
  const popularVideos = ref<any[]>([])

  // 获取视频信息
  async function fetchVideoInfo(bvid?: string, aid?: number) {
    loading.value = true
    try {
      const res = await videoAPI.getInfo(bvid, aid) as any
      if (res.success && res.data) {
        currentVideo.value = res.data
        return res.data
      }
    } catch (e) {
      console.error('获取视频信息失败', e)
    } finally {
      loading.value = false
    }
    return null
  }

  // 获取弹幕
  async function fetchDanmaku(cid: number, bvid?: string, aid?: number) {
    try {
      const res = await danmakuAPI.getList(cid, bvid, aid) as any
      if (res.success && res.data) {
        danmakuList.value = res.data
        return res.data
      }
    } catch (e) {
      console.error('获取弹幕失败', e)
    }
    return []
  }

  // 发送弹幕
  async function sendDanmaku(data: { oid: number; message: string; time: number; color?: number }) {
    try {
      const res = await danmakuAPI.send(data) as any
      return res.success
    } catch (e) {
      console.error('发送弹幕失败', e)
      return false
    }
  }

  // 搜索视频
  async function searchVideos(keyword: string, page = 1) {
    loading.value = true
    searchKeyword.value = keyword
    try {
      const res = await videoAPI.search(keyword, page) as any
      if (res.success && res.data) {
        searchResults.value = res.data.videos
        searchTotal.value = res.data.total
        return res.data
      }
    } catch (e) {
      console.error('搜索失败', e)
    } finally {
      loading.value = false
    }
    return null
  }

  // 获取热门视频
  async function fetchPopularVideos(page = 1) {
    loading.value = true
    try {
      const res = await videoAPI.getPopular(page) as any
      if (res.success && res.data) {
        popularVideos.value = res.data
        return res.data
      }
    } catch (e) {
      console.error('获取热门视频失败', e)
    } finally {
      loading.value = false
    }
    return []
  }

  // 清空当前视频
  function clearCurrentVideo() {
    currentVideo.value = null
    danmakuList.value = []
  }

  return {
    currentVideo,
    danmakuList,
    loading,
    searchResults,
    searchKeyword,
    searchTotal,
    popularVideos,
    fetchVideoInfo,
    fetchDanmaku,
    sendDanmaku,
    searchVideos,
    fetchPopularVideos,
    clearCurrentVideo
  }
})
