<template>
  <div
    class="carousel"
    @mouseenter="pause"
    @mouseleave="resume"
  >
    <div
      class="slides"
      :style="{ transform: `translateX(-${current * 100}%)` }"
    >
      <div v-for="b in banners" :key="b.id" class="slide">
        <img :src="b.image" :alt="b.title" />
        <router-link :to="b.link" class="slide-title">
          <span>{{ b.title }}</span>
        </router-link>
      </div>
    </div>

    <!-- 左右箭头 -->
    <button class="arrow arrow-left" @click="prev" aria-label="上一张">‹</button>
    <button class="arrow arrow-right" @click="next" aria-label="下一张">›</button>

    <!-- 指示点 -->
    <div class="dots">
      <button
        v-for="(b, i) in banners"
        :key="b.id"
        class="dot"
        :class="{ active: i === current }"
        @click="go(i)"
        :aria-label="`第${i + 1}张`"
      ></button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  banners: { type: Array, default: () => [] },
  interval: { type: Number, default: 4000 },
});

const current = ref(0);
let timer = null;

function next() {
  if (!props.banners.length) return;
  current.value = (current.value + 1) % props.banners.length;
}

function prev() {
  if (!props.banners.length) return;
  current.value = (current.value - 1 + props.banners.length) % props.banners.length;
}

function go(i) {
  current.value = i;
}

function resume() {
  clearInterval(timer);
  timer = setInterval(next, props.interval);
}

function pause() {
  clearInterval(timer);
}

onMounted(resume);
onBeforeUnmount(pause);
</script>

<style scoped>
.carousel {
  position: relative;
  width: 100%;
  aspect-ratio: 12 / 3.6;
  border-radius: var(--radius-card);
  overflow: hidden;
  background: #ddd;
}

.slides {
  display: flex;
  height: 100%;
  transition: transform 0.5s ease;
}

.slide {
  position: relative;
  flex: 0 0 100%;
  height: 100%;
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
  padding: 28px 18px 14px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.65));
  color: #fff;
  font-size: 16px;
  font-weight: 500;
}

.slide-title span:hover {
  color: var(--bili-pink);
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 22px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s, background 0.2s;
}

.carousel:hover .arrow {
  opacity: 1;
}

.arrow:hover {
  background: rgba(0, 0, 0, 0.6);
}

.arrow-left {
  left: 12px;
}

.arrow-right {
  right: 12px;
}

.dots {
  position: absolute;
  right: 16px;
  bottom: 12px;
  display: flex;
  gap: 7px;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transition: background 0.2s, transform 0.2s;
}

.dot.active {
  background: #fff;
  transform: scale(1.25);
}
</style>
