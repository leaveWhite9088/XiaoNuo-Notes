<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { userAPI } from '@/api'
import type { FavoriteFolder } from '@/types'

const router = useRouter()
const userStore = useUserStore()

const folders = ref<FavoriteFolder[]>([])
const currentFolder = ref<FavoriteFolder | null>(null)
const videos = ref<any[]>([])
const loading = ref(false)
const videoLoading = ref(false)

// 格式化
const formatCount = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// 加载收藏夹列表
const loadFolders = async () => {
  if (!userStore.isLoggedIn) return
  loading.value = true
  try {
    const res = await userAPI.getFavorites() as any
    if (res.success && res.data) {
      folders.value = res.data
      if (folders.value.length > 0) {
        await selectFolder(folders.value[0])
      }
    }
  } catch (e) {
    console.error('加载收藏夹失败', e)
  } finally {
    loading.value = false
  }
}

// 选择收藏夹
const selectFolder = async (folder: FavoriteFolder) => {
  currentFolder.value = folder
  videoLoading.value = true
  try {
    const res = await userAPI.getFavoriteVideos(folder.id) as any
    if (res.success && res.data) {
      videos.value = res.data.videos
    }
  } catch (e) {
    console.error('加载收藏视频失败', e)
  } finally {
    videoLoading.value = false
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
  loadFolders()
})
</script>

<template>
  <div class="favorites-page">
    <h1>我的收藏</h1>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
    </div>

    <template v-else>
      <!-- 收藏夹列表 -->
      <div class="folder-tabs">
        <button
          v-for="folder in folders"
          :key="folder.id"
          :class="['folder-tab', { active: currentFolder?.id === folder.id }]"
          @click="selectFolder(folder)"
        >
          {{ folder.title }}
          <span class="count">({{ folder.media_count }})</span>
        </button>
      </div>

      <!-- 视频列表 -->
      <div v-if="videoLoading" class="loading">
        <div class="loading-spinner"></div>
      </div>

      <div v-else-if="videos.length > 0" class="video-grid">
        <div
          v-for="video in videos"
          :key="video.bvid"
          class="video-card"
          @click="goToVideo(video)"
        >
          <div class="cover">
            <img :src="video.cover" :alt="video.title" />
            <span class="duration">{{ formatDuration(video.duration) }}</span>
          </div>
          <div class="info">
            <h3 class="title">{{ video.title }}</h3>
            <div class="meta">
              <span>{{ video.author }}</span>
              <span>{{ formatCount(video.play) }} 播放</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty">
        <div class="empty-icon">📁</div>
        <p>这个收藏夹是空的</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.favorites-page {
  max-width: 1200px;
  margin: 0 auto;
}

.favorites-page h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: var(--spacing-lg);
}

.folder-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.folder-tab {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--bg-secondary);
  border: none;
  border-radius: var(--border-radius);
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.folder-tab:hover {
  background-color: var(--bg-hover);
}

.folder-tab.active {
  background-color: var(--bili-pink);
  color: white;
}

.folder-tab .count {
  font-size: 12px;
  opacity: 0.8;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--spacing-lg);
}

.video-card {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.video-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.video-card .cover {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: var(--bg-tertiary);
}

.video-card .cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-card .duration {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.video-card .info {
  padding: var(--spacing-sm);
}

.video-card .title {
  font-size: 14px;
  font-weight: 500;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
}

.video-card:hover .title {
  color: var(--bili-pink);
}

.video-card .meta {
  display: flex;
  gap: var(--spacing-sm);
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
