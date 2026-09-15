<script setup>
/** 头部悬停下拉容器：hover 触发器展开面板，移出（含面板）后收起，带 120ms 容错延时 */
import { ref } from 'vue';

defineProps({
  width: { type: Number, default: 372 },
  align: { type: String, default: 'right' }, // right | left | center
  title: { type: String, default: '' },
});
const open = ref(false);
let closeTimer = null;

function enter() {
  clearTimeout(closeTimer);
  open.value = true;
}
function leave() {
  clearTimeout(closeTimer);
  closeTimer = setTimeout(() => (open.value = false), 120);
}
</script>

<template>
  <div class="dropdown" @mouseenter="enter" @mouseleave="leave">
    <slot name="trigger" />
    <Transition name="fade">
      <div v-if="open" class="dropdown-panel" :style="{ width: width + 'px' }" :class="align" @click="leave">
        <div v-if="title" class="dropdown-title">{{ title }}</div>
        <slot />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown { position: relative; height: 100%; display: flex; align-items: center; }
.dropdown-panel {
  position: absolute;
  top: calc(100% + 6px);
  background: var(--white);
  border-radius: 10px;
  box-shadow: var(--shadow-panel);
  padding: 12px;
  z-index: 1500;
  cursor: default;
}
.dropdown-panel.right { right: -8px; }
.dropdown-panel.left { left: -8px; }
.dropdown-panel.center { left: 50%; transform: translateX(-50%); }
.dropdown-title {
  font-size: 13px;
  color: var(--text-3);
  padding: 2px 6px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
