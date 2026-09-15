<template>
  <div class="carousel">
    <div class="carousel__stage">
      <transition name="fade" mode="out-in">
        <RouterLink
          v-if="current"
          :key="current.id"
          class="carousel__slide"
          :to="slideTarget"
        >
          <img class="carousel__img" :src="current.image" :alt="current.title" referrerpolicy="no-referrer" />
          <span class="carousel__shade" />
          <span class="carousel__badge">{{ current.badge }}</span>
          <h3 class="carousel__title">{{ current.title }}</h3>
          <p class="carousel__sub">{{ current.subtitle }}</p>
        </RouterLink>
      </transition>

      <button class="carousel__arrow carousel__arrow--prev" @click.prevent="step(-1)">
        <SvgIcon name="arrowLeft" :size="18" />
      </button>
      <button class="carousel__arrow carousel__arrow--next" @click.prevent="step(1)">
        <SvgIcon name="arrowRight" :size="18" />
      </button>
    </div>

    <div class="carousel__dots">
      <button
        v-for="(item, index) in banners"
        :key="item.id"
        class="carousel__dot"
        :class="{ 'is-active': index === index2 }"
        @click="index2 = index"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import SvgIcon from '@/components/common/SvgIcon.vue';

/**
 * 首页轮播：占 2 列宽，自动播放 + 手动切换 + 指示点。
 */
const props = defineProps({
  banners: { type: Array, default: () => [] },
  interval: { type: Number, default: 5000 },
});

const index2 = ref(0);
let timer = null;

const current = computed(() => props.banners[index2.value] || null);
const slideTarget = computed(() =>
  current.value?.bvid
    ? { name: 'video', params: { bvid: current.value.bvid } }
    : { name: 'home' },
);

function step(delta) {
  const len = props.banners.length;
  if (!len) return;
  index2.value = (index2.value + delta + len) % len;
}

function start() {
  stop();
  timer = setInterval(() => step(1), props.interval);
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}

watch(() => props.banners.length, () => {
  index2.value = 0;
  start();
});

onMounted(start);
onBeforeUnmount(stop);
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.carousel {
  width: 100%;

  &__stage {
    position: relative;
    width: 100%;
    aspect-ratio: 976 / 550;
    border-radius: $radius-lg;
    overflow: hidden;
    background: $bg-card;
  }

  &__slide {
    position: absolute;
    inset: 0;
    display: block;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.72) 100%);
  }

  &__badge {
    position: absolute;
    top: 12px;
    left: 12px;
    padding: 2px 8px;
    font-size: 12px;
    color: #fff;
    background: rgba(251, 114, 153, 0.92);
    border-radius: 20px;
  }

  &__title {
    position: absolute;
    left: 18px;
    right: 18px;
    bottom: 40px;
    font-size: 20px;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__sub {
    position: absolute;
    left: 18px;
    bottom: 18px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.85);
  }

  &__arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 50%;
    opacity: 0;
    transition: all $transition-base;

    &--prev {
      left: 12px;
    }

    &--next {
      right: 12px;
    }
  }

  &:hover &__arrow {
    opacity: 1;
  }

  &__arrow:hover {
    background: $brand-pink;
  }

  &__dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 14px 0 6px;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.16);
    transition: all $transition-fast;

    &.is-active {
      width: 18px;
      border-radius: 4px;
      background: $brand-pink;
    }
  }
}
</style>
