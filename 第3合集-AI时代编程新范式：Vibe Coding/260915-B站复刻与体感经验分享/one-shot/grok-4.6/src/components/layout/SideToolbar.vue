<template>
  <aside class="side">
    <button v-if="refresh" type="button" @click="$emit('refresh')">
      <span>↻</span>换一换
    </button>
    <a href="javascript:void(0)"><span>💬</span>客服</a>
    <a href="javascript:void(0)"><span>📝</span>反馈</a>
    <button v-show="showTop" type="button" @click="top">
      <span>↑</span>顶部
    </button>
  </aside>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
defineProps({ refresh: Boolean })
defineEmits(['refresh'])
const showTop = ref(false)
function onScroll() { showTop.value = window.scrollY > 400 }
function top() { window.scrollTo({ top: 0, behavior: 'smooth' }) }
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.side {
  position: fixed;
  right: 16px;
  top: 46%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 20;
}
button, a {
  width: 56px;
  height: 56px;
  border: 0;
  border-radius: 8px;
  background: #fff;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 12px;
  color: var(--text-2);
}
button:hover, a:hover { color: var(--pink); }
span { font-size: 16px; }
</style>
