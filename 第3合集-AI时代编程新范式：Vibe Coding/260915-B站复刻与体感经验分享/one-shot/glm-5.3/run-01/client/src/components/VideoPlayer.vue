<script setup>
import { ref, computed, onBeforeUnmount } from 'vue';
import BaseIcon from './BaseIcon.vue';
import { formatDuration } from '../utils/format.js';

const props = defineProps({
  src: { type: String, required: true },
  poster: { type: String, default: '' },
  danmakuPool: { type: Array, default: () => [] },
});

const video = ref(null);
const container = ref(null);

const playing = ref(false);
const waiting = ref(false);
const ended = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const bufferedPct = ref(0);
const volume = ref(Number(localStorage.getItem('bili-volume')) || 0.7);
const muted = ref(false);
const rate = ref(1);
const fullscreen = ref(false);
const danmakuOn = ref(true);
const showControls = ref(true);
const rateMenuOpen = ref(false);

const progressPct = computed(() => (duration.value ? (currentTime.value / duration.value) * 100 : 0));

// ---------- 控制条自动隐藏 ----------
let hideTimer = null;
function wakeControls() {
  showControls.value = true;
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    if (playing.value) showControls.value = false;
  }, 2600);
}
onBeforeUnmount(() => clearTimeout(hideTimer));

// ---------- 播放控制 ----------
const userPaused = ref(false);

function tryPlay(retries = 2) {
  const v = video.value;
  if (!v) return;
  v.play().catch(() => {
    // WebKit 省电策略可能打断起播（如后台标签）；用户主动暂停时不重试
    if (retries > 0 && !userPaused.value) setTimeout(() => tryPlay(retries - 1), 800);
  });
}

function togglePlay() {
  const v = video.value;
  if (!v) return;
  if (v.paused) {
    userPaused.value = false;
    tryPlay();
  } else {
    userPaused.value = true;
    v.pause();
  }
  wakeControls();
}

// 页面重新可见时，若之前处于播放态被系统暂停，则恢复播放
function onVisibility() {
  const v = video.value;
  if (document.visibilityState === 'visible' && v && !userPaused.value && v.currentTime > 0 && duration.value > 0) {
    tryPlay(1);
  }
}
document.addEventListener('visibilitychange', onVisibility);
onBeforeUnmount(() => document.removeEventListener('visibilitychange', onVisibility));

function onTimeUpdate() {
  const v = video.value;
  currentTime.value = v.currentTime;
  if (v.buffered.length) {
    bufferedPct.value = (v.buffered.end(v.buffered.length - 1) / (v.duration || 1)) * 100;
  }
}

function seekTo(ratio) {
  const v = video.value;
  if (!v || !v.duration) return;
  v.currentTime = ratio * v.duration;
  currentTime.value = v.currentTime;
}

// 进度条：点击 + 拖动
const progressWrap = ref(null);
const dragging = ref(false);
function ratioFromEvent(e) {
  const rect = progressWrap.value.getBoundingClientRect();
  return Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
}
function onProgressDown(e) {
  dragging.value = true;
  seekTo(ratioFromEvent(e));
  window.addEventListener('pointermove', onProgressMove);
  window.addEventListener('pointerup', onProgressUp);
}
function onProgressMove(e) {
  if (dragging.value) seekTo(ratioFromEvent(e));
}
function onProgressUp() {
  dragging.value = false;
  window.removeEventListener('pointermove', onProgressMove);
  window.removeEventListener('pointerup', onProgressUp);
}
onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onProgressMove);
  window.removeEventListener('pointerup', onProgressUp);
});

// ---------- 音量 ----------
function setVolume(val) {
  volume.value = val;
  muted.value = val === 0;
  localStorage.setItem('bili-volume', String(val));
}
function toggleMute() {
  const v = video.value;
  if (!v) return;
  v.muted = !v.muted;
  muted.value = v.muted;
}
function applyVolume() {
  const v = video.value;
  if (v) {
    v.volume = volume.value;
    v.muted = muted.value;
  }
}

// ---------- 倍速 ----------
const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];
function setRate(r) {
  rate.value = r;
  if (video.value) video.value.playbackRate = r;
  rateMenuOpen.value = false;
}

// ---------- 全屏 ----------
function toggleFullscreen() {
  const el = container.value;
  if (!document.fullscreenElement) {
    el.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.();
  }
}
function onFsChange() {
  fullscreen.value = Boolean(document.fullscreenElement && document.fullscreenElement === container.value);
}

// ---------- 弹幕（简化演示版） ----------
const danmakuItems = ref([]);
let danmakuTimer = null;
let danmakuSeq = 0;
const DANMAKU_ROWS = 7;

function spawnDanmaku() {
  if (!danmakuOn.value || !playing.value || !props.danmakuPool.length) return;
  const text = props.danmakuPool[Math.floor(Math.random() * props.danmakuPool.length)];
  const id = ++danmakuSeq;
  const top = Math.floor(Math.random() * DANMAKU_ROWS) * 30 + 8;
  const duration = 7 + Math.random() * 3;
  danmakuItems.value.push({ id, text, top, duration });
  if (danmakuItems.value.length > 30) danmakuItems.value.splice(0, 10);
  setTimeout(() => {
    danmakuItems.value = danmakuItems.value.filter((d) => d.id !== id);
  }, duration * 1000);
}

function startDanmakuLoop() {
  stopDanmakuLoop();
  danmakuTimer = setInterval(spawnDanmaku, 900);
}
function stopDanmakuLoop() {
  clearInterval(danmakuTimer);
  danmakuTimer = null;
}
onBeforeUnmount(stopDanmakuLoop);
</script>

<template>
  <div
    ref="container"
    class="player"
    :class="{ 'controls-hidden': !showControls && playing }"
    @mousemove="wakeControls"
    @mouseleave="hideTimer && clearTimeout(hideTimer)"
    @fullscreenchange="onFsChange"
  >
    <video
      ref="video"
      class="video"
      :src="src"
      :poster="poster"
      preload="metadata"
      playsinline
      @click="togglePlay"
      @play="playing = true; ended = false; startDanmakuLoop(); wakeControls()"
      @pause="playing = false; showControls = true; stopDanmakuLoop()"
      @ended="playing = false; ended = true; stopDanmakuLoop()"
      @waiting="waiting = true"
      @playing="waiting = false"
      @canplay="waiting = false"
      @loadedmetadata="duration = video.duration; applyVolume()"
      @timeupdate="onTimeUpdate"
      @volumechange="muted = video.muted"
    />

    <!-- 弹幕层 -->
    <div v-if="danmakuOn" class="danmaku-layer">
      <span
        v-for="d in danmakuItems"
        :key="d.id"
        class="danmaku"
        :style="{ top: d.top + 'px', animationDuration: d.duration + 's' }"
      >
        {{ d.text }}
      </span>
    </div>

    <!-- 中央播放/加载/重播 -->
    <div class="center-state" @click="togglePlay">
      <div v-if="waiting" class="spinner" title="加载中"></div>
      <BaseIcon v-else-if="!playing && !ended" name="play" :size="54" class="center-btn" />
      <div v-else-if="ended" class="replay-wrap">
        <BaseIcon name="replay" :size="44" class="center-btn" />
        <span class="replay-text">重播</span>
      </div>
    </div>

    <!-- 底部控制条 -->
    <div class="controls" @click.stop>
      <div
        ref="progressWrap"
        class="progress"
        @pointerdown="onProgressDown"
      >
        <div class="progress-buffered" :style="{ width: bufferedPct + '%' }"></div>
        <div class="progress-played" :style="{ width: progressPct + '%' }">
          <span class="progress-dot"></span>
        </div>
      </div>
      <div class="controls-row">
        <button class="ctl" :title="playing ? '暂停' : '播放'" @click="togglePlay">
          <BaseIcon :name="playing ? 'pause' : 'play'" :size="20" />
        </button>
        <span class="time">{{ formatDuration(currentTime) }} / {{ formatDuration(duration) }}</span>

        <div class="volume-group">
          <button class="ctl" :title="muted ? '取消静音' : '静音'" @click="toggleMute">
            <BaseIcon :name="muted || volume === 0 ? 'volumeOff' : 'volume'" :size="18" />
          </button>
          <input
            class="volume-range"
            type="range"
            min="0"
            max="1"
            step="0.05"
            :value="muted ? 0 : volume"
            @input="setVolume(Number($event.target.value))"
          />
        </div>

        <button class="ctl danmaku-toggle" :class="{ off: !danmakuOn }" title="弹幕开关" @click="danmakuOn = !danmakuOn">
          <span class="danmaku-label">弹</span>
        </button>

        <div class="rate-group">
          <button class="ctl" @click="rateMenuOpen = !rateMenuOpen">倍速 {{ rate }}x</button>
          <div v-if="rateMenuOpen" class="rate-menu">
            <button
              v-for="r in RATES"
              :key="r"
              class="rate-item"
              :class="{ active: r === rate }"
              @click="setRate(r)"
            >
              {{ r }}x
            </button>
          </div>
        </div>

        <button class="ctl" :title="fullscreen ? '退出全屏' : '全屏'" @click="toggleFullscreen">
          <BaseIcon :name="fullscreen ? 'exitFullscreen' : 'fullscreen'" :size="18" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.player {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 10px;
  overflow: hidden;
  user-select: none;
}
.video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
}

/* 弹幕 */
.danmaku-layer {
  position: absolute;
  inset: 0 0 56px 0;
  overflow: hidden;
  pointer-events: none;
}
.danmaku {
  position: absolute;
  left: 100%;
  white-space: nowrap;
  color: #fff;
  font-size: 15px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  animation: danmaku-move linear forwards;
}
@keyframes danmaku-move {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100vw - 100%));
  }
}

/* 中央状态 */
.center-state {
  position: absolute;
  inset: 0 0 56px 0;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.center-btn {
  color: rgba(255, 255, 255, 0.9);
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6));
}
.replay-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.replay-text {
  color: #fff;
  font-size: 13px;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 控制条 */
.controls {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 12px 6px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  transition: opacity 0.25s, transform 0.25s;
}
.player.controls-hidden .controls {
  opacity: 0;
  transform: translateY(8px);
  pointer-events: none;
}
.progress {
  position: relative;
  height: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.progress::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 2px;
}
.progress-buffered,
.progress-played {
  position: absolute;
  left: 0;
  height: 3px;
  border-radius: 2px;
}
.progress-buffered {
  background: rgba(255, 255, 255, 0.4);
}
.progress-played {
  background: var(--bili-pink);
}
.progress-dot {
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}
.controls-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}
.ctl {
  color: #fff;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.ctl:hover {
  background: rgba(255, 255, 255, 0.15);
}
.time {
  color: #fff;
  font-size: 12px;
  padding: 0 6px;
  min-width: 96px;
  text-align: center;
}
.volume-group {
  display: flex;
  align-items: center;
}
.volume-range {
  width: 64px;
  accent-color: var(--bili-pink);
  cursor: pointer;
}
.danmaku-toggle .danmaku-label {
  font-weight: 700;
  border: 1.5px solid currentColor;
  border-radius: 4px;
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  font-size: 12px;
}
.danmaku-toggle.off {
  opacity: 0.5;
}
.rate-group {
  position: relative;
}
.rate-menu {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  border-radius: 8px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 64px;
}
.rate-item {
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
}
.rate-item:hover {
  background: rgba(255, 255, 255, 0.15);
}
.rate-item.active {
  color: var(--bili-pink);
  font-weight: 600;
}
</style>
