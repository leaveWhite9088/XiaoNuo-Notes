<template>
  <article class="card">
    <router-link :to="'/video/' + video.bvid" class="cover" @click="user.pushHistory(video)">
      <img :src="video.cover" :alt="video.title" />
      <div class="shade"></div>
      <span v-if="video.live" class="live">直播中</span>
      <span class="dur">{{ formatDuration(video.duration) }}</span>
      <button
        class="later"
        type="button"
        :title="user.isWatchLater(video.bvid) ? '取消稍后再看' : '稍后再看'"
        @click.prevent.stop="user.toggleWatchLater(video)"
      >
        {{ user.isWatchLater(video.bvid) ? '✓' : '+' }}
      </button>
      <div class="stats">
        <span>▶ {{ formatCount(video.views) }}</span>
        <span>💬 {{ formatCount(video.danmaku) }}</span>
      </div>
    </router-link>
    <router-link :to="'/video/' + video.bvid" class="title" :title="video.title">{{ video.title }}</router-link>
    <div class="meta">
      <span class="up">{{ video.owner?.name }}</span>
      <span>· {{ formatCount(video.views) }}观看</span>
      <span>· {{ formatDate(video.pubdate) }}</span>
    </div>
  </article>
</template>

<script setup>
import { formatCount, formatDate, formatDuration } from '../../utils/format'
import { useUserStore } from '../../stores/user'
defineProps({ video: { type: Object, required: true } })
const user = useUserStore()
</script>

<style scoped>
.card { min-width: 0; }
.cover {
  position: relative;
  display: block;
  aspect-ratio: 16 / 10;
  border-radius: var(--radius);
  overflow: hidden;
  background: #e3e5e7;
}
.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .35s ease;
}
.cover:hover img { transform: scale(1.06); }
.shade {
  position: absolute;
  inset: auto 0 0;
  height: 48%;
  background: linear-gradient(transparent, rgba(0,0,0,.65));
  opacity: .85;
}
.dur, .live {
  position: absolute;
  right: 8px;
  bottom: 6px;
  color: #fff;
  font-size: 13px;
  text-shadow: 0 1px 2px rgba(0,0,0,.6);
}
.live {
  left: 8px; right: auto;
  background: #fb7299;
  padding: 1px 6px;
  border-radius: 4px;
  text-shadow: none;
  font-size: 12px;
}
.later, .stats { opacity: 0; transition: opacity .2s; }
.cover:hover .later, .cover:hover .stats { opacity: 1; }
.cover:hover .dur { opacity: 0; }
.later {
  position: absolute;
  top: 8px; right: 8px;
  width: 28px; height: 28px;
  border: 0;
  border-radius: 6px;
  background: rgba(0,0,0,.55);
  color: #fff;
  font-size: 18px;
  line-height: 1;
}
.later:hover { background: var(--pink); }
.stats {
  position: absolute;
  left: 8px; right: 8px; bottom: 6px;
  display: flex;
  justify-content: space-between;
  color: #fff;
  font-size: 13px;
}
.title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 8px 0 4px;
  height: 44px;
  font-size: 15px;
  line-height: 22px;
  font-weight: 500;
}
.title:hover { color: var(--pink); }
.meta {
  display: flex;
  gap: 4px;
  font-size: 13px;
  color: var(--text-3);
  white-space: nowrap;
  overflow: hidden;
}
.up:hover { color: var(--pink); }
</style>
