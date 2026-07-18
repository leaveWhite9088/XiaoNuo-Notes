<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useVideoStore } from '@/stores'
import VideoCard from '@/components/VideoCard.vue'

const route = useRoute()
const videoStore = useVideoStore()

const loading = ref(false)
const keyword = ref('')
const currentPage = ref(1)

const search = async () => {
  if (!keyword.value.trim()) return
  loading.value = true
  await videoStore.searchVideos(keyword.value, currentPage.value)
  loading.value = false
}

// 监听路由参数变化
watch(() => route.query.keyword, (newKeyword) => {
  if (newKeyword) {
    keyword.value = newKeyword as string
    search()
  }
}, { immediate: true })

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  search()
}

// 加载更多
const loadMore = () => {
  currentPage.value++
  search()
}
</script>

<template>
  <div class="search-page">
    <div class="search-header">
      <h1>搜索视频</h1>
      <div class="search-box">
        <input
          v-model="keyword"
          type="text"
          placeholder="输入关键词搜索..."
          @keyup.enter="handleSearch"
        />
        <button class="btn btn-primary" @click="handleSearch">搜索</button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
    </div>

    <template v-else>
      <div v-if="keyword && videoStore.searchResults.length > 0" class="results-info">
        找到 {{ videoStore.searchTotal }} 个与 "<span class="keyword">{{ keyword }}</span>" 相关的视频
      </div>

      <div v-if="videoStore.searchResults.length > 0" class="video-grid">
        <VideoCard
          v-for="video in videoStore.searchResults"
          :key="video.bvid"
          :video="video"
        />
      </div>

      <div v-else-if="keyword" class="empty">
        <div class="empty-icon">🔍</div>
        <p>未找到相关视频</p>
      </div>

      <div v-else class="empty">
        <div class="empty-icon">🎬</div>
        <p>输入关键词开始搜索</p>
      </div>

      <!-- 加载更多 -->
      <div v-if="videoStore.searchResults.length > 0 && videoStore.searchResults.length < videoStore.searchTotal" class="load-more">
        <button class="btn btn-secondary" @click="loadMore">加载更多</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.search-page {
  max-width: 1200px;
  margin: 0 auto;
}

.search-header {
  margin-bottom: var(--spacing-lg);
}

.search-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.search-box {
  display: flex;
  gap: var(--spacing-sm);
  max-width: 500px;
}

.search-box input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 14px;
}

.results-info {
  margin-bottom: var(--spacing-md);
  font-size: 14px;
  color: var(--text-secondary);
}

.results-info .keyword {
  color: var(--bili-pink);
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

.load-more {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-lg);
}
</style>
