<template>
  <router-link :to="`/video/${video.id}`" class="video-card">
    <div class="cover-wrap">
      <img class="cover" :src="video.cover" :alt="video.title" loading="lazy" />
      <span class="duration">{{ video.duration }}</span>
      <!-- hover 浮层 -->
      <div class="cover-mask">
        <button class="watch-later" title="稍后再看" @click.prevent>
          <svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="9" fill="none" stroke="#fff" stroke-width="2"/><path d="M12 7 v5 l3.5 2" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
          稍后再看
        </button>
      </div>
    </div>
    <div class="card-info">
      <h3 class="title text-ellipsis-2" :title="video.title">{{ video.title }}</h3>
      <div class="meta">
        <span class="up-name">
          <svg viewBox="0 0 24 24" width="13" height="13"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 20 q8 -7 16 0" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
          {{ video.upName }}
        </span>
      </div>
      <div class="meta stats">
        <span>
          <svg viewBox="0 0 24 24" width="13" height="13"><path d="M4 5 h16 v11 h-16 z" fill="none" stroke="currentColor" stroke-width="1.8" rx="2"/><path d="M10 8.5 l5 3 -5 3 z" fill="currentColor"/></svg>
          {{ video.playCount }}万
        </span>
        <span>
          <svg viewBox="0 0 24 24" width="13" height="13"><path d="M4 5 h16 v10 h-11 l-4 3 v-3 h-1 z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
          {{ video.danmakuCount }}万
        </span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
defineProps({
  video: { type: Object, required: true },
});
</script>

<style scoped>
.video-card {
  display: block;
  border-radius: var(--radius-card);
  overflow: hidden;
  background: var(--card-white);
  transition: box-shadow 0.2s, transform 0.2s;
}

.video-card:hover {
  box-shadow: var(--shadow-card);
}

.cover-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: #e8e8e8;
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.video-card:hover .cover {
  transform: scale(1.08);
}

.duration {
  position: absolute;
  right: 8px;
  bottom: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 4px;
  z-index: 2;
}

.cover-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  opacity: 0;
  transition: opacity 0.25s;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 8px;
}

.video-card:hover .cover-mask {
  opacity: 1;
}

.watch-later {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 14px;
  transition: background 0.2s;
}

.watch-later:hover {
  background: var(--bili-pink);
}

.card-info {
  padding: 10px 10px 12px;
}

.title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.45;
  color: var(--text-main);
  min-height: 40px;
  transition: color 0.2s;
}

.video-card:hover .title {
  color: var(--bili-pink);
}

.meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-light);
}

.meta span {
  display: flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.up-name:hover {
  color: var(--bili-pink);
}
</style>
