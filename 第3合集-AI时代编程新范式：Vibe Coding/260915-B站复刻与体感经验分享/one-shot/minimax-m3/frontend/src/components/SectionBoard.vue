<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Section } from '@/api'
import VideoCard from './VideoCard.vue'

defineProps<{
  section: Section
}>()
</script>

<template>
  <section class="section-board">
    <div class="section-head">
      <div class="head-left">
        <h2 class="title">{{ section.title }}</h2>
        <span v-if="section.subtitle" class="subtitle">{{ section.subtitle }}</span>
      </div>
      <RouterLink v-if="section.tid !== undefined && section.tid > 0" :to="`/channel/${section.tid}`" class="more">
        查看更多
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M10 6L8.6 7.4 13.2 12l-4.6 4.6L10 18l6-6z" />
        </svg>
      </RouterLink>
      <RouterLink v-else to="/" class="more">
        查看更多
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M10 6L8.6 7.4 13.2 12l-4.6 4.6L10 18l6-6z" />
        </svg>
      </RouterLink>
    </div>
    <div class="video-grid">
      <VideoCard v-for="v in section.videos" :key="v.bvid" :video="v" />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.section-board {
  margin-bottom: 36px;
}
.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16px;
  .head-left {
    display: flex;
    align-items: baseline;
    gap: 12px;
  }
  .title {
    font-size: 20px;
    font-weight: 600;
    color: var(--text);
    margin: 0;
  }
  .subtitle {
    font-size: 13px;
    color: var(--text-3);
  }
  .more {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 13px;
    color: var(--text-2);
    &:hover {
      color: var(--brand);
    }
  }
}
.video-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px 12px;
}
@media (max-width: 1100px) {
  .video-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 880px) {
  .video-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 640px) {
  .video-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
