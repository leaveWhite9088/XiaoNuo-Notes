<template>
  <article class="video-card" @click="goVideo">
    <div class="cover-wrap">
      <img :src="video.cover" :alt="video.title" class="cover" loading="lazy" @error="onImgError" />
      <span class="duration">{{ video.durationLabel }}</span>
      <div class="cover-mask" aria-hidden="true"></div>
    </div>
    <h3 class="title ellipsis-2" :title="video.title">{{ video.title }}</h3>
    <div class="meta">
      <span class="meta-item">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        {{ video.playCountLabel }}
      </span>
      <span class="meta-item">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M2 4h20v12H6l-4 4z"/></svg>
        {{ video.danmakuCountLabel }}
      </span>
    </div>
    <div v-if="video.up" class="up" @click.stop="goUp">
      <img :src="video.up.avatar" :alt="video.up.name" class="up-avatar" loading="lazy" />
      <span class="up-name">{{ video.up.name }}</span>
    </div>
  </article>
</template>

<script setup>
import { useRouter } from 'vue-router';
const props = defineProps({ video: { type: Object, required: true } });
const router = useRouter();
function goVideo() {
  router.push({ name: 'video', params: { id: props.video.id } });
}
function goUp() {
  // 没有 UP 主页页，跳到首页 + 搜索关键词
  router.push({ name: 'home', query: { q: props.video.up.name } });
}
function onImgError(e) {
  e.target.style.background = 'linear-gradient(135deg, #fb7299, #00a1d6)';
  e.target.style.objectFit = 'cover';
  e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%23fb7299"/><stop offset="1" stop-color="%2300a1d6"/></linearGradient></defs><rect width="640" height="360" fill="url(%23g)"/><text x="320" y="180" text-anchor="middle" font-size="22" fill="white" font-family="sans-serif">哔哩哔哩</text></svg>';
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.video-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  background: transparent;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-4px);
    .cover { transform: scale(1.04); }
    .title { color: $bili-pink; }
  }
}
.cover-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: $radius-card;
  overflow: hidden;
  background: linear-gradient(135deg, #f0f2f5, #e3e5e7);
}
.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}
.duration {
  position: absolute;
  bottom: 6px;
  right: 6px;
  height: 18px;
  line-height: 18px;
  padding: 0 6px;
  font-size: 11px;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 3px;
}
.cover-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.05));
  opacity: 0;
  transition: opacity 0.2s;
  .video-card:hover & { opacity: 1; }
}
.title {
  margin: 8px 0 4px;
  font-size: 14px;
  line-height: 1.4;
  color: $bili-text;
  font-weight: 400;
  transition: color 0.2s;
  min-height: 2.8em;
}
.meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: $bili-text-3;
  margin-bottom: 4px;
}
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  svg { opacity: 0.7; }
}
.up {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
  font-size: 12px;
  color: $bili-text-3;
  &:hover .up-name { color: $bili-pink; }
}
.up-avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: cover;
  background: $bili-tag-bg;
}
.up-name { transition: color 0.2s; }
</style>
