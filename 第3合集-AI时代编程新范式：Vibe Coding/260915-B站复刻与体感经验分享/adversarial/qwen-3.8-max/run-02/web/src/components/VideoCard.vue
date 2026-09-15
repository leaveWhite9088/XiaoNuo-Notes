<script setup>
import { formatCount } from '../utils.js';

const props = defineProps({
  video: { type: Object, required: true },
  horizontal: { type: Boolean, default: false }, // 详情页侧栏的横向小卡
});

defineEmits(['click', 'later']);
</script>

<template>
  <article
    class="card"
    :class="{ horizontal }"
    @click="$emit('click', video)"
    role="link"
    :title="video.title"
  >
    <div class="cover-wrap">
      <img class="cover" :src="video.cover" :alt="video.title" loading="lazy" />
      <span class="duration">{{ video.duration }}</span>
      <!-- hover 遮罩 -->
      <div class="hover-mask">
        <span class="mask-stat">
          <svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5c-1.7-4.4-6-7.5-11-7.5zm0 12.2a4.7 4.7 0 1 1 0-9.4 4.7 4.7 0 0 1 0 9.4zm0-2.3a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8z" fill="currentColor"/></svg>
          {{ formatCount(video.stat.view) }}
        </span>
        <span class="mask-action" title="稍后再看（V0 暂未开放）" @click.stop="$emit('later', video)">
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V3zm1 4h2v5.6l4 2.3-1 1.7-5-2.9V7z" fill="currentColor"/></svg>
        </span>
      </div>
    </div>

    <div class="info">
      <h3 class="title">{{ video.title }}</h3>
      <div class="meta">
        <img v-if="!horizontal" class="face" :src="video.owner.face" :alt="video.owner.name" loading="lazy" />
        <span class="up">{{ video.owner.name }}</span>
        <span class="stats">
          <svg viewBox="0 0 24 24" width="13" height="13"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
          {{ formatCount(video.stat.view) }}
          <span v-if="!horizontal" class="dot">·</span>
          <template v-if="!horizontal">
            <svg viewBox="0 0 24 24" width="13" height="13"><path d="M4 4h16v12H5.2L4 17.2V4zm2 2v6.8l.8-.8H18V6H6z" fill="currentColor"/></svg>
            {{ formatCount(video.stat.danmaku) }}
          </template>
        </span>
      </div>
      <span v-if="!horizontal" class="tag">{{ video.category }}</span>
    </div>
  </article>
</template>

<style scoped>
.card {
  background: var(--card-bg);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
}

.cover-wrap {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #e3e5e7;
}
.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.card:hover .cover {
  transform: scale(1.06);
}

.duration {
  position: absolute;
  right: 8px;
  bottom: 8px;
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 4px;
  z-index: 2;
}

/* hover 遮罩：预览信息 */
.hover-mask {
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 8px 6px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.55));
  color: #fff;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 1;
}
.card:hover .hover-mask {
  opacity: 1;
}
.mask-stat {
  display: flex;
  align-items: center;
  gap: 4px;
}
.mask-action {
  display: flex;
  padding: 3px;
  border-radius: 4px;
}
.mask-action:hover {
  background: rgba(255, 255, 255, 0.25);
}

.info {
  padding: 10px 12px 12px;
}
.title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.45;
  color: var(--text-main);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.9em;
  transition: color 0.15s;
}
.card:hover .title {
  color: var(--bili-pink);
}

.meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  color: var(--text-light);
  font-size: 12px;
  min-width: 0;
}
.face {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.up {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 45%;
}
.meta .up:hover {
  color: var(--bili-pink);
}
.stats {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-left: auto;
  flex-shrink: 0;
}
.dot {
  margin: 0 2px;
}
.tag {
  display: inline-block;
  margin-top: 8px;
  font-size: 11px;
  color: var(--bili-blue);
  background: #e8f6fd;
  border-radius: 4px;
  padding: 2px 7px;
}

/* 横向小卡（详情页侧栏） */
.card.horizontal {
  display: flex;
  gap: 10px;
  background: transparent;
  border-radius: 8px;
  padding: 6px;
}
.card.horizontal:hover {
  transform: none;
  box-shadow: none;
  background: #f6f7f8;
}
.card.horizontal .cover-wrap {
  width: 148px;
  flex-shrink: 0;
  border-radius: 8px;
}
.card.horizontal .info {
  padding: 2px 4px 2px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}
.card.horizontal .title {
  font-size: 13px;
  min-height: 0;
}
</style>
