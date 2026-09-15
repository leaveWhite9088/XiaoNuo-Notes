<script setup>
/** 视频播放器 + 弹幕层：
 *  - 原生 <video> 控件真实播放（后端本地 MP4，支持拖动进度/倍速）
 *  - 弹幕：后端合成弹幕池按时间轴飘过；顶部弹幕栏可输入发送、开关弹幕
 */
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import BIcon from './BIcon.vue';
import { useToastStore } from '../stores/toast';

const props = defineProps({
  video: { type: Object, required: true },
  danmaku: { type: Array, default: () => [] },
});
const toast = useToastStore();

const stageEl = ref(null);
const videoEl = ref(null);
const dmEnabled = ref(true);
const dmInput = ref('');
const stageWidth = ref(800);

let ro = null;
onMounted(() => {
  ro = new ResizeObserver(() => {
    if (stageEl.value) stageWidth.value = stageEl.value.clientWidth;
  });
  if (stageEl.value) ro.observe(stageEl.value);
});
onBeforeUnmount(() => ro?.disconnect());

const active = reactive([]); // 活跃弹幕 {id,text,top,fontSize,color,dur}
let seq = 0;
let ptr = 0; // 弹幕池指针（已发射到第几条）
const LANES = 11;

const colors = ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffe066', '#74c0fc', '#ffa5c0'];

/** 选一条空闲航道：优先从未占用 lane 中取，否则取最早释放的 */
const laneFreeAt = new Float64Array(LANES).fill(0);
function pickLane(now, durMs) {
  let best = 0;
  for (let i = 1; i < LANES; i++) {
    if (laneFreeAt[i] < laneFreeAt[best]) best = i;
  }
  laneFreeAt[best] = now + durMs * 0.86; // 同轨道下一条需等前一条走过大半
  return best;
}

function spawn(text, now = performance.now()) {
  const durMs = 7600 + (text.length % 3) * 500;
  const id = ++seq;
  const lane = pickLane(now, durMs);
  active.push({
    id,
    text,
    top: 6 + lane * 26,
    fontSize: 15 + (id % 4) * 1.5,
    color: colors[id % colors.length],
    durMs,
  });
  setTimeout(() => {
    const i = active.findIndex((d) => d.id === id);
    if (i >= 0) active.splice(i, 1);
  }, durMs);
}

function onTimeUpdate() {
  const cur = videoEl.value?.currentTime ?? 0;
  // 播放指针始终推进：弹幕关闭期间路过的弹目直接跳过，避免重新打开时齐发
  while (ptr < props.danmaku.length && props.danmaku[ptr].time <= cur) {
    if (dmEnabled.value) spawn(props.danmaku[ptr].text);
    ptr++;
  }
}

function onPlay() {
  // 暂停期间发送的自有弹幕，恢复播放时展示
  while (pendingOwn.length) spawn(pendingOwn.shift());
}

function onSeeked() {
  const cur = videoEl.value?.currentTime ?? 0;
  // 快进/快退后重置指针并清屏
  ptr = props.danmaku.findIndex((d) => d.time > cur);
  if (ptr < 0) ptr = props.danmaku.length;
  active.splice(0);
}

const pendingOwn = []; // 暂停期间排队的自有弹幕

function send() {
  const text = dmInput.value.trim().slice(0, 30);
  if (!text) return;
  if (videoEl.value?.paused) {
    pendingOwn.push(text);
    toast.show('已发送，恢复播放后展示');
  } else {
    spawn(text);
  }
  dmInput.value = '';
}

function toggleDm() {
  dmEnabled.value = !dmEnabled.value;
  if (!dmEnabled.value) active.splice(0);
}

/** 切换视频时重置弹幕轨道 */
function reset() {
  ptr = 0;
  active.splice(0);
  pendingOwn.length = 0;
  laneFreeAt.fill(0);
}
defineExpose({ reset });

onBeforeUnmount(() => (active.splice(0)));
</script>

<template>
  <div class="player-wrap">
    <!-- 弹幕控制条（B 站式：位于画面顶部） -->
    <div class="dm-bar">
      <button class="dm-switch" :class="{ off: !dmEnabled }" :title="dmEnabled ? '关闭弹幕' : '开启弹幕'" @click="toggleDm">
        <BIcon name="danmaku" :size="16" />
        <span>弹</span>
      </button>
      <input
        v-model="dmInput"
        type="text"
        placeholder="发个弹幕见证当下"
        maxlength="30"
        @keyup.enter="send"
      />
      <button class="dm-send" @click="send">发送</button>
    </div>

    <div ref="stageEl" class="stage" :style="{ '--dm-stage-w': stageWidth + 'px' }">
      <video
        ref="videoEl"
        class="video"
        :src="video.playUrl"
        :poster="video.cover"
        controls
        preload="metadata"
        playsinline
        @timeupdate="onTimeUpdate"
        @play="onPlay"
        @seeked="onSeeked"
      />
      <div v-if="dmEnabled" class="dm-layer">
        <span
          v-for="d in active"
          :key="d.id"
          class="dm-item"
          :style="{ top: d.top + 'px', fontSize: d.fontSize + 'px', color: d.color, animationDuration: d.durMs + 'ms' }"
        >
          {{ d.text }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.player-wrap { border-radius: 10px; overflow: hidden; background: #000; }
.stage { position: relative; aspect-ratio: 16 / 9; background: #000; }
.video { width: 100%; height: 100%; display: block; }

.dm-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #101014;
  padding: 7px 10px;
}
.dm-switch {
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 13px;
  border-radius: 6px;
  padding: 5px 8px;
  cursor: pointer;
}
.dm-switch.off { opacity: 0.45; }
.dm-bar input {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  padding: 6px 12px;
  outline: none;
  min-width: 0;
}
.dm-bar input::placeholder { color: rgba(255, 255, 255, 0.4); }
.dm-bar input:focus { background: rgba(255, 255, 255, 0.18); }
.dm-send {
  border: none;
  background: var(--bili-pink);
  color: #fff;
  font-size: 13px;
  border-radius: 6px;
  padding: 6px 16px;
  cursor: pointer;
}
.dm-send:hover { background: var(--bili-pink-hover); }

.dm-layer {
  position: absolute;
  inset: 0 0 44px 0; /* 避开原生控制条区域 */
  overflow: hidden;
  pointer-events: none;
}
.dm-item {
  position: absolute;
  left: 100%;
  white-space: nowrap;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.75);
  animation-name: danmaku-move;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
</style>
