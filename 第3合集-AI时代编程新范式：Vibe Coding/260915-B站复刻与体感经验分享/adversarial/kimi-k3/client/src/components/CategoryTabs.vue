<template>
  <div class="category-tabs">
    <button
      v-for="tab in tabs"
      :key="tab"
      class="tab"
      :class="{ active: tab === modelValue }"
      @click="$emit('update:modelValue', tab); $emit('change', tab)"
    >
      {{ tab }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '推荐' },
});
defineEmits(['update:modelValue', 'change']);

const tabs = ['推荐', '热门', '番剧', '游戏', '音乐', '舞蹈', '科技', '生活', '鬼畜', '时尚'];
</script>

<style scoped>
.category-tabs {
  display: flex;
  gap: 8px;
  padding: 18px 0 14px;
  overflow-x: auto;
}

.tab {
  padding: 7px 20px;
  border-radius: 18px;
  font-size: 14px;
  color: var(--text-sub);
  background: #fff;
  border: 1px solid var(--border-gray);
  transition: all 0.2s;
  white-space: nowrap;
}

.tab:hover {
  color: var(--bili-pink);
  border-color: var(--bili-pink);
}

.tab.active {
  background: var(--bili-pink);
  border-color: var(--bili-pink);
  color: #fff;
  font-weight: 500;
}
</style>
