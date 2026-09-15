<template>
  <transition name="fade">
    <button
      v-show="visible"
      class="back-to-top"
      title="回到顶部"
      @click="toTop"
    >
      <SvgIcon name="arrowUp" :size="20" />
    </button>
  </transition>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import SvgIcon from './SvgIcon.vue';

const visible = ref(false);

function onScroll() {
  visible.value = window.scrollY > 600;
}

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
});
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll));
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.back-to-top {
  position: fixed;
  right: 40px;
  bottom: 60px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 50%;
  color: $text-2;
  box-shadow: $shadow-pop;
  z-index: 900;
  transition: all $transition-fast;

  &:hover {
    color: $brand-blue;
    transform: translateY(-2px);
  }
}
</style>
