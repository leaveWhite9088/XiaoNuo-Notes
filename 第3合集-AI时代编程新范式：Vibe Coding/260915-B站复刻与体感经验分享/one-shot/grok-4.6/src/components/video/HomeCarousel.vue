<template>
  <div class="carousel" @mouseenter="stop" @mouseleave="start">
    <router-link v-if="current" class="slide" :to="'/video/' + current.bvid">
      <img :src="current.cover" :alt="current.title" />
      <div class="mask"></div>
      <div class="tools">
        <span class="ttl">{{ current.title }}</span>
        <div class="dots">
          <button
            v-for="(s, i) in slides"
            :key="s.id"
            type="button"
            :class="{ on: i === index }"
            @click.prevent="index = i"
          ></button>
        </div>
        <div class="nav">
          <button type="button" @click.prevent="prev">‹</button>
          <button type="button" @click.prevent="next">›</button>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
const props = defineProps({ slides: { type: Array, default: () => [] } })
const index = ref(0)
const current = computed(() => props.slides[index.value] || props.slides[0])
let timer = 0
function next() {
  if (!props.slides.length) return
  index.value = (index.value + 1) % props.slides.length
}
function prev() {
  if (!props.slides.length) return
  index.value = (index.value - 1 + props.slides.length) % props.slides.length
}
function start() {
  stop()
  timer = setInterval(next, 3800)
}
function stop() { clearInterval(timer) }
onMounted(start)
onUnmounted(stop)
</script>

<style scoped>
.carousel {
  grid-column: span 2;
  grid-row: span 2;
  min-width: 0;
}
.slide {
  position: relative;
  display: block;
  height: 100%;
  min-height: 220px;
  border-radius: 8px;
  overflow: hidden;
  background: #222;
}
img { width: 100%; height: 100%; object-fit: cover; }
.mask {
  position: absolute; inset: auto 0 0;
  height: 46%;
  background: linear-gradient(transparent, rgba(0,0,0,.7));
}
.tools {
  position: absolute; left: 14px; right: 14px; bottom: 12px;
  display: flex; align-items: center; gap: 10px; color: #fff;
}
.ttl {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dots { display: flex; gap: 6px; }
.dots button {
  width: 8px; height: 8px; border-radius: 50%; border: 0; background: rgba(255,255,255,.45);
}
.dots .on { background: #fff; width: 16px; border-radius: 8px; }
.nav button {
  width: 28px; height: 28px; border: 0; border-radius: 6px;
  background: rgba(255,255,255,.2); color: #fff; font-size: 18px;
}
.nav button:hover { background: rgba(255,255,255,.4); }
</style>
