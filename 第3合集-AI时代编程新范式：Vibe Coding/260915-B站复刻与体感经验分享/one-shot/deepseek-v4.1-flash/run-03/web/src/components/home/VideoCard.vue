<template>
  <article class="video-card" :class="{ 'is-hover': hover }" @mouseenter="hover = true" @mouseleave="hover = false">
    <RouterLink class="video-card__cover" :to="target">
      <LazyImage :src="cover" :alt="video.title" />

      <!-- hover 时封面轻微放大 + 遮罩 -->
      <span class="video-card__mask" />

      <span class="video-card__duration">{{ video.durationText }}</span>

      <span v-if="video.playable === false" class="video-card__copyright">版权</span>

      <span class="video-card__stats">
        <span class="stat"><SvgIcon name="play" :size="14" filled />{{ video.stats.viewCount }}</span>
        <span class="stat"><SvgIcon name="danmaku" :size="14" />{{ video.stats.danmakuText }}</span>
      </span>

      <button class="video-card__later" title="稍后再看" @click.prevent.stop="noop">
        <SvgIcon name="clock" :size="15" />
      </button>

      <!-- 播放进度条（来自观看历史） -->
      <span v-if="progress > 0" class="video-card__progress">
        <i :style="{ width: `${progress}%` }" />
      </span>
    </RouterLink>

    <div class="video-card__info">
      <RouterLink class="video-card__title text-clamp-2" :to="target">
        {{ video.title }}
      </RouterLink>

      <div class="video-card__bottom">
        <RouterLink
          v-if="video.owner?.mid"
          class="video-card__up"
          :to="{ name: 'search', query: { keyword: video.owner.name } }"
        >
          <SvgIcon name="upload" :size="12" />
          <span>{{ video.owner.name }}</span>
        </RouterLink>
        <span v-else class="video-card__up">{{ video.owner?.name }}</span>

        <span class="video-card__date">{{ video.pubdateText }}</span>
      </div>

      <transition name="fade">
        <div v-if="hover" class="video-card__tags">
          <span v-for="tag in (video.tags || []).slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </transition>
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue';
import LazyImage from '@/components/common/LazyImage.vue';
import SvgIcon from '@/components/common/SvgIcon.vue';

/**
 * 视频卡片：288 宽、封面 16:9、悬停显示播放/弹幕数据与分区标签。
 */
const props = defineProps({
  video: { type: Object, required: true },
  progress: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
});

const hover = ref(false);

const cover = computed(() => {
  const raw = props.video.cover || '';
  // 统一按首页卡片规格裁剪，减少传输体积
  return raw.includes('@') ? raw : `${raw}@672w_378h_1c`;
});

const target = computed(() => ({ name: 'video', params: { bvid: props.video.bvid } }));

function noop() {}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.video-card {
  width: 100%;
  min-height: 237px;

  &__cover {
    position: relative;
    display: block;
    border-radius: $radius-md;
    overflow: hidden;
    background: $bg-body;

    :deep(.lazy-image) {
      transition: transform $transition-base;
    }
  }

  &.is-hover &__cover :deep(.lazy-image) {
    transform: scale(1.04);
  }

  &__mask {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 45%, rgba(0, 0, 0, 0.55) 100%);
    opacity: 0;
    transition: opacity $transition-base;
  }

  &.is-hover &__mask {
    opacity: 1;
  }

  &__duration {
    position: absolute;
    right: 6px;
    bottom: 6px;
    padding: 1px 5px;
    font-size: 12px;
    color: #fff;
    background: rgba(0, 0, 0, 0.45);
    border-radius: $radius-sm;
    letter-spacing: 0.3px;
  }

  &__copyright {
    position: absolute;
    top: 6px;
    left: 6px;
    padding: 1px 6px;
    font-size: 11px;
    color: #fff;
    background: rgba(24, 25, 28, 0.68);
    border-radius: $radius-sm;
  }

  &__stats {    position: absolute;
    left: 8px;
    bottom: 7px;
    display: flex;
    gap: 10px;
    color: #fff;
    font-size: 12px;
    opacity: 0;
    transform: translateY(4px);
    transition: all $transition-base;

    .stat {
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }
  }

  &.is-hover &__stats {
    opacity: 1;
    transform: translateY(0);
  }

  &__later {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 50%;
    opacity: 0;
    transform: translateY(-4px);
    transition: all $transition-base;

    &:hover {
      background: $brand-pink;
    }
  }

  &.is-hover &__later {
    opacity: 1;
    transform: translateY(0);
  }

  &__progress {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 3px;
    background: rgba(255, 255, 255, 0.35);

    i {
      display: block;
      height: 100%;
      background: $brand-pink;
    }
  }

  &__info {
    padding-top: 10px;
  }

  &__title {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 15px;
    line-height: 22px;
    color: $text-1;
    transition: color $transition-fast;

    &:hover {
      color: $brand-blue;
    }
  }

  &__bottom {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    font-size: 13px;
    color: $text-3;
  }

  &__up {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    max-width: 150px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    transition: color $transition-fast;

    &:hover {
      color: $brand-blue;
    }
  }

  &__date {
    flex: none;

    &::before {
      content: '·';
      margin-right: 5px;
    }
  }

  &__tags {
    display: flex;
    gap: 6px;
    margin-top: 8px;
    overflow: hidden;
  }
}

.tag {
  flex: none;
  padding: 1px 6px;
  font-size: 11px;
  color: $text-2;
  background: $bg-card;
  border-radius: $radius-sm;
}
</style>
