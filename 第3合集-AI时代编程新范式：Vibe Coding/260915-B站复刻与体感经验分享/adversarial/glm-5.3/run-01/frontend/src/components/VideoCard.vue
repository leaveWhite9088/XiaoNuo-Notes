<script setup>
/** 首页视频卡片：hover 抬升 + 延时静音预览播放 + 右上角稍后再看/不感兴趣 + 播放弹幕数浮层 */
import { nextTick, onBeforeUnmount, onDeactivated, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import BIcon from './BIcon.vue';
import { useUserStore } from '../stores/user';
import { useToastStore } from '../stores/toast';
import { formatCount, formatDuration } from '../utils/format';

const props = defineProps({
  video: { type: Object, required: true },
});
const emit = defineEmits(['dislike']);

const router = useRouter();
const user = useUserStore();
const toast = useToastStore();

const hovering = ref(false);
const previewing = ref(false);
const previewEl = ref(null);
let hoverTimer = null;

function onEnter() {
  hovering.value = true;
  clearTimeout(hoverTimer);
  // B 站同款：悬停约 0.5s 后开始静音预览
  hoverTimer = setTimeout(() => {
    previewing.value = true;
  }, 500);
}
function onLeave() {
  hovering.value = false;
  clearTimeout(hoverTimer);
  previewing.value = false;
}
// preload="none" 下 loadeddata 不会自发触发，需主动 play() 驱动加载
watch(previewing, async (on) => {
  if (!on) return;
  await nextTick();
  previewEl.value?.play().catch(() => {});
});
function openVideo() {
  router.push({ name: 'video', params: { id: props.video.bvid } });
}
function toggleWatchLater() {
  const added = user.toggleWatchLater(props.video);
  toast.show(added ? '已加入稍后再看' : '已从稍后再看移除', added ? 'success' : 'info');
}
function dislike() {
  emit('dislike', props.video.bvid);
  toast.show('将减少此类内容推荐');
}
onBeforeUnmount(() => clearTimeout(hoverTimer));
// keep-alive 离开首页时组件不卸载，必须显式停掉预览，否则声音画面在后台继续
onDeactivated(() => {
  clearTimeout(hoverTimer);
  hovering.value = false;
  previewing.value = false;
});
</script>

<template>
  <article class="video-card" :class="{ hovering }" @mouseenter="onEnter" @mouseleave="onLeave">
    <div class="cover" @click="openVideo">
      <img class="cover-img" :src="video.cover" :alt="video.title" loading="lazy" />
      <video
        v-if="previewing"
        ref="previewEl"
        class="preview"
        :src="video.playUrl"
        muted
        loop
        playsinline
        preload="metadata"
      />
      <Transition name="fade">
        <div v-if="hovering && !previewing" class="cover-meta">
          <span><BIcon name="play" :size="12" />{{ formatCount(video.stat.view) }}</span>
          <span><BIcon name="danmaku" :size="12" />{{ formatCount(video.stat.danmaku) }}</span>
          <span class="more"><BIcon name="dots" :size="12" /></span>
        </div>
      </Transition>
      <span class="duration">{{ formatDuration(video.duration) }}</span>
      <Transition name="fade">
        <div v-if="hovering" class="cover-actions" @click.stop>
          <button
            class="action-btn"
            :class="{ active: user.hasWatchLater(video.bvid) }"
            title="稍后再看"
            @click.stop="toggleWatchLater"
          >
            <BIcon name="clock" :size="15" />
          </button>
          <button class="action-btn" title="不感兴趣" @click.stop="dislike">
            <BIcon name="close" :size="15" />
          </button>
        </div>
      </Transition>
    </div>
    <a class="title clamp-2" href="javascript:;" @click="openVideo" :title="video.title">{{ video.title }}</a>
    <div class="meta">
      <a class="up clamp-1" href="javascript:;" @click.prevent="router.push({ name: 'search', query: { q: video.owner.name } })" :title="video.owner.name">
        {{ video.owner.name }}
      </a>
      <span class="dot">·</span>
      <span>{{ formatCount(video.stat.view) }}播放</span>
      <span class="dot">·</span>
      <span>{{ formatCount(video.stat.danmaku) }}弹幕</span>
    </div>
  </article>
</template>

<style scoped>
.video-card { cursor: pointer; transition: transform 0.2s ease; }
.video-card.hovering { transform: translateY(-3px); }

.cover {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius);
  overflow: hidden;
  background: #e7e9eb;
  transition: box-shadow 0.2s ease;
}
.video-card.hovering .cover { box-shadow: var(--shadow-card); }
.cover-img { width: 100%; height: 100%; object-fit: cover; }
.preview { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; background: #000; }

.duration {
  position: absolute;
  right: 6px;
  bottom: 6px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 12px;
  line-height: 1;
  padding: 3px 5px;
  border-radius: 3px;
  z-index: 2;
}

.cover-meta {
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 8px 6px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  color: #fff;
  font-size: 12px;
  z-index: 2;
}
.cover-meta span { display: flex; align-items: center; gap: 3px; }
.cover-meta .more { margin-left: auto; }

.cover-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
  z-index: 3;
}
.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.92);
  color: var(--text-1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}
.action-btn:hover { background: #fff; color: var(--bili-pink); }
.action-btn.active { color: var(--bili-pink); }

.title {
  display: block;
  margin-top: 8px;
  font-size: 14.5px;
  line-height: 20px;
  min-height: 40px;
  color: var(--text-1);
  transition: color 0.15s;
}
.title:hover { color: var(--bili-pink); }

.meta {
  margin-top: 4px;
  font-size: 13px;
  color: var(--text-3);
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}
.up { color: var(--text-2); white-space: nowrap; }
.up:hover { color: var(--bili-blue); }
.dot { flex-shrink: 0; }
</style>
