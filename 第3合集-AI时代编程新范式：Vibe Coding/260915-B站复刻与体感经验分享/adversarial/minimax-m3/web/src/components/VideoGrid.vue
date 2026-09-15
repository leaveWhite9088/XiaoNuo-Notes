<template>
  <div class="video-grid">
    <VideoCard v-for="v in items" :key="v.id" :video="v" />
  </div>
  <div v-if="loading" class="loading-row">
    <span class="dot"></span><span class="dot"></span><span class="dot"></span> 加载中…
  </div>
  <div v-if="!hasMore && items.length" class="end-row">— 已经到底了 —</div>
  <div v-if="!items.length && !loading" class="empty-row">这里什么都没有，换个分类试试～</div>
</template>

<script setup>
import VideoCard from './VideoCard.vue';
defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  hasMore: { type: Boolean, default: true },
});
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.video-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px 16px;
  margin: 16px 0;
  @media (max-width: 1280px) { grid-template-columns: repeat(4, 1fr); }
  @media (max-width: 1024px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 720px) { grid-template-columns: repeat(2, 1fr); gap: 16px 8px; }
}
.loading-row, .end-row, .empty-row {
  text-align: center;
  padding: 24px 0;
  color: $bili-text-3;
  font-size: 13px;
}
.dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: $bili-pink;
  border-radius: 50%;
  margin: 0 2px;
  animation: pulse 1.2s infinite ease-in-out;
  &:nth-child(2) { animation-delay: 0.15s; }
  &:nth-child(3) { animation-delay: 0.3s; }
}
@keyframes pulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
</style>
