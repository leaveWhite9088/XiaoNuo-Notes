<script setup>
import VideoCard from './VideoCard.vue';

defineProps({
  videos: { type: Array, default: () => [] },
});
</script>

<template>
  <div v-if="videos.length" class="video-grid">
    <VideoCard v-for="v in videos" :key="v.id" :video="v" />
  </div>
  <div v-else class="grid-empty">
    <slot name="empty">
      <p>暂无视频</p>
    </slot>
  </div>
</template>

<style scoped>
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(216px, 1fr));
  gap: 20px;
}
.grid-empty {
  padding: 60px 0;
  text-align: center;
  color: var(--text-3);
}
</style>
