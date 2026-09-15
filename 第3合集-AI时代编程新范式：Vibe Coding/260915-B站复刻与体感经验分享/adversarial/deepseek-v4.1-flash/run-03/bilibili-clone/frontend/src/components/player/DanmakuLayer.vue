<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import type { DanmakuItem } from '@/types';

/**
 * 弹幕层：按播放进度滚动弹出弹幕。
 * - 通过父组件传入的 time（rAF 驱动，精度足够）做时间轴对齐；
 * - 跳转进度时自动清屏并重新定位指针；
 * - 暂停时用 animation-play-state 冻结所有在轨弹幕。
 */
const props = withDefaults(
  defineProps<{
    items: DanmakuItem[];
    time: number;
    playing?: boolean;
    enabled?: boolean;
  }>(),
  { playing: true, enabled: true },
);

interface ActiveItem {
  key: number;
  text: string;
  color: string;
  lane: number;
  duration: number;
  travel: number;
}

const LANE_HEIGHT = 30;
const SPEED = 110; // px/s

const root = ref<HTMLElement | null>(null);
const active = ref<ActiveItem[]>([]);
let pointer = 0;
let lastTime = 0;
let keySeed = 0;
let laneCursor = 0;
const timers = new Set<ReturnType<typeof setTimeout>>();

function laneCount(): number {
  const h = root.value?.clientHeight ?? 320;
  return Math.max(1, Math.floor((h * 0.78) / LANE_HEIGHT));
}

function spawn(text: string, color: string) {
  if (!props.enabled) return;
  const el = root.value;
  const playerW = el?.clientWidth ?? 800;
  const width = Math.max(40, text.length * 20 + 16);
  const travel = playerW + width;
  const duration = Math.max(5.5, Math.min(14, travel / SPEED));
  const item: ActiveItem = {
    key: keySeed++,
    text,
    color,
    lane: laneCursor++ % laneCount(),
    duration,
    travel,
  };
  active.value.push(item);
  const timer = setTimeout(
    () => {
      active.value = active.value.filter((a) => a.key !== item.key);
      timers.delete(timer);
    },
    duration * 1000 + 120,
  );
  timers.add(timer);
}

/** 二分查找：定位第一个 time >= t 的弹幕下标 */
function lowerBound(t: number): number {
  let lo = 0;
  let hi = props.items.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (props.items[mid]!.time < t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function clearAll() {
  active.value = [];
  timers.forEach(clearTimeout);
  timers.clear();
}

watch(
  () => props.time,
  (t) => {
    if (!props.enabled) return;
    const prev = lastTime;
    // 进度跳转（拖动进度条 / 切换视频）：清屏 + 重新定位
    if (t < prev - 0.35 || t > prev + 1.6) {
      clearAll();
      pointer = lowerBound(t);
      lastTime = t;
      return;
    }
    while (pointer < props.items.length && props.items[pointer]!.time <= t) {
      const item = props.items[pointer]!;
      pointer++;
      if (item.time > prev - 0.001) spawn(item.text, item.color);
    }
    lastTime = t;
  },
);

watch(
  () => props.items,
  () => {
    clearAll();
    pointer = 0;
    lastTime = 0;
  },
);

watch(
  () => props.enabled,
  (on) => {
    if (!on) clearAll();
    else {
      pointer = lowerBound(lastTime);
    }
  },
);

onMounted(() => {
  pointer = 0;
  lastTime = 0;
});

/** 供播放器「发弹幕」即时回显 */
function pushInstant(text: string, color = '#ffffff') {
  if (!props.enabled) return;
  spawn(text, color);
}

/** 供播放器 seek 后主动重置 */
function reset() {
  clearAll();
  pointer = lowerBound(props.time);
  lastTime = props.time;
}

defineExpose({ pushInstant, reset });
</script>

<template>
  <div ref="root" class="danmaku-layer" :class="{ 'is-off': !enabled }">
    <div
      v-for="item in active"
      :key="item.key"
      class="danmaku-item"
      :style="{
        top: `${item.lane * LANE_HEIGHT}px`,
        color: item.color,
        animationDuration: `${item.duration}s`,
        animationPlayState: playing ? 'running' : 'paused',
        '--travel': `${item.travel}px`,
      }"
    >
      <span class="danmaku-item__text">{{ item.text }}</span>
    </div>
  </div>
</template>

<style scoped>
.danmaku-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 6;
  transition: opacity 0.2s;
}
.danmaku-layer.is-off {
  opacity: 0;
}
.danmaku-item {
  position: absolute;
  left: 100%;
  white-space: nowrap;
  font-size: 20px;
  font-weight: 600;
  line-height: 30px;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.75), 0 1px 3px rgba(0, 0, 0, 0.6);
  animation-name: danmaku-move;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  will-change: transform;
}
.danmaku-item__text {
  display: inline-block;
}
@keyframes danmaku-move {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-1 * var(--travel)));
  }
}
</style>
