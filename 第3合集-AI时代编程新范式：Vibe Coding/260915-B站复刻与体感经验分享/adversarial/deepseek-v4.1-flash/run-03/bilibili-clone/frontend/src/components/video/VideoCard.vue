<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import Icon from '@/components/common/Icon.vue';
import type { VideoCard as VideoCardType } from '@/types';
import { avatarColor, nameInitial, PLACEHOLDER_COVER } from '@/utils';

/**
 * 视频卡片：默认横向（封面 + 信息），mini 用于侧栏推荐。
 * hover 时封面放大、标题变粉、出现「稍后再看」与弹幕数。
 */
const props = withDefaults(
  defineProps<{
    video: VideoCardType;
    variant?: 'default' | 'mini' | 'rank';
    progress?: number;
    rank?: number;
  }>(),
  { variant: 'default' },
);

const router = useRouter();
const hovered = ref(false);
const watchLater = ref(false);

const cover = computed(() => props.video.cover || PLACEHOLDER_COVER);

function open() {
  void router.push({ name: 'video', params: { bvid: props.video.bvid } });
}

function onWatchLater(e: MouseEvent) {
  e.stopPropagation();
  watchLater.value = !watchLater.value;
}

function onOwner(e: MouseEvent) {
  e.stopPropagation();
  void router.push({ name: 'search', query: { keyword: props.video.owner.name } });
}

function onCategory(e: MouseEvent) {
  e.stopPropagation();
  void router.push({ name: 'category', params: { slug: props.video.categorySlug } });
}
</script>

<template>
  <article
    class="card"
    :class="[`card--${variant}`]"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @click="open"
  >
    <span v-if="rank" class="card__rank" :class="`card__rank--${rank <= 3 ? rank : 'n'}`">{{ rank }}</span>

    <div class="card__cover">
      <img
        :src="cover"
        :alt="video.title"
        loading="lazy"
        @error="($event.target as HTMLImageElement).src = PLACEHOLDER_COVER"
      />
      <span class="card__duration">{{ video.durationText }}</span>

      <!-- hover 才出现的弹幕数 / 稍后再看 -->
      <span class="card__danmaku" :class="{ 'is-show': hovered }">
        <Icon name="i-danmaku" :size="12" />{{ video.danmakuText }}
      </span>
      <button class="card__later" :class="{ 'is-show': hovered }" @click="onWatchLater">
        <Icon :name="watchLater ? 'i-favorite' : 'i-clock'" :size="13" />
        {{ watchLater ? '已添加' : '稍后再看' }}
      </button>
      <span class="card__play-mask" :class="{ 'is-show': hovered }">
        <Icon name="i-play" :size="30" />
      </span>

      <span v-if="progress" class="card__progress">
        <i :style="{ width: `${Math.round(progress * 100)}%` }"></i>
      </span>
    </div>

    <div class="card__info">
      <h3 class="card__title" :class="{ 'is-hover': hovered }">{{ video.title }}</h3>

      <div v-if="variant !== 'mini'" class="card__meta">
        <button class="card__owner" @click="onOwner">
          <img
            v-if="video.owner.avatar"
            :src="video.owner.avatar"
            class="card__avatar"
            alt=""
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />
          <span
            v-else
            class="card__avatar card__avatar--text"
            :style="{ background: avatarColor(video.owner.name) }"
            >{{ nameInitial(video.owner.name) }}</span
          >
          <span class="card__owner-name ellipsis">{{ video.owner.name }}</span>
        </button>

        <span class="card__stat" title="播放量">
          <Icon name="i-play" :size="13" />{{ video.playText }}
        </span>
        <span class="card__stat" title="弹幕数">
          <Icon name="i-danmaku" :size="13" />{{ video.danmakuText }}
        </span>
        <button class="card__cat" @click="onCategory">{{ video.tname }}</button>
      </div>

      <div v-else class="card__meta card__meta--mini">
        <span class="card__stat"><Icon name="i-play" :size="12" />{{ video.playText }}</span>
        <span class="card__owner-name ellipsis">{{ video.owner.name }}</span>
      </div>

      <div v-if="variant === 'default'" class="card__footer">
        <span class="card__time">{{ video.timeAgo }}</span>
        <span class="card__like" :class="{ 'is-hover': hovered }">
          <Icon name="i-like" :size="13" />{{ video.likeText }}
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 8px;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
}
.card:hover {
  background: var(--bg-gray);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.card__rank {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 3;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
}
.card__rank--1 {
  background: #fe2d46;
}
.card__rank--2 {
  background: #ff6600;
}
.card__rank--3 {
  background: #faa90e;
}

/* 封面 */
.card__cover {
  position: relative;
  width: 200px;
  aspect-ratio: 16 / 10;
  flex: none;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--bg-gray-deep);
}
.card__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.card:hover .card__cover img {
  transform: scale(1.08);
}
.card__duration {
  position: absolute;
  right: 6px;
  bottom: 6px;
  padding: 1px 5px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.62);
  color: #fff;
  font-size: 12px;
}
.card__danmaku {
  position: absolute;
  left: 6px;
  bottom: 6px;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 1px 5px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.62);
  color: #fff;
  font-size: 12px;
  opacity: 0;
  transform: translateY(4px);
  transition: all 0.22s;
}
.card__danmaku.is-show {
  opacity: 1;
  transform: translateY(0);
}
.card__later {
  position: absolute;
  right: 6px;
  top: 6px;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px 7px;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
  opacity: 0;
  transform: translateY(-4px);
  transition: all 0.22s;
}
.card__later:hover {
  background: var(--bili-pink);
}
.card__later.is-show {
  opacity: 1;
  transform: translateY(0);
}
.card__play-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.92);
  background: rgba(0, 0, 0, 0.12);
  opacity: 0;
  transition: opacity 0.25s;
  pointer-events: none;
}
.card__play-mask.is-show {
  opacity: 1;
}

/* 信息 */
.card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding-top: 2px;
}
.card__title {
  font-size: 15px;
  line-height: 1.42;
  font-weight: 500;
  color: var(--text-1);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s;
  word-break: break-word;
}
.card__title.is-hover {
  color: var(--bili-pink);
}
.card__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding-top: 8px;
  font-size: 12px;
  color: var(--text-3);
  min-width: 0;
}
.card__owner {
  display: flex;
  align-items: center;
  gap: 5px;
  max-width: 110px;
  color: var(--text-3);
  transition: color 0.18s;
}
.card__owner:hover {
  color: var(--bili-pink);
}
.card__avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: cover;
  flex: none;
}
.card__avatar--text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 11px;
}
.card__owner-name {
  max-width: 100px;
}
.card__stat {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex: none;
}
.card__cat {
  margin-left: auto;
  padding: 1px 6px;
  border-radius: 3px;
  background: var(--bg-gray-deep);
  color: var(--text-3);
  font-size: 11px;
  flex: none;
  transition: all 0.16s;
}
.card:hover .card__cat {
  background: #fff;
}
.card__cat:hover {
  background: var(--bili-pink) !important;
  color: #fff;
}
.card__footer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-3);
}
.card__like {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  opacity: 0;
  transition: all 0.22s;
}
.card__like.is-hover {
  opacity: 1;
}
.card__progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.4);
}
.card__progress i {
  display: block;
  height: 100%;
  background: var(--bili-pink);
}

/* mini：侧栏推荐 */
.card--mini {
  padding: 6px;
  gap: 10px;
}
.card--mini .card__cover {
  width: 140px;
}
.card--mini .card__title {
  font-size: 13px;
  -webkit-line-clamp: 2;
}
.card__meta--mini {
  gap: 8px;
  padding-top: 6px;
  font-size: 11px;
}

/* rank 变体：占位更紧凑 */
.card--rank .card__cover {
  width: 168px;
}
</style>
