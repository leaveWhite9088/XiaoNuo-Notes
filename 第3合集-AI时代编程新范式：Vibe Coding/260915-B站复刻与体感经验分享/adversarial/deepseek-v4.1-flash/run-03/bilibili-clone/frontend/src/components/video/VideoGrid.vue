<script setup lang="ts">
import VideoCard from '@/components/video/VideoCard.vue';
import VideoCardSkeleton from '@/components/video/VideoCardSkeleton.vue';
import type { VideoCard as VideoCardType } from '@/types';

/** 视频流网格：自动填充列 + 骨架屏 + 加载状态 */
withDefaults(
  defineProps<{
    videos: VideoCardType[];
    loading?: boolean;
    skeletonCount?: number;
    variant?: 'default' | 'mini';
    emptyText?: string;
  }>(),
  { loading: false, skeletonCount: 12, variant: 'default', emptyText: '这里还什么都没有哦~' },
);
</script>

<template>
  <div class="grid-wrap">
    <div class="video-grid" :class="`video-grid--${variant}`">
      <VideoCard v-for="v in videos" :key="v.bvid" :video="v" :variant="variant" />
      <VideoCardSkeleton v-for="i in loading ? skeletonCount : 0" :key="`s-${i}`" />
    </div>

    <div v-if="!loading && !videos.length" class="empty">
      <p class="empty__title">{{ emptyText }}</p>
      <p class="empty__tip">换个分区或关键词试试吧</p>
    </div>
  </div>
</template>

<style scoped>
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 8px;
  padding-bottom: 20px;
}
.video-grid--mini {
  grid-template-columns: 1fr;
  gap: 2px;
}
.empty {
  padding: 90px 0;
  text-align: center;
  color: var(--text-3);
}
.empty__title {
  font-size: 15px;
  color: var(--text-2);
}
.empty__tip {
  margin-top: 6px;
  font-size: 13px;
}

@media (max-width: 1100px) {
  .video-grid {
    grid-template-columns: 1fr;
  }
}
</style>
