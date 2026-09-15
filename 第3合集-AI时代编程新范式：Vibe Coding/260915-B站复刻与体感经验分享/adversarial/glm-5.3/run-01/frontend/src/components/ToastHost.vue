<script setup>
import { useToastStore } from '../stores/toast';
const toast = useToastStore();
</script>

<template>
  <div class="toast-host">
    <TransitionGroup name="toast">
      <div v-for="t in toast.toasts" :key="t.id" class="toast" :class="t.type">
        <span class="toast-dot" />{{ t.text }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-host {
  position: fixed;
  top: 84px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}
.toast {
  background: rgba(0, 0, 0, 0.78);
  color: #fff;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--shadow-panel);
}
.toast-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--bili-pink); }
.toast.success .toast-dot { background: #2ac864; }
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
