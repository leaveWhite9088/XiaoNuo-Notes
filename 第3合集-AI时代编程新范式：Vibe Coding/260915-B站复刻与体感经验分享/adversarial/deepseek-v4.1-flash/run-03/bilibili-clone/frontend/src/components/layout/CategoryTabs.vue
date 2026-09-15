<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Category } from '@/types';

type SortKey = 'default' | 'play' | 'newest' | 'danmaku';

/** 视频流上方的分区筛选 tab + 排序切换（分类筛选交互） */
const props = defineProps<{
  categories: Category[];
  active: string;
  sort: SortKey;
  total?: number;
}>();

const emit = defineEmits<{
  (e: 'update:category', slug: string): void;
  (e: 'update:sort', sort: SortKey): void;
}>();

const expanded = ref(false);
const visibleLimit = computed(() => (expanded.value ? props.categories.length : 12));
const visibleCategories = computed(() => props.categories.slice(0, visibleLimit.value));

const sorts: { key: SortKey; label: string }[] = [
  { key: 'default', label: '综合排序' },
  { key: 'play', label: '最多播放' },
  { key: 'newest', label: '最新发布' },
  { key: 'danmaku', label: '最多弹幕' },
];
</script>

<template>
  <div class="tabs-bar">
    <div class="tabs">
      <button
        v-for="cat in visibleCategories"
        :key="cat.slug"
        class="tabs__item"
        :class="{ 'is-active': active === cat.slug }"
        @click="emit('update:category', cat.slug)"
      >
        {{ cat.name }}
      </button>
      <button v-if="props.categories.length > 12" class="tabs__more" @click="expanded = !expanded">
        {{ expanded ? '收起 ˄' : '更多 ˅' }}
      </button>
    </div>

    <div class="tabs__right">
      <span v-if="total !== undefined" class="tabs__count">{{ total }} 个视频</span>
      <div class="sorts">
        <button
          v-for="s in sorts"
          :key="s.key"
          class="sorts__item"
          :class="{ 'is-active': sort === s.key }"
          @click="emit('update:sort', s.key)"
        >
          {{ s.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabs-bar {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 12px 0 4px;
  flex-wrap: wrap;
}
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
  min-width: 0;
}
.tabs__item {
  padding: 6px 12px;
  border-radius: var(--radius);
  font-size: 14px;
  color: var(--text-2);
  transition: all 0.16s;
  white-space: nowrap;
}
.tabs__item:hover {
  color: var(--bili-pink);
  background: var(--bili-pink-light);
}
.tabs__item.is-active {
  background: var(--bili-pink);
  color: #fff;
}
.tabs__more {
  padding: 6px 10px;
  font-size: 13px;
  color: var(--text-3);
}
.tabs__more:hover {
  color: var(--bili-pink);
}
.tabs__right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: none;
}
.tabs__count {
  font-size: 12px;
  color: var(--text-3);
}
.sorts {
  display: flex;
  gap: 2px;
  background: var(--bg-gray);
  border-radius: var(--radius);
  padding: 2px;
}
.sorts__item {
  padding: 5px 10px;
  font-size: 13px;
  color: var(--text-2);
  border-radius: var(--radius-sm);
  transition: all 0.16s;
}
.sorts__item:hover {
  color: var(--bili-pink);
}
.sorts__item.is-active {
  background: #fff;
  color: var(--bili-pink);
  font-weight: 500;
  box-shadow: var(--shadow-1);
}
</style>
