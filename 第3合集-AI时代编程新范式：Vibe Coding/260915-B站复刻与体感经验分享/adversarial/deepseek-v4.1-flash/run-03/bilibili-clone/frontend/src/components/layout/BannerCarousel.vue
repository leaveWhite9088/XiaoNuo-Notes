<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import Icon from '@/components/common/Icon.vue';
import type { Banner } from '@/types';
import { PLACEHOLDER_COVER } from '@/utils';

/** 首页顶部轮播：自动播放 + 悬浮暂停 + 左右切换 + 指示点 */
const props = defineProps<{ banners: Banner[] }>();
const router = useRouter();

const index = ref(0);
const paused = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;

const current = computed(() => props.banners[index.value]);

function go(delta: number) {
  const len = props.banners.length;
  if (!len) return;
  index.value = (index.value + delta + len) % len;
}

function jump(link: string) {
  if (!link) return;
  if (link.startsWith('/video/')) {
    void router.push(link);
  } else {
    void router.push({ name: 'search', query: { keyword: link } });
  }
}

function start() {
  stop();
  timer = setInterval(() => {
    if (!paused.value) go(1);
  }, 4200);
}
function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}

watch(() => props.banners.length, start);
onMounted(start);
onUnmounted(stop);
</script>

<template>
  <div
    class="carousel"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
  >
    <TransitionGroup name="slide">
      <div v-for="(b, i) in banners" v-show="i === index" :key="b.id" class="carousel__slide">
        <img
          class="carousel__img"
          :src="b.image || PLACEHOLDER_COVER"
          :alt="b.title"
          @error="($event.target as HTMLImageElement).src = PLACEHOLDER_COVER"
          @click="jump(b.link)"
        />
        <div class="carousel__mask" @click="jump(b.link)">
          <div class="carousel__title clamp-2">{{ b.title }}</div>
          <div class="carousel__sub ellipsis">{{ b.subtitle }}</div>
        </div>
      </div>
    </TransitionGroup>

    <button class="carousel__arrow carousel__arrow--left" title="上一张" @click.stop="go(-1)">
      <Icon name="i-left" :size="26" />
    </button>
    <button class="carousel__arrow carousel__arrow--right" title="下一张" @click.stop="go(1)">
      <Icon name="i-right" :size="26" />
    </button>

    <div class="carousel__dots">
      <button
        v-for="(b, i) in banners"
        :key="b.id"
        class="carousel__dot"
        :class="{ 'is-active': i === index }"
        :title="b.title"
        @click.stop="index = i"
      ></button>
    </div>
  </div>
</template>

<style scoped>
.carousel {
  position: relative;
  height: 240px;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--bg-gray-deep);
}
.carousel__slide {
  position: absolute;
  inset: 0;
}
.carousel__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}
.carousel__mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 40px 24px 18px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.72));
  color: #fff;
  cursor: pointer;
}
.carousel__title {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.35;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}
.carousel__sub {
  margin-top: 4px;
  font-size: 13px;
  opacity: 0.85;
}
.carousel__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: all 0.25s;
  background: rgba(0, 0, 0, 0.25);
}
.carousel:hover .carousel__arrow {
  opacity: 1;
}
.carousel__arrow:hover {
  background: rgba(0, 0, 0, 0.5);
}
.carousel__arrow--left {
  left: 0;
  border-radius: 0 var(--radius) var(--radius) 0;
}
.carousel__arrow--right {
  right: 0;
  border-radius: var(--radius) 0 0 var(--radius);
}
.carousel__dots {
  position: absolute;
  right: 16px;
  bottom: 14px;
  display: flex;
  gap: 6px;
}
.carousel__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.25s;
}
.carousel__dot.is-active {
  width: 18px;
  border-radius: 4px;
  background: #fff;
}

.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.5s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}
</style>
