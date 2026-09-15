<script setup>
import { ref, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import BaseIcon from './BaseIcon.vue';
import { formatCount, formatDuration } from '../utils/format.js';
import { useUserStore } from '../stores/user.js';
import { toast } from '../composables/toast';

const props = defineProps({
  video: { type: Object, required: true },
});

const router = useRouter();
const user = useUserStore();

const previewOn = ref(false);
const videoEl = ref(null);
let hoverTimer = null;

function tryPreviewPlay(retries) {
  const v = videoEl.value;
  if (!v || !previewOn.value) return;
  v.load();
  v.play().catch(() => {
    // WebKit 省电策略可能打断起播，短暂延迟后重试
    if (retries > 0) setTimeout(() => tryPreviewPlay(retries - 1), 700);
  });
}

function onEnter() {
  clearTimeout(hoverTimer);
  // 悬停 500ms 后开始播放静音预览（B站同款交互的简化版）
  hoverTimer = setTimeout(() => {
    previewOn.value = true;
    requestAnimationFrame(() => tryPreviewPlay(2));
  }, 500);
}

function onLeave() {
  clearTimeout(hoverTimer);
  previewOn.value = false;
  if (videoEl.value) {
    videoEl.value.pause();
    videoEl.value.currentTime = 0;
  }
}

onBeforeUnmount(() => clearTimeout(hoverTimer));

function goDetail() {
  router.push(`/video/${props.video.id}`);
}

function toggleLater(e) {
  e.stopPropagation();
  const on = user.toggle('later', props.video.id);
  toast(on ? '已加入稍后再看' : '已从稍再看移除');
}
</script>

<template>
  <div class="video-card" @mouseenter="onEnter" @mouseleave="onLeave">
    <div class="cover-wrap" @click="goDetail">
      <img class="cover" :src="video.cover" :alt="video.title" loading="lazy" />
      <video
        v-show="previewOn"
        ref="videoEl"
        class="preview"
        :src="video.videoUrl"
        muted
        loop
        playsinline
        preload="none"
      />
      <span class="duration">{{ formatDuration(video.duration) }}</span>
      <button
        class="later-btn"
        :class="{ on: user.has('later', video.id) }"
        title="稍后再看"
        @click="toggleLater"
      >
        <BaseIcon name="clock" :size="13" />
      </button>
      <div class="cover-mask" :class="{ show: previewOn }">
        <span class="mask-text">预览中…</span>
      </div>
    </div>
    <div class="info">
      <h3 class="title line-clamp-2" :title="video.title" @click="goDetail">{{ video.title }}</h3>
      <div class="meta">
        <div class="up">
          <img class="up-face" :src="video.owner.face" alt="" loading="lazy" />
          <span class="up-name line-clamp-1">{{ video.owner.name }}</span>
        </div>
        <div class="counts">
          <span class="count-item"><BaseIcon name="playCount" :size="13" />{{ formatCount(video.stat.play) }}</span>
          <span class="count-item"><BaseIcon name="danmaku" :size="13" />{{ formatCount(video.stat.danmaku) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-card {
  cursor: pointer;
}
.cover-wrap {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  aspect-ratio: 16 / 10;
  background: #e7e9eb;
}
.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}
.video-card:hover .cover {
  transform: scale(1.06);
}
.preview {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}
.duration {
  position: absolute;
  right: 6px;
  bottom: 6px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
  border-radius: 3px;
  padding: 0 5px;
  line-height: 18px;
}
.later-btn {
  position: absolute;
  right: 6px;
  top: 6px;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  opacity: 0;
  transform: translateY(-4px);
  transition: all 0.2s;
}
.video-card:hover .later-btn {
  opacity: 1;
  transform: none;
}
.later-btn:hover,
.later-btn.on {
  background: var(--bili-pink);
}
.cover-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 28px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.55));
  display: flex;
  align-items: flex-end;
  padding: 0 8px 4px;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}
.cover-mask.show {
  opacity: 1;
}
.mask-text {
  color: #fff;
  font-size: 11px;
}

.info {
  padding: 8px 2px 0;
}
.title {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.45;
  height: 40px;
  color: var(--text-1);
}
.video-card:hover .title {
  color: var(--bili-pink);
}
.meta {
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.up {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.up-face {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  flex-shrink: 0;
}
.up-name {
  color: var(--text-3);
  font-size: 12px;
}
.counts {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}
.count-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: var(--text-3);
  font-size: 12px;
}
</style>
