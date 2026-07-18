<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  video: {
    bvid: string
    aid: number
    title: string
    cover: string
    duration: number
    play: number
    danmaku: number
    author?: string
    description?: string
  }
}

const props = defineProps<Props>()
const router = useRouter()

// 格式化时长
const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

// 格式化数字
const formatCount = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 点击跳转
const handleClick = () => {
  router.push({ name: 'Video', params: { bvid: props.video.bvid } })
}
</script>

<template>
  <div class="video-card" @click="handleClick">
    <div class="cover">
      <img :src="video.cover" :alt="video.title" loading="lazy" />
      <span class="duration">{{ formatDuration(video.duration) }}</span>
    </div>
    <div class="info">
      <h3 class="title" :title="video.title">{{ video.title }}</h3>
      <div class="meta">
        <span v-if="video.author" class="author">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          {{ video.author }}
        </span>
        <span class="play">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          {{ formatCount(video.play) }}
        </span>
        <span class="danmaku">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
          </svg>
          {{ formatCount(video.danmaku) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: var(--bg-tertiary);
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.video-card:hover .cover img {
  transform: scale(1.05);
}

.duration {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.info {
  padding: var(--spacing-sm);
}

.title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
}

.video-card:hover .title {
  color: var(--bili-pink);
}

.meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  font-size: 12px;
  color: var(--text-tertiary);
}

.meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.author {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
