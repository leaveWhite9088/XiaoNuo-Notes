<script setup>
import { toastState } from '../composables/toast';
</script>

<template>
  <TransitionGroup name="toast" tag="div" class="toast-host">
    <div v-for="t in toastState.list" :key="t.id" class="toast-item">{{ t.text }}</div>
  </TransitionGroup>
</template>

<style scoped>
.toast-host {
  position: fixed;
  top: 84px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}
.toast-item {
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  box-shadow: var(--shadow-pop);
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
