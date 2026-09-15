<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import Icon from '@/components/common/Icon.vue';

const visible = ref(false);

function onScroll() {
  visible.value = window.scrollY > 400;
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }));
onUnmounted(() => window.removeEventListener('scroll', onScroll));

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<template>
  <Transition name="fade">
    <button v-show="visible" class="back-top" title="回到顶部" @click="toTop">
      <Icon name="i-top" :size="22" />
    </button>
  </Transition>
</template>

<style scoped>
.back-top {
  position: fixed;
  right: 28px;
  bottom: 60px;
  z-index: 90;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fff;
  color: var(--text-2);
  box-shadow: var(--shadow-2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.back-top:hover {
  color: var(--bili-pink);
  transform: translateY(-2px);
}
</style>
