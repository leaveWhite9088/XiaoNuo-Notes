<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { userAPI } from '@/api'

const router = useRouter()
const userStore = useUserStore()

const videos = ref<any[]>([])
const loading = ref(false)

// 格式化
const formatCount = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

// 加载历史
const loadHistory = async () => {
  if (!userStore.isLoggedIn) return
  loading.value = true
  try {
    const res = await userAPI.getHistory() as any
    if (res.success && res.data) {
      videos.value = res.data.videos
    }
  } catch (e) {
    console.error('加载历史失败', e)
  } finally {
    loading.value = false
  }
}

// 跳转视频
const goToVideo = (video: any) => {
  router.push({ name: 'Video', params: { bvid: video.bvid } })
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push({ name: 'Login' })
    return
  }
  loadHistory()
})
</script>

<template>
  <div class="history-page">
    <h1>历史记录</h1>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
    </div>

    <div v-else-if="videos.length > 0" class="video-list">
      <div
        v-for="video in videos"
        :key="video.bvid"
        class="video-item"
        @click="goToVideo(video)"
      >
        <div class="cover">
          <img :src="video.cover" :alt="video.title" />
        </div>
        <div class="info">
          <h3 class="title">{{ video.title }}</h3>
          <div class="meta">
            <span class="author">{{ video.author }}</span>
            <span class="duration">{{ video.duration }}</span>
          </div>
          <span class="view-time">{{ formatTime(video.view_at) }}</span>
        </div>
      </div>
    </div>

    <div v-else class="empty">
      <div class="empty-icon">🕐</div>
      <p>暂无观看历史</p>
    </div>
  </div>
</template>

<style scoped>
.history-page {
  max-width: 900px;
  margin: 0 auto;
}

.history-page h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: var(--spacing-lg);
}

.video-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.video-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.video-item:hover {
  background-color: var(--bg-hover);
}

.video-item .cover {
  width: 180px;
  flex-shrink: 0;
  aspect-ratio: 16 / 9;
  border-radius: var(--border-radius);
  overflow: hidden;
  background-color: var(--bg-tertiary);
}

.video-item .cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-item .info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.video-item .title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: auto;
}

.video-item:hover .title {
  color: var(--bili-pink);
}

.video-item .meta {
  display: flex;
  gap: var(--spacing-md);
  font-size: 13px;
  color: var(--text-tertiary);
}

.video-item .view-time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.loading {
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--text-tertiary);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-md);
}
</style>
