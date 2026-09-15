<template>
  <div class="lazy-image" :style="{ paddingTop: ratioPadding }">
    <img
      v-if="visible && !failed"
      class="lazy-image__img"
      :class="{ 'is-loaded': loaded }"
      :src="src"
      :alt="alt"
      :referrerpolicy="referrerPolicy"
      loading="lazy"
      @load="loaded = true"
      @error="failed = true"
    />
    <div v-if="!loaded || failed" class="lazy-image__ph" :style="{ background: placeholder }">
      <SvgIcon name="picture" :size="26" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import SvgIcon from './SvgIcon.vue';

/**
 * 图片懒加载 + 占位图：
 * B站封面统一走 CDN 尺寸后缀，真实图片加载失败时降级为渐变占位。
 */
const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  ratio: { type: Number, default: 16 / 9 },
  placeholder: {
    type: String,
    default: 'linear-gradient(135deg, #e8eaed, #f4f5f7)',
  },
  referrerPolicy: { type: String, default: 'no-referrer' },
});

const loaded = ref(false);
const failed = ref(false);
const visible = ref(true);

const ratioPadding = computed(() => `${100 / props.ratio}%`);

onMounted(() => {
  // 优先级低的图片延迟一帧加载，避免同屏请求过多
  requestAnimationFrame(() => {
    visible.value = true;
  });
});
</script>

<style lang="scss" scoped>
.lazy-image {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #eef0f2;

  &__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.3s ease;

    &.is-loaded {
      opacity: 1;
    }
  }

  &__ph {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #c9ccd0;
  }
}
</style>
