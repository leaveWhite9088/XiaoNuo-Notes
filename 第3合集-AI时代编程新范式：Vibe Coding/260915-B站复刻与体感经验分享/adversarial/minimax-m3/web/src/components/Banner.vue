<template>
  <div class="banner" @mouseenter="pause" @mouseleave="play">
    <div class="banner-track" :style="trackStyle">
      <div v-for="(s, i) in slides" :key="i" class="slide" :style="{ backgroundImage: `url(${s.image})` }">
        <div class="slide-mask"></div>
        <div class="container slide-content">
          <div class="slide-tag">{{ s.tag }}</div>
          <h2 class="slide-title">{{ s.title }}</h2>
          <p class="slide-desc">{{ s.desc }}</p>
          <button class="btn btn-primary slide-btn" @click="goTo(s.videoId)">立即观看</button>
        </div>
      </div>
    </div>
    <button class="nav-btn nav-prev" @click="prev" aria-label="上一张">‹</button>
    <button class="nav-btn nav-next" @click="next" aria-label="下一张">›</button>
    <div class="dots">
      <span
        v-for="(_, i) in slides"
        :key="i"
        class="dot"
        :class="{ active: i === current }"
        @click="current = i; restart()"
      ></span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const current = ref(0);
let timer = null;

const slides = [
  {
    image: 'https://picsum.photos/seed/banner-1/1600/480',
    tag: '官方 MV',
    title: '起风了・2026 现场版',
    desc: '买辣椒也用券，用歌声重温这个夏天的所有故事。',
    videoId: 'v3',
  },
  {
    image: 'https://picsum.photos/seed/banner-2/1600/480',
    tag: '首发评测',
    title: '2026 款 MacBook Pro M5 Max',
    desc: '用 9 个真实工作流告诉你：M5 Max 到底快了多少。',
    videoId: 'v12',
  },
  {
    image: 'https://picsum.photos/seed/banner-3/1600/480',
    tag: '游戏攻略',
    title: '黑神话悟空・黄风岭・全程攻略',
    desc: '隐藏 boss + 3 套轮椅级 build，跟着走就过。',
    videoId: 'v21',
  },
  {
    image: 'https://picsum.photos/seed/banner-4/1600/480',
    tag: '独家解析',
    title: '《三体 2：黑暗森林》首支预告逐帧拆解',
    desc: '面壁者、破壁人、冬眠——所有彩蛋都给你圈出来。',
    videoId: 'v25',
  },
];

const trackStyle = computed(() => ({
  transform: `translateX(-${current.value * 100}%)`,
}));

function next() { current.value = (current.value + 1) % slides.length; restart(); }
function prev() { current.value = (current.value - 1 + slides.length) % slides.length; restart(); }
function restart() {
  if (timer) clearInterval(timer);
  timer = setInterval(() => { current.value = (current.value + 1) % slides.length; }, 5000);
}
function pause() { if (timer) clearInterval(timer); }
function play() { restart(); }
function goTo(id) { router.push({ name: 'video', params: { id } }); }

onMounted(restart);
onBeforeUnmount(() => { if (timer) clearInterval(timer); });
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.banner {
  position: relative;
  width: 100%;
  height: 280px;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
  margin-top: 12px;
}
.banner-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.slide {
  position: relative;
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}
.slide-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.2) 60%, transparent 100%);
}
.slide-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #fff;
  max-width: $container-width;
}
.slide-tag {
  display: inline-block;
  width: fit-content;
  height: 22px;
  line-height: 22px;
  padding: 0 10px;
  font-size: 12px;
  border-radius: 11px;
  background: rgba(251, 114, 153, 0.85);
  margin-bottom: 10px;
}
.slide-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}
.slide-desc {
  font-size: 14px;
  max-width: 480px;
  margin-bottom: 16px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}
.slide-btn {
  width: 100px;
  height: 32px;
  border-radius: 16px;
  font-size: 13px;
}
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 22px;
  color: #fff;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: all 0.2s;
  z-index: 3;
  .banner:hover & { opacity: 1; }
  &:hover { background: rgba(0, 0, 0, 0.5); }
  &.nav-prev { left: 16px; }
  &.nav-next { right: 16px; }
}
.dots {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 3;
}
.dot {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  &.active { width: 24px; border-radius: 4px; background: #fff; }
  &:hover { background: rgba(255, 255, 255, 0.8); }
}
</style>
