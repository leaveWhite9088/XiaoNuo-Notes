<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useVideoStore } from '@/stores'
import VideoCard from '@/components/VideoCard.vue'

const videoStore = useVideoStore()
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  await videoStore.fetchPopularVideos()
  loading.value = false
})
</script>

<template>
  <div class="home-page">
    <div class="page-header">
      <h1>热门视频</h1>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
    </div>

    <div v-else-if="videoStore.popularVideos.length > 0" class="video-grid">
      <VideoCard
        v-for="video in videoStore.popularVideos"
        :key="video.bvid"
        :video="video"
      />
    </div>

    <div v-else class="empty">
      <div class="empty-icon">📺</div>
      <p>暂无热门视频</p>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--spacing-lg);
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--spacing-lg);
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
