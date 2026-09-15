<script setup lang="ts">
import Icon from '@/components/common/Icon.vue';
import { useUiStore } from '@/stores/ui';

/** 轻提示容器：所有「未接入」入口都会给出可见反馈，避免死按钮 */
const ui = useUiStore();
const iconOf = { info: 'i-message', success: 'i-favorite', error: 'i-close' } as const;
</script>

<template>
  <div class="toast-wrap">
    <TransitionGroup name="toast">
      <div v-for="t in ui.toasts" :key="t.id" class="toast" :class="`toast--${t.type}`">
        <Icon :name="iconOf[t.type]" :size="16" />
        <span>{{ t.message }}</span>
        <button class="toast__close" @click="ui.dismiss(t.id)"><Icon name="i-close" :size="12" /></button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-wrap {
  position: fixed;
  top: 78px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  pointer-events: none;
}
.toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: 20px;
  background: rgba(24, 25, 28, 0.86);
  color: #fff;
  font-size: 13px;
  box-shadow: var(--shadow-2);
  pointer-events: auto;
}
.toast--success {
  background: rgba(0, 174, 236, 0.92);
}
.toast--error {
  background: rgba(254, 45, 70, 0.92);
}
.toast__close {
  display: flex;
  color: rgba(255, 255, 255, 0.75);
}
.toast__close:hover {
  color: #fff;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.24s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
