<template>
  <div class="category-tabs">
    <div class="container tabs-inner">
      <ul class="tabs-list">
        <li
          v-for="cat in categories"
          :key="cat.tid"
          class="tab-item"
          :class="{ active: modelValue === cat.tid }"
          @click="$emit('update:modelValue', cat.tid)"
        >
          <span class="tab-icon" aria-hidden="true">{{ cat.icon }}</span>
          <span class="tab-name">{{ cat.name }}</span>
        </li>
      </ul>
      <div class="sort-box">
        <span class="sort-label">排序：</span>
        <button
          v-for="opt in sortOptions"
          :key="opt.value"
          class="sort-btn"
          :class="{ active: sort === opt.value }"
          @click="$emit('update:sort', opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  categories: { type: Array, default: () => [] },
  modelValue: { type: String, default: 'all' },
  sort: { type: String, default: 'default' },
});
defineEmits(['update:modelValue', 'update:sort']);
const sortOptions = [
  { value: 'default', label: '综合' },
  { value: 'play', label: '播放多' },
  { value: 'danmaku', label: '弹幕多' },
  { value: 'new', label: '最新' },
];
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.category-tabs {
  background: #fff;
  border-bottom: 1px solid $bili-border;
}
.tabs-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $category-height;
  gap: 16px;
}
.tabs-list {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}
.tab-item {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 14px;
  border-radius: 16px;
  font-size: 14px;
  color: $bili-text-2;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  &:hover { color: $bili-pink; background: rgba(251, 114, 153, 0.08); }
  &.active {
    color: #fff;
    background: $bili-pink;
    .tab-icon { filter: brightness(2); }
  }
}
.tab-icon { margin-right: 4px; font-size: 14px; }
.sort-box {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  .sort-label { color: $bili-text-3; font-size: 12px; margin-right: 2px; }
}
.sort-btn {
  height: 26px;
  padding: 0 10px;
  font-size: 12px;
  color: $bili-text-2;
  border-radius: 4px;
  &:hover { color: $bili-pink; }
  &.active {
    color: $bili-pink;
    background: rgba(251, 114, 153, 0.1);
    font-weight: 500;
  }
}
</style>
