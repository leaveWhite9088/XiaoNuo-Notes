<script setup>
const props = defineProps({
  categories: { type: Array, default: () => [] },
  modelValue: { type: String, default: 'home' },
});
const emit = defineEmits(['update:modelValue', 'select']);

function select(item) {
  emit('update:modelValue', item.key);
  emit('select', item);
}
</script>

<template>
  <!-- 竖排侧栏（宽屏） -->
  <aside class="category-rail">
    <div
      v-for="cat in categories"
      :key="cat.key"
      class="rail-item"
      :class="{ active: cat.key === modelValue }"
      @click="select(cat)"
    >
      <span class="rail-icon">{{ cat.icon }}</span>
      <span class="rail-label">{{ cat.name }}</span>
    </div>
  </aside>
</template>

<style scoped>
.category-rail {
  position: sticky;
  top: calc(var(--header-h) + 16px);
  align-self: flex-start;
  width: 68px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #fff;
  border-radius: 10px;
  padding: 8px 4px;
  box-shadow: var(--shadow-card);
}
.rail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 9px 0;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-2);
  transition: all 0.15s;
}
.rail-item:hover {
  background: var(--bg-page);
  color: var(--bili-pink);
}
.rail-item.active {
  background: var(--bili-pink-bg);
  color: var(--bili-pink);
  font-weight: 600;
}
.rail-icon {
  font-size: 20px;
  line-height: 1.2;
}
.rail-label {
  font-size: 12px;
}
@media (max-width: 1100px) {
  .category-rail {
    display: none;
  }
}
</style>
