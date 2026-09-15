<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Icon from '@/components/common/Icon.vue';
import DanmakuLayer from '@/components/player/DanmakuLayer.vue';
import type { DanmakuItem } from '@/types';
import { formatDuration, PLACEHOLDER_COVER } from '@/utils';

/**
 * 播放器：原生 <video> + 自研控制条（播放/进度/音量/倍速/弹幕/全屏）。
 * 通过 rAF 驱动 currentTime，保证弹幕时间轴平滑。
 */
const props = withDefaults(
  defineProps<{
    src: string;
    poster?: string;
    title?: string;
    danmaku?: DanmakuItem[];
    autoplay?: boolean;
  }>(),
  { poster: '', title: '', danmaku: () => [], autoplay: false },
);

const emit = defineEmits<{
  (e: 'progress', payload: { currentTime: number; duration: number }): void;
  (e: 'ended'): void;
  /** 发弹幕：携带发送时的播放进度（毫秒），刷新后弹幕仍在同一时点 */
  (e: 'send-danmaku', payload: { text: string; timeMs: number }): void;
  (e: 'ready', duration: number): void;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const wrapRef = ref<HTMLElement | null>(null);
const layerRef = ref<InstanceType<typeof DanmakuLayer> | null>(null);

const playing = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const buffered = ref(0);
const volume = ref(1);
const muted = ref(false);
const rate = ref(1);
const showDanmaku = ref(true);
const isFullscreen = ref(false);
const controlsVisible = ref(true);
const rateMenuOpen = ref(false);
const hoverTime = ref<number | null>(null);
const dragging = ref(false);
const danmakuText = ref('');
const errorMsg = ref('');

let rafId = 0;
let hideTimer: ReturnType<typeof setTimeout> | null = null;
let lastReport = 0;

const progressPercent = computed(() =>
  duration.value ? Math.min(100, (currentTime.value / duration.value) * 100) : 0,
);
const bufferedPercent = computed(() =>
  duration.value ? Math.min(100, (buffered.value / duration.value) * 100) : 0,
);
const rates = [2, 1.5, 1.25, 1, 0.75, 0.5];

function loop() {
  const video = videoRef.value;
  if (video) {
    currentTime.value = video.currentTime;
    if (video.buffered.length) {
      buffered.value = video.buffered.end(video.buffered.length - 1);
    }
    if (playing.value && video.currentTime - lastReport >= 5) {
      lastReport = video.currentTime;
      emit('progress', { currentTime: video.currentTime, duration: video.duration || 0 });
    }
  }
  rafId = requestAnimationFrame(loop);
}

function syncDuration() {
  const video = videoRef.value;
  if (video && Number.isFinite(video.duration)) {
    duration.value = video.duration;
    emit('ready', video.duration);
  }
}

async function togglePlay() {
  const video = videoRef.value;
  if (!video) return;
  // 以组件自身的 playing 状态为准：play/pause 事件会同步它，
  // 这样即使浏览器拦截了自动播放，UI 状态也不会与实际操作脱节
  if (playing.value) {
    video.pause();
    playing.value = false;
    emit('progress', { currentTime: video.currentTime, duration: video.duration || 0 });
  } else {
    try {
      await video.play();
      playing.value = true;
    } catch {
      errorMsg.value = '播放被浏览器拦截，请再次点击播放';
    }
  }
}

function seekTo(seconds: number) {
  const video = videoRef.value;
  if (!video || !Number.isFinite(seconds)) return;
  video.currentTime = Math.max(0, Math.min(duration.value || 0, seconds));
  currentTime.value = video.currentTime;
  layerRef.value?.reset();
}

function percentFromEvent(e: MouseEvent): number {
  const bar = (e.currentTarget as HTMLElement).getBoundingClientRect();
  return Math.max(0, Math.min(1, (e.clientX - bar.left) / bar.width));
}

function onBarDown(e: MouseEvent) {
  dragging.value = true;
  seekTo(percentFromEvent(e) * duration.value);
  window.addEventListener('mousemove', onBarMove);
  window.addEventListener('mouseup', onBarUp);
}
function onBarMove(e: MouseEvent) {
  const bar = wrapRef.value?.querySelector('.progress') as HTMLElement | null;
  if (!bar) return;
  const rect = bar.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  hoverTime.value = ratio * duration.value;
  if (dragging.value) seekTo(ratio * duration.value);
}
function onBarUp() {
  dragging.value = false;
  window.removeEventListener('mousemove', onBarMove);
  window.removeEventListener('mouseup', onBarUp);
  emit('progress', { currentTime: currentTime.value, duration: duration.value });
}

function toggleMute() {
  const video = videoRef.value;
  if (!video) return;
  video.muted = !video.muted;
  muted.value = video.muted;
}

function onVolumeInput(e: Event) {
  const v = Number((e.target as HTMLInputElement).value);
  volume.value = v;
  if (videoRef.value) {
    videoRef.value.volume = v;
    videoRef.value.muted = v === 0;
    muted.value = v === 0;
  }
}

function setRate(r: number) {
  rate.value = r;
  rateMenuOpen.value = false;
  if (videoRef.value) videoRef.value.playbackRate = r;
}

async function toggleFullscreen() {
  const el = wrapRef.value;
  if (!el) return;
  if (!document.fullscreenElement) {
    await el.requestFullscreen().catch(() => undefined);
  } else {
    await document.exitFullscreen().catch(() => undefined);
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

function revealControls() {
  controlsVisible.value = true;
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    if (playing.value && !dragging.value) controlsVisible.value = false;
  }, 2600);
}

function sendDanmaku() {
  const text = danmakuText.value.trim();
  if (!text) return;
  // 关键：把弹幕绑定到当前播放进度，而不是恒定 0
  const timeMs = Math.round((videoRef.value?.currentTime ?? currentTime.value) * 1000);
  emit('send-danmaku', { text, timeMs });
  layerRef.value?.pushInstant(text, '#ffffff');
  danmakuText.value = '';
}

/** 焦点在表单类元素里时不拦截快捷键（否则评论框打不了空格、方向键挪不动光标） */
function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || el.nodeType !== 1) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'OPTION') return true;
  if (el.isContentEditable) return true;
  // 兼容自定义输入组件：向上查找可编辑祖先
  const editable = el.closest?.('input, textarea, select, [contenteditable="true"], [contenteditable=""]');
  return !!editable;
}

function onKeydown(e: KeyboardEvent) {
  if (e.defaultPrevented || e.isComposing) return;
  if (isEditableTarget(e.target)) return;
  if (e.code === 'Space') {
    e.preventDefault();
    void togglePlay();
  } else if (e.code === 'ArrowRight') {
    e.preventDefault();
    seekTo(currentTime.value + 5);
  } else if (e.code === 'ArrowLeft') {
    e.preventDefault();
    seekTo(currentTime.value - 5);
  } else if (e.code === 'KeyF') {
    void toggleFullscreen();
  }
}

function onVideoClick() {
  void togglePlay();
}

watch(
  () => props.src,
  () => {
    currentTime.value = 0;
    duration.value = 0;
    playing.value = false;
    lastReport = 0;
    layerRef.value?.reset();
    const video = videoRef.value;
    if (video) {
      video.load();
      if (props.autoplay) void video.play().catch(() => undefined);
    }
  },
);

onMounted(() => {
  const video = videoRef.value;
  if (video) {
    video.volume = volume.value;
    if (props.autoplay) void video.play().catch(() => undefined);
  }
  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('keydown', onKeydown);
  rafId = requestAnimationFrame(loop);
  revealControls();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId);
  document.removeEventListener('fullscreenchange', onFullscreenChange);
  document.removeEventListener('keydown', onKeydown);
  window.removeEventListener('mousemove', onBarMove);
  window.removeEventListener('mouseup', onBarUp);
  emit('progress', { currentTime: currentTime.value, duration: duration.value });
});
</script>

<template>
  <div
    ref="wrapRef"
    class="player"
    :class="{ 'is-fullscreen': isFullscreen, 'hide-cursor': !controlsVisible }"
    @mousemove="revealControls"
    @mouseleave="controlsVisible = false"
  >
    <video
      ref="videoRef"
      class="player__video"
      :src="src"
      :poster="poster || PLACEHOLDER_COVER"
      preload="metadata"
      playsinline
      @click="onVideoClick"
      @play="playing = true"
      @pause="playing = false"
      @loadedmetadata="syncDuration"
      @durationchange="syncDuration"
      @ended="emit('ended')"
      @error="errorMsg = '视频加载失败'"
    ></video>

    <!-- 弹幕层 -->
    <DanmakuLayer
      ref="layerRef"
      :items="danmaku"
      :time="currentTime"
      :playing="playing"
      :enabled="showDanmaku"
    />

    <!-- 中央播放按钮 -->
    <button v-show="!playing" class="player__center" @click="togglePlay">
      <Icon name="i-play" :size="34" />
    </button>

    <!-- 顶部标题 -->
    <div class="player__top" :class="{ 'is-show': controlsVisible || !playing }">
      <span class="player__top-title ellipsis">{{ title }}</span>
    </div>

    <!-- 控制条 -->
    <div class="player__controls" :class="{ 'is-show': controlsVisible || !playing }">
      <button class="ctrl" :title="playing ? '暂停' : '播放'" @click="togglePlay">
        <Icon :name="playing ? 'i-pause' : 'i-play'" :size="20" />
      </button>

      <span class="ctrl__time">
        {{ formatDuration(currentTime) }} / {{ formatDuration(duration) }}
      </span>

      <div class="progress" @mousedown="onBarDown" @mousemove="onBarMove" @mouseleave="hoverTime = null">
        <div class="progress__track">
          <div class="progress__buffered" :style="{ width: `${bufferedPercent}%` }"></div>
          <div class="progress__played" :style="{ width: `${progressPercent}%` }">
            <span class="progress__thumb"></span>
          </div>
        </div>
        <span v-if="hoverTime !== null" class="progress__tip" :style="{ left: `${(hoverTime / (duration || 1)) * 100}%` }">
          {{ formatDuration(hoverTime) }}
        </span>
      </div>

      <!-- 发弹幕 -->
      <div class="danmaku-input">
        <input
          v-model="danmakuText"
          type="text"
          placeholder="发个弹幕见证当下"
          maxlength="50"
          @keydown.enter="sendDanmaku"
        />
        <button class="danmaku-input__send" @click="sendDanmaku">发送</button>
      </div>

      <button class="ctrl" :class="{ 'is-off': !showDanmaku }" title="弹幕开关" @click="showDanmaku = !showDanmaku">
        <Icon name="i-danmaku" :size="20" />
      </button>

      <div class="volume">
        <button class="ctrl" :title="muted ? '取消静音' : '静音'" @click="toggleMute">
          <Icon :name="muted || volume === 0 ? 'i-muted' : 'i-volume'" :size="20" />
        </button>
        <input
          class="volume__slider"
          type="range"
          min="0"
          max="1"
          step="0.05"
          :value="muted ? 0 : volume"
          @input="onVolumeInput"
        />
      </div>

      <div class="rate">
        <button class="ctrl ctrl--text" @click="rateMenuOpen = !rateMenuOpen">{{ rate }}x</button>
        <Transition name="fade">
          <div v-show="rateMenuOpen" class="rate__menu">
            <button
              v-for="r in rates"
              :key="r"
              class="rate__item"
              :class="{ 'is-active': r === rate }"
              @click="setRate(r)"
            >
              {{ r }}x
            </button>
          </div>
        </Transition>
      </div>

      <button class="ctrl" title="全屏" @click="toggleFullscreen">
        <Icon name="i-fullscreen" :size="20" />
      </button>
    </div>

    <div v-if="errorMsg" class="player__error">{{ errorMsg }}</div>
  </div>
</template>

<style scoped>
.player {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: var(--radius);
  overflow: hidden;
  user-select: none;
}
.player.is-fullscreen {
  border-radius: 0;
  aspect-ratio: auto;
  height: 100vh;
}
.player.hide-cursor {
  cursor: none;
}
.player__video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
  cursor: pointer;
}

.player__center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 74px;
  height: 74px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgba(251, 114, 153, 0.88);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
  transition: transform 0.2s, background 0.2s;
  z-index: 8;
}
.player__center:hover {
  transform: translate(-50%, -50%) scale(1.07);
  background: var(--bili-pink-hover);
}
.player__center :deep(svg) {
  margin-left: 3px;
}

.player__top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px 16px 30px;
  background: linear-gradient(rgba(0, 0, 0, 0.55), transparent);
  color: #fff;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.25s;
  pointer-events: none;
  z-index: 7;
}
.player__top.is-show {
  opacity: 1;
}

.player__controls {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 22px 14px 10px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.75));
  color: #fff;
  opacity: 0;
  transform: translateY(6px);
  transition: all 0.24s;
  z-index: 9;
}
.player__controls.is-show {
  opacity: 1;
  transform: translateY(0);
}

.ctrl {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  color: #fff;
  transition: all 0.16s;
  flex: none;
}
.ctrl:hover {
  background: rgba(255, 255, 255, 0.18);
  color: var(--bili-pink);
}
.ctrl.is-off {
  opacity: 0.45;
}
.ctrl--text {
  width: 44px;
  font-size: 13px;
}
.ctrl__time {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  flex: none;
  opacity: 0.9;
}

.progress {
  position: relative;
  flex: 1;
  height: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.progress__track {
  position: relative;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.28);
  transition: height 0.15s;
}
.progress:hover .progress__track {
  height: 6px;
}
.progress__buffered {
  position: absolute;
  inset: 0 auto 0 0;
  background: rgba(255, 255, 255, 0.42);
  border-radius: 2px;
}
.progress__played {
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--bili-pink);
  border-radius: 2px;
}
.progress__thumb {
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%) scale(0);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  transition: transform 0.15s;
}
.progress:hover .progress__thumb {
  transform: translateY(-50%) scale(1);
}
.progress__tip {
  position: absolute;
  bottom: 20px;
  transform: translateX(-50%);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.78);
  font-size: 11px;
  pointer-events: none;
  white-space: nowrap;
}

.danmaku-input {
  display: flex;
  align-items: center;
  height: 30px;
  width: 220px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.18);
  padding: 0 4px 0 12px;
  flex: none;
  transition: all 0.2s;
}
.danmaku-input:focus-within {
  background: #fff;
  color: var(--text-1);
}
.danmaku-input input {
  flex: 1;
  min-width: 0;
  background: transparent;
  color: inherit;
  font-size: 12px;
}
.danmaku-input input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}
.danmaku-input:focus-within input::placeholder {
  color: var(--text-3);
}
.danmaku-input__send {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  background: var(--bili-pink);
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s;
}
.danmaku-input:focus-within .danmaku-input__send {
  opacity: 1;
}

.volume {
  display: flex;
  align-items: center;
  flex: none;
}
.volume__slider {
  width: 0;
  opacity: 0;
  transition: all 0.22s;
  accent-color: var(--bili-pink);
}
.volume:hover .volume__slider {
  width: 68px;
  opacity: 1;
  margin-left: 2px;
}

.rate {
  position: relative;
  flex: none;
}
.rate__menu {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(20, 20, 20, 0.92);
  border-radius: var(--radius);
  padding: 4px;
  min-width: 72px;
}
.rate__item {
  display: block;
  width: 100%;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  color: #fff;
  font-size: 12px;
  text-align: center;
}
.rate__item:hover,
.rate__item.is-active {
  background: var(--bili-pink);
}

.player__error {
  position: absolute;
  left: 50%;
  top: 16px;
  transform: translateX(-50%);
  padding: 4px 12px;
  border-radius: var(--radius);
  background: rgba(0, 0, 0, 0.7);
  color: #ffb3b3;
  font-size: 12px;
  z-index: 10;
}

@media (max-width: 720px) {
  .danmaku-input {
    width: 130px;
  }
}
</style>
