<template>
  <div class="video-grid" :class="{ 'is-compact': compact }">
    <template v-if="loading && !videos.length">
      <div v-for="n in skeletonCount" :key="`sk-${n}`" class="skeleton-card">
        <div class="skeleton skeleton-card__cover" />
        <div class="skeleton skeleton-card__line" />
        <div class="skeleton skeleton-card__line skeleton-card__line--short" />
      </div>
    </template>

    <VideoCard
      v-for="video in videos"
      :key="video.bvid"
      :video="video"
      :progress="progressMap[video.bvid] || 0"
    />
  </div>
</template>

<script setup>
import VideoCard from './VideoCard.vue';

/**
 * 视频网格：与 B站 首页一致，桌面端 288px 卡片 + 20px 间距；
 * 小于 1520 视口时自动降列。
 */
defineProps({
  videos: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  skeletonCount: { type: Number, default: 10 },
  progressMap: { type: Object, default: () => ({}) },
  compact: { type: Boolean, default: false },
});
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax($grid-card, 1fr));
  gap: 20px;
  align-content: start;

  &.is-compact {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

.skeleton-card {
  &__cover {
    width: 100%;
    aspect-ratio: 16 / 9;
  }

  &__line {
    height: 16px;
    margin-top: 10px;

    &--short {
      width: 60%;
      margin-top: 8px;
      height: 12px;
    }
  }
}
</style>
