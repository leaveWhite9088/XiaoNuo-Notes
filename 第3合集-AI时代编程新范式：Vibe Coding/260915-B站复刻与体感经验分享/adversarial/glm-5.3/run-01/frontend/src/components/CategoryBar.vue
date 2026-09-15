<script setup>
/** 首页分类条（分区筛选）：与 URL query.category 双向同步 */
const props = defineProps({
  chips: { type: Array, default: () => [] },
  modelValue: { type: String, default: 'recommend' },
});
const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="category-bar">
    <div class="chips thin-scroll">
      <button
        v-for="c in chips"
        :key="c.key"
        class="chip"
        :class="{ active: modelValue === c.key }"
        @click="emit('update:modelValue', c.key)"
      >
        {{ c.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.category-bar { padding: 14px 0 10px; }
.chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}
.chips::-webkit-scrollbar { display: none; }
.chip {
  flex-shrink: 0;
  border: 1px solid var(--line);
  background: var(--white);
  color: var(--text-1);
  font-size: 14px;
  padding: 7px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}
.chip:hover { color: var(--bili-pink); border-color: var(--bili-pink); }
.chip.active {
  background: linear-gradient(90deg, var(--bili-pink), #ff9db6);
  border-color: transparent;
  color: #fff;
  font-weight: 600;
}
</style>
