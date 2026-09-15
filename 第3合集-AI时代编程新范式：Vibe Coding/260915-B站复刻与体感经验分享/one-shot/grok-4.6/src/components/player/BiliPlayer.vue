<template>
  <div class="player" ref="root" @mousemove="showBar = true">
    <video
      ref="videoEl"
      :src="src"
      :poster="poster"
      @timeupdate="onTime"
      @loadedmetadata="duration = videoEl.duration || 0"
      @click="toggle"
      @ended="playing = false"
    ></video>
    <div class="danmaku" v-show="dmOn">
      <span
        v-for="d in flying"
        :key="d.id"
        class="dm"
        :style="{ top: d.top + '%', color: d.color, animationDuration: d.dur + 's' }"
      >{{ d.text }}</span>
    </div>
    <div class="big" v-if="!playing && current < 0.2" @click="toggle">▶</div>
    <div class="bar" :class="{ hide: !showBar && playing }">
      <input
        class="prog"
        type="range"
        min="0"
        max="1000"
        :value="progress"
        @input="seek($event.target.value)"
      />
      <div class="row">
        <button type="button" @click="toggle">{{ playing ? '❚❚' : '▶' }}</button>
        <span class="time">{{ formatDuration(current) }} / {{ formatDuration(duration) }}</span>
        <label class="dm-toggle">
          <input type="checkbox" v-model="dmOn" /> 弹幕
        </label>
        <input
          v-model="draft"
          class="dm-input"
          placeholder="发个弹幕吧"
          @keydown.enter="send"
        />
        <button class="send" type="button" @click="send">发送</button>
        <select v-model="rate" @change="videoEl.playbackRate = Number(rate)">
          <option value="0.75">0.75x</option>
          <option value="1">1.0x</option>
          <option value="1.25">1.25x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2.0x</option>
        </select>
        <span class="ql">1080P</span>
        <button type="button" @click="fs">⛶</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { formatDuration } from '../../utils/format'
import { useUserStore } from '../../stores/user'

const props = defineProps({
  src: String,
  poster: String,
  danmakuList: { type: Array, default: () => [] }
})
const user = useUserStore()
const videoEl = ref(null)
const root = ref(null)
const playing = ref(false)
const current = ref(0)
const duration = ref(0)
const dmOn = ref(true)
const draft = ref('')
const rate = ref('1')
const showBar = ref(true)
const flying = ref([])
const sent = new Set()
let hideTimer = 0
let uid = 0

const progress = computed(() => (duration.value ? (current.value / duration.value) * 1000 : 0))

watch(() => props.src, () => {
  sent.clear()
  flying.value = []
  current.value = 0
  playing.value = false
})

function toggle() {
  const v = videoEl.value
  if (!v) return
  if (v.paused) {
    v.play()
    playing.value = true
  } else {
    v.pause()
    playing.value = false
  }
}
function seek(val) {
  const v = videoEl.value
  if (!v || !duration.value) return
  v.currentTime = (Number(val) / 1000) * duration.value
}
function onTime() {
  const v = videoEl.value
  if (!v) return
  current.value = v.currentTime
  showBar.value = true
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => { if (playing.value) showBar.value = false }, 1800)
  if (!dmOn.value) return
  for (const d of props.danmakuList) {
    const key = d.t + d.text
    if (!sent.has(key) && Math.abs(v.currentTime - d.t) < 0.35) {
      sent.add(key)
      spawn(d.text, d.color)
    }
  }
}
function spawn(text, color = '#fff') {
  const id = ++uid
  const item = { id, text, color, top: 8 + (id % 8) * 9, dur: 7 + (id % 3) }
  flying.value.push(item)
  setTimeout(() => {
    flying.value = flying.value.filter((x) => x.id !== id)
  }, item.dur * 1000)
}
function send() {
  const t = draft.value.trim()
  if (!t) return
  spawn(t, '#FFD700')
  draft.value = ''
  user.toast('弹幕已发送')
}
function fs() {
  const el = root.value
  if (!el) return
  if (document.fullscreenElement) document.exitFullscreen()
  else el.requestFullscreen()
}
onUnmounted(() => clearTimeout(hideTimer))
</script>

<style scoped>
.player {
  position: relative;
  background: #000;
  border-radius: 6px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
}
video { width: 100%; height: 100%; object-fit: contain; background: #000; }
.danmaku { position: absolute; inset: 0 0 48px; overflow: hidden; pointer-events: none; }
.dm {
  position: absolute;
  left: 100%;
  white-space: nowrap;
  font-size: 20px;
  text-shadow: 1px 1px 2px #000;
  animation: fly linear forwards;
}
@keyframes fly {
  from { transform: translateX(0); }
  to { transform: translateX(calc(-100vw - 100%)); }
}
.big {
  position: absolute; inset: 0;
  display: grid; place-items: center;
  color: #fff; font-size: 64px;
  background: rgba(0,0,0,.2);
  cursor: pointer;
}
.bar {
  position: absolute; left: 0; right: 0; bottom: 0;
  background: linear-gradient(transparent, rgba(0,0,0,.75));
  padding: 8px 10px 10px;
  color: #fff;
  transition: opacity .2s;
}
.bar.hide { opacity: 0; }
.prog { width: 100%; accent-color: var(--pink); }
.row { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.row button, .row select {
  background: transparent; color: #fff; border: 0; font-size: 14px;
}
.time { min-width: 110px; color: #ddd; }
.dm-toggle { display: flex; align-items: center; gap: 4px; }
.dm-input {
  flex: 1;
  height: 28px;
  border: 0;
  border-radius: 14px;
  padding: 0 12px;
  background: rgba(255,255,255,.16);
  color: #fff;
  outline: none;
}
.send {
  background: var(--pink) !important;
  border-radius: 6px;
  padding: 4px 10px;
}
.ql { color: #9ad; }
</style>
