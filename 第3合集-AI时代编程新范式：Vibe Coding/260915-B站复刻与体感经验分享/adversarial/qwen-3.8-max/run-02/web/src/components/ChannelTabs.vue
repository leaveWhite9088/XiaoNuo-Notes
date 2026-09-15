<script setup>
defineProps({
  channels: { type: Array, default: () => [] }, // [{name, count}]
  modelValue: { type: String, default: '全部' },
});
defineEmits(['update:modelValue']);
</script>

<template>
  <div class="tabs-bar">
    <div class="container">
      <div class="tabs">
        <button
          class="tab"
          :class="{ active: modelValue === '全部' }"
          @click="$emit('update:modelValue', '全部')"
        >
          全部
        </button>
        <button
          v-for="c in channels"
          :key="c.name"
          class="tab"
          :class="{ active: modelValue === c.name }"
          @click="$emit('update:modelValue', c.name)"
        >
          {{ c.name }}
          <span class="count">{{ c.count }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabs-bar {
  position: sticky;
  top: var(--header-h);
  z-index: 50;
  background: var(--bg);
  padding: 14px 0 6px;
}
.tabs {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
}
.tabs::-webkit-scrollbar {
  display: none;
}
.tab {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 16px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid var(--border);
  font-size: 14px;
  color: var(--text-main);
  transition: all 0.15s;
}
.tab:hover {
  color: var(--bili-pink);
  border-color: var(--bili-pink);
}
.tab.active {
  background: var(--bili-pink);
  border-color: var(--bili-pink);
  color: #fff;
}
.tab.active .count {
  color: rgba(255, 255, 255, 0.8);
}
.count {
  font-size: 11px;
  color: var(--text-light);
}
</style>
