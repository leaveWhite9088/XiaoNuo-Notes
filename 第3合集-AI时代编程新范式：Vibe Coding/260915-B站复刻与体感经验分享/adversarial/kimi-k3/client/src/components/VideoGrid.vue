<template>
  <div class="video-grid">
    <VideoCard v-for="v in videos" :key="v.id" :video="v" />
  </div>
</template>

<script setup>
import VideoCard from './VideoCard.vue';

defineProps({
  videos: { type: Array, default: () => [] },
});
</script>

<style scoped>
.video-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 18px 16px;
}

@media (max-width: 1400px) {
  .video-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1100px) {
  .video-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 760px) {
  .video-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
