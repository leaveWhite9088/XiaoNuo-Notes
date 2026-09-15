<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  banners: { type: Array, default: () => [] },
});

const router = useRouter();
const index = ref(0);
let timer = null;
const paused = ref(false);

function start() {
  stop();
  if (props.banners.length < 2) return;
  timer = setInterval(() => {
    index.value = (index.value + 1) % props.banners.length;
  }, 5000);
}
function stop() {
  clearInterval(timer);
}

function prev() {
  index.value = (index.value - 1 + props.banners.length) % props.banners.length;
}
function next() {
  index.value = (index.value + 1) % props.banners.length;
}
function go(banner) {
  if (banner.videoId) router.push(`/video/${banner.videoId}`);
}

onMounted(start);
onBeforeUnmount(stop);
watch(() => props.banners, start);
</script>

<template>
  <div v-if="banners.length" class="carousel" @mouseenter="paused = true" @mouseleave="paused = false">
    <div class="slides" :style="{ transform: `translateX(-${index * 100}%)` }">
      <div v-for="b in banners" :key="b.image" class="slide" @click="go(b)">
        <img :src="b.image" :alt="b.title" />
        <span class="slide-title line-clamp-1">{{ b.title }}</span>
      </div>
    </div>
    <button v-if="banners.length > 1" class="arrow left" @click="prev">‹</button>
    <button v-if="banners.length > 1" class="arrow right" @click="next">›</button>
    <div class="dots">
      <span
        v-for="(b, i) in banners"
        :key="i"
        class="dot"
        :class="{ active: i === index }"
        @click="index = i"
      />
    </div>
  </div>
</template>

<style scoped>
.carousel {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  aspect-ratio: 960 / 330;
  background: #e7e9eb;
}
.slides {
  display: flex;
  height: 100%;
  transition: transform 0.45s ease;
}
.slide {
  position: relative;
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  cursor: pointer;
}
.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.slide-title {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 26px 16px 10px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.55));
  color: #fff;
  font-size: 14px;
}
.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 60px;
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  font-size: 24px;
  border-radius: 0 6px 6px 0;
  opacity: 0;
  transition: opacity 0.2s;
}
.carousel:hover .arrow {
  opacity: 1;
}
.arrow.left {
  left: 0;
}
.arrow.right {
  right: 0;
  border-radius: 6px 0 0 6px;
}
.dots {
  position: absolute;
  bottom: 8px;
  right: 12px;
  display: flex;
  gap: 6px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: all 0.2s;
}
.dot.active {
  width: 18px;
  background: #fff;
}
</style>
