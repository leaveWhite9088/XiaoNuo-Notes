<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { VideoCard } from '@/types';
import { PLACEHOLDER_COVER } from '@/utils';

/** 首页轮播右侧的 2×2 推广位（复用真实视频封面） */
defineProps<{ items: VideoCard[] }>();
const router = useRouter();
</script>

<template>
  <div class="promo">
    <button
      v-for="item in items.slice(0, 4)"
      :key="item.bvid"
      class="promo__card"
      @click="router.push({ name: 'video', params: { bvid: item.bvid } })"
    >
      <img
        class="promo__img"
        :src="item.cover || PLACEHOLDER_COVER"
        :alt="item.title"
        loading="lazy"
        @error="($event.target as HTMLImageElement).src = PLACEHOLDER_COVER"
      />
      <span class="promo__mask"></span>
      <span class="promo__badge">{{ item.tname }}</span>
      <span class="promo__title clamp-2">{{ item.title }}</span>
    </button>
  </div>
</template>

<style scoped>
.promo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 10px;
  height: 240px;
  flex: none;
  width: 420px;
}
.promo__card {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--bg-gray-deep);
  text-align: left;
}
.promo__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s;
}
.promo__card:hover .promo__img {
  transform: scale(1.07);
}
.promo__mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 40%, rgba(0, 0, 0, 0.7));
}
.promo__badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  background: rgba(251, 114, 153, 0.92);
  color: #fff;
  font-size: 11px;
}
.promo__title {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 8px;
  color: #fff;
  font-size: 12px;
  line-height: 1.35;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}
</style>
