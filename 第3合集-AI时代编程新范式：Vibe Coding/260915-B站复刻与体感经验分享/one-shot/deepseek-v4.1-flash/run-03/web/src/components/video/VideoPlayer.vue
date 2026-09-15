<template>
  <div
    ref="shellRef"
    class="player"
    :class="{ 'is-fullscreen': fullscreen, 'is-playing': playing }"
    @mousemove="showControls = true"
    @mouseleave="onLeave"
  >
    <video
      ref="videoRef"
      class="player__video"
      :src="src"
      :poster="poster"
      preload="metadata"
      playsinline
      @play="onPlay"
      @pause="onPause"
      @timeupdate="onTimeUpdate"
      @durationchange="onDurationChange"
      @waiting="buffering = true"
      @playing="buffering = false"
      @canplay="buffering = false"
      @error="onError"
      @click="togglePlay"
    />

    <!-- 弹幕层 -->
    <div v-show="danmakuOn" class="player__danmaku">
      <span
        v-for="item in liveDanmaku"
        :key="item.key"
        class="danmaku-item"
        :style="{ top: `${item.top}%`, color: item.color, animationDuration: `${item.duration}s` }"
      >
        {{ item.content }}
      </span>
    </div>

    <!-- 中央播放按钮 -->
    <button v-if="!playing" class="player__bigplay" @click="togglePlay">
      <SvgIcon name="play" :size="34" filled />
    </button>

    <div v-if="buffering && playing" class="player__loading">
      <span class="dot" /><span class="dot" /><span class="dot" />
    </div>

    <div v-if="errorMessage" class="player__error">
      <p>{{ errorMessage }}</p>
      <button class="btn-ghost" @click="retry">重新加载</button>
    </div>

    <!-- 控制栏 -->
    <div v-show="showControls || !playing" class="player__controls">
      <button class="ctrl" :title="playing ? '暂停' : '播放'" @click="togglePlay">
        <SvgIcon :name="playing ? 'pause' : 'play'" :size="20" :filled="!playing" />
      </button>

      <button class="ctrl" :title="muted ? '取消静音' : '静音'" @click="toggleMute">
        <SvgIcon :name="muted ? 'mute' : 'volume'" :size="20" />
      </button>

      <span class="player__time">{{ currentText }} / {{ durationText }}</span>

      <div
        class="player__progress"
        @click="seekByEvent"
        @mousedown="startDrag"
      >
        <div class="player__progress-bg">
          <div class="player__progress-loaded" :style="{ width: `${loadedPercent}%` }" />
          <div class="player__progress-played" :style="{ width: `${playedPercent}%` }">
            <i class="player__progress-dot" />
          </div>
        </div>
      </div>

      <button class="ctrl" :title="danmakuOn ? '关闭弹幕' : '开启弹幕'" @click="$emit('toggle-danmaku')">
        <SvgIcon name="danmaku" :size="20" :class="{ 'is-off': !danmakuOn }" />
      </button>

      <div class="player__quality">
        <button class="ctrl ctrl--text" @click="qualityOpen = !qualityOpen">
          {{ qualityLabel }}
          <SvgIcon name="arrowUp" :size="12" />
        </button>
        <transition name="pop">
          <ul v-show="qualityOpen" class="quality-menu">
            <li
              v-for="q in qualities"
              :key="q.qn"
              class="quality-menu__item"
              :class="{ 'is-active': q.qn === currentQuality }"
              @click="pickQuality(q.qn)"
            >
              {{ q.label }}
            </li>
          </ul>
        </transition>
      </div>

      <button class="ctrl" title="全屏" @click="toggleFullscreen">
        <SvgIcon name="fullscreen" :size="18" />
      </button>
    </div>

    <!-- 弹幕输入 -->
    <div v-show="showControls" class="player__danmaku-input">
      <input
        v-model="danmakuText"
        type="text"
        placeholder="发个弹幕见证当下"
        maxlength="60"
        @keydown.enter="sendDanmaku"
      />
      <button class="danmaku-send" @click="sendDanmaku">发送</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import SvgIcon from '@/components/common/SvgIcon.vue';

/**
 * 播放器：真实 <video> + 后端流代理。
 * 弹幕为 B站 真实弹幕（按播放时间滚动出现），支持手动发弹幕。
 */
const props = defineProps({
  src: { type: String, default: '' },
  poster: { type: String, default: '' },
  danmakuList: { type: Array, default: () => [] },
  danmakuOn: { type: Boolean, default: true },
  qualities: { type: Array, default: () => [] },
  currentQuality: { type: Number, default: 64 },
  qualityLabel: { type: String, default: '720P' },
});

const emit = defineEmits(['progress', 'ended', 'toggle-danmaku', 'change-quality', 'send-danmaku']);

const shellRef = ref(null);
const videoRef = ref(null);
const playing = ref(false);
const muted = ref(false);
const buffering = ref(false);
const fullscreen = ref(false);
const showControls = ref(true);
const currentTime = ref(0);
const duration = ref(0);
const loaded = ref(0);
const errorMessage = ref('');
const qualityOpen = ref(false);
const danmakuText = ref('');
const liveDanmaku = ref([]);
let hideTimer = null;
let danmakuTimer = null;

const playedPercent = computed(() => (duration.value ? (currentTime.value / duration.value) * 100 : 0));
const loadedPercent = computed(() => (duration.value ? (loaded.value / duration.value) * 100 : 0));
const currentText = computed(() => fmt(currentTime.value));
const durationText = computed(() => fmt(duration.value));

function fmt(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

function togglePlay() {
  const el = videoRef.value;
  if (!el) return;
  if (!el.paused) {
    el.pause();
    return;
  }
  const attempt = el.play();
  if (attempt?.catch) {
    attempt.catch(() => {
      // 首帧还没就绪时 play() 会被中断，等 canplay 再自动重试一次
      const retry = () => {
        el.play().catch(() => {});
      };
      el.addEventListener('canplay', retry, { once: true });
    });
  }
}

function toggleMute() {
  const el = videoRef.value;
  if (!el) return;
  el.muted = !el.muted;
  muted.value = el.muted;
}

function onPlay() {
  playing.value = true;
  startDanmakuLoop();
}

function onPause() {
  playing.value = false;
}

function onTimeUpdate() {
  const el = videoRef.value;
  if (!el) return;
  currentTime.value = el.currentTime;
  emit('progress', el.currentTime);
  if (el.buffered.length) loaded.value = el.buffered.end(el.buffered.length - 1);
}

function onDurationChange() {
  duration.value = videoRef.value?.duration || 0;
}

function onError() {
  errorMessage.value = '视频加载失败，可能是网络或上游限制导致。';
  buffering.value = false;
}

function retry() {
  errorMessage.value = '';
  videoRef.value?.load();
}

function onLeave() {
  if (playing.value) showControls.value = false;
}

function seekByEvent(event) {
  const bar = event.currentTarget.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (event.clientX - bar.left) / bar.width));
  if (videoRef.value && duration.value) {
    videoRef.value.currentTime = ratio * duration.value;
  }
}

function startDrag() {
  const onMove = (e) => {
    const bar = shellRef.value?.querySelector('.player__progress');
    if (!bar || !duration.value) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    videoRef.value.currentTime = ratio * duration.value;
  };
  const onUp = () => {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  };
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}

function toggleFullscreen() {
  const el = shellRef.value;
  if (!document.fullscreenElement) {
    el?.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

function onFullscreenChange() {
  fullscreen.value = Boolean(document.fullscreenElement);
}

function pickQuality(qn) {
  qualityOpen.value = false;
  emit('change-quality', qn);
}

function sendDanmaku() {
  const content = danmakuText.value.trim();
  if (!content) return;
  emit('send-danmaku', { content, timeMs: Math.round(currentTime.value * 1000) });
  pushDanmaku({ content, color: '#FFFFFF' });
  danmakuText.value = '';
}

/** 把弹幕推到屏幕上（真实播放时间轴） */
function pushDanmaku(item) {
  liveDanmaku.value = [
    ...liveDanmaku.value.slice(-24),
    {
      ...item,
      key: `${item.content}-${Date.now()}-${Math.random()}`,
      top: 4 + Math.random() * 66,
      duration: 7 + Math.random() * 3,
    },
  ];
}

function startDanmakuLoop() {
  if (danmakuTimer) return;
  danmakuTimer = setInterval(() => {
    if (!props.danmakuOn || !playing.value) return;
    const el = videoRef.value;
    if (!el) return;
    const t = el.currentTime * 1000;
    // 命中当前时间窗口的弹幕，最多同时推 2 条
    const hits = props.danmakuList.filter(
      (d) => d.timeMs >= t - 400 && d.timeMs < t + 400,
    );
    hits.slice(0, 2).forEach((d) => pushDanmaku(d));
    // 清理已滚出屏幕的弹幕
    if (liveDanmaku.value.length > 34) {
      liveDanmaku.value = liveDanmaku.value.slice(-26);
    }
  }, 900);
}

function scheduleHide() {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    if (playing.value) showControls.value = false;
  }, 2600);
}

watch(
  () => props.src,
  () => {
    errorMessage.value = '';
    playing.value = false;
    currentTime.value = 0;
    duration.value = 0;
    liveDanmaku.value = [];
  },
);

watch(showControls, (val) => {
  if (val) scheduleHide();
});

window.addEventListener('fullscreenchange', onFullscreenChange);

onBeforeUnmount(() => {
  clearInterval(danmakuTimer);
  clearTimeout(hideTimer);
  window.removeEventListener('fullscreenchange', onFullscreenChange);
});

defineExpose({
  play: () => videoRef.value?.play(),
  pause: () => videoRef.value?.pause(),
  get element() {
    return videoRef.value;
  },
});
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.player {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: $radius-lg;
  overflow: hidden;
  user-select: none;

  &.is-fullscreen {
    border-radius: 0;
    aspect-ratio: auto;
    height: 100vh;
  }

  &__video {
    width: 100%;
    height: 100%;
    display: block;
    background: #000;
  }

  &__danmaku {
    position: absolute;
    inset: 0 0 64px 0;
    overflow: hidden;
    pointer-events: none;
  }

  &__bigplay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: rgba(0, 0, 0, 0.42);
    border: 2px solid rgba(255, 255, 255, 0.75);
    border-radius: 50%;
    padding-left: 5px;
    transition: all $transition-fast;

    &:hover {
      background: $brand-pink;
      border-color: #fff;
      transform: translate(-50%, -50%) scale(1.06);
    }
  }

  &__loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    gap: 6px;

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: $brand-pink;
      animation: bounce 1s infinite ease-in-out;

      &:nth-child(2) {
        animation-delay: 0.15s;
      }

      &:nth-child(3) {
        animation-delay: 0.3s;
      }
    }
  }

  &__error {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: #fff;
    background: rgba(0, 0, 0, 0.72);
    font-size: 14px;
  }

  &__controls {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 56px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 12px;
    background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.78));
    z-index: 3;
  }

  &__time {
    font-size: 12px;
    color: #fff;
    font-variant-numeric: tabular-nums;
    margin: 0 4px;
  }

  &__progress {
    flex: 1;
    height: 16px;
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  &__progress-bg {
    position: relative;
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.3);
  }

  &__progress-loaded {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: rgba(255, 255, 255, 0.45);
    border-radius: 2px;
  }

  &__progress-played {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: $brand-pink;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  &__progress-dot {
    width: 12px;
    height: 12px;
    margin-right: -6px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
    opacity: 0;
    transition: opacity $transition-fast;
  }

  &:hover &__progress-dot {
    opacity: 1;
  }

  &__quality {
    position: relative;
  }

  &__danmaku-input {
    position: absolute;
    right: 12px;
    bottom: 64px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 6px 5px 12px;
    background: rgba(0, 0, 0, 0.55);
    border-radius: 20px;
    z-index: 3;

    input {
      width: 190px;
      font-size: 13px;
      color: #fff;

      &::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }
}

.ctrl {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border-radius: $radius-md;
  transition: all $transition-fast;

  &:hover {
    background: rgba(255, 255, 255, 0.16);
    color: $brand-pink;
  }

  &--text {
    width: auto;
    padding: 0 8px;
    gap: 2px;
    font-size: 12px;
  }

  :deep(.is-off) {
    opacity: 0.45;
  }
}

.danmaku-send {
  height: 24px;
  padding: 0 12px;
  font-size: 12px;
  color: #fff;
  background: $brand-pink;
  border-radius: 14px;

  &:hover {
    background: $brand-pink-hover;
  }
}

.quality-menu {
  position: absolute;
  right: 0;
  bottom: 40px;
  width: 108px;
  padding: 4px;
  background: rgba(20, 20, 20, 0.92);
  border-radius: $radius-md;
  z-index: 5;

  &__item {
    padding: 7px 10px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    border-radius: $radius-sm;
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.12);
    }

    &.is-active {
      color: $brand-pink;
      font-weight: 600;
    }
  }
}

.danmaku-item {
  position: absolute;
  left: 100%;
  white-space: nowrap;
  font-size: 16px;
  font-weight: 500;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
  animation-name: danmaku-move;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  will-change: transform;
}

@keyframes danmaku-move {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100vw - 100%));
  }
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
