<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { formatDuration, formatViews, formatPubdate, type Video } from '@/api'

const props = withDefaults(
  defineProps<{
    video: Video
    size?: 'default' | 'large' | 'small'
    showUp?: boolean
  }>(),
  { size: 'default', showUp: true },
)

const cover = computed(() => props.video.cover)
const duration = computed(() => formatDuration(props.video.duration))
const views = computed(() => formatViews(props.video.views))
const pubdate = computed(() => formatPubdate(props.video.pubdate))
</script>

<template>
  <RouterLink :to="`/video/${video.bvid}`" class="video-card" :class="['size-' + size]">
    <div class="cover-wrap">
      <img :src="cover" :alt="video.title" loading="lazy" />
      <div class="cover-mask">
        <span class="duration">{{ duration }}</span>
        <span class="play-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
      <div class="cover-info">
        <span class="ci-item">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
            <path d="M12 5C7 5 2.7 8.1 1 12c1.7 3.9 6 7 11 7s9.3-3.1 11-7c-1.7-3.9-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
          </svg>
          {{ views }}
        </span>
        <span class="ci-item">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
          </svg>
          {{ formatViews(video.danmaku) }}
        </span>
      </div>
    </div>
    <div class="info">
      <div class="title ellipsis-2" :title="video.title">{{ video.title }}</div>
      <div v-if="showUp" class="meta">
        <img class="up-avatar" :src="video.up.avatar" :alt="video.up.name" />
        <span class="up-name ellipsis-1">{{ video.up.name }}</span>
        <span v-if="video.up.isVerified" class="verified" title="认证 UP">✓</span>
      </div>
      <div class="meta meta-bottom">
        <span class="tag" v-for="t in video.tags.slice(0, 2)" :key="t">{{ t }}</span>
        <span class="time">· {{ pubdate }}</span>
      </div>
    </div>
  </RouterLink>
</template>

<style lang="scss" scoped>
.video-card {
  display: block;
  color: var(--text);
  border-radius: var(--radius);
  transition: transform 0.2s;
  &:hover {
    color: var(--text);
    transform: translateY(-2px);
    .cover-mask {
      opacity: 1;
    }
    .title {
      color: var(--brand);
    }
  }
}
.cover-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--bg-2);
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  .cover-mask {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, transparent 30%, transparent 60%, rgba(0, 0, 0, 0.5) 100%);
    opacity: 0;
    transition: opacity 0.2s;
    color: #fff;
    .duration {
      position: absolute;
      right: 8px;
      bottom: 8px;
      font-size: 12px;
      background: rgba(0, 0, 0, 0.6);
      padding: 2px 6px;
      border-radius: 3px;
    }
    .play-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.9;
    }
  }
  &:hover img {
    transform: scale(1.04);
  }
  .cover-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 6px 8px;
    display: flex;
    gap: 12px;
    color: #fff;
    font-size: 12px;
    pointer-events: none;
    .ci-item {
      display: flex;
      align-items: center;
      gap: 4px;
      opacity: 0.9;
    }
  }
}
.info {
  padding: 8px 4px 0;
  .title {
    font-size: 14px;
    line-height: 1.4;
    color: var(--text);
    font-weight: 500;
    transition: color 0.15s;
    min-height: 2.8em;
  }
  .meta {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    font-size: 12px;
    color: var(--text-3);
    .up-avatar {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .up-name {
      max-width: 110px;
    }
    .verified {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      background: var(--brand);
      color: #fff;
      border-radius: 50%;
      font-size: 10px;
    }
  }
  .meta-bottom {
    .tag {
      padding: 1px 6px;
      background: var(--bg-2);
      border-radius: 2px;
      color: var(--brand);
      font-size: 11px;
    }
    .time {
      color: var(--text-3);
    }
  }
}
.size-large {
  .cover-wrap {
    aspect-ratio: 16 / 9;
  }
  .title {
    font-size: 16px;
  }
}
.size-small {
  .cover-wrap {
    aspect-ratio: 16 / 9;
  }
  .title {
    font-size: 13px;
  }
}
</style>
