<template>
  <div class="filter-bar">
    <div class="filter-bar__row">
      <div class="filter-bar__cats">
        <button
          v-for="cat in visibleCategories"
          :key="cat.slug"
          class="cat-chip"
          :class="{ 'is-active': active === cat.slug }"
          @click="select(cat.slug)"
        >
          {{ cat.name }}
        </button>
        <button class="cat-chip cat-chip--more" @click="expanded = !expanded">
          {{ expanded ? '收起' : '更多' }}
          <SvgIcon :name="expanded ? 'arrowUp' : 'arrowDown'" :size="12" />
        </button>
      </div>

      <div class="filter-bar__sort">
        <button
          v-for="item in sorts"
          :key="item.key"
          class="sort-chip"
          :class="{ 'is-active': sort === item.key }"
          @click="selectSort(item.key)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <transition name="pop">
      <div v-show="expanded" class="filter-panel">
        <div class="filter-panel__row">
          <span class="filter-panel__label">分区</span>
          <div class="filter-panel__options">
            <button
              v-for="cat in categories"
              :key="cat.slug"
              class="option"
              :class="{ 'is-active': active === cat.slug }"
              @click="select(cat.slug)"
            >
              {{ cat.name }}
              <em class="option__count">{{ cat.videoCount }}</em>
            </button>
          </div>
        </div>

        <div class="filter-panel__row">
          <span class="filter-panel__label">时长</span>
          <div class="filter-panel__options">
            <button
              v-for="dur in durations"
              :key="dur.key"
              class="option"
              :class="{ 'is-active': duration === dur.key }"
              @click="duration = dur.key"
            >
              {{ dur.label }}
            </button>
          </div>
        </div>

        <div class="filter-panel__row">
          <span class="filter-panel__label">标签</span>
          <div class="filter-panel__options">
            <button
              v-for="tag in tags"
              :key="tag"
              class="option option--tag"
              :class="{ 'is-active': activeTag === tag }"
              @click="activeTag = activeTag === tag ? '' : tag"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import SvgIcon from '@/components/common/SvgIcon.vue';

/**
 * 信息流筛选条：分区切换 + 排序 +「更多」展开面板（时长/标签）。
 */
const props = defineProps({
  categories: { type: Array, default: () => [] },
  active: { type: String, default: 'all' },
  sort: { type: String, default: 'hot' },
});

const emit = defineEmits(['change']);

const expanded = ref(false);
const duration = ref('all');
const activeTag = ref('');

const sorts = [
  { key: 'hot', label: '综合排序' },
  { key: 'play', label: '最多播放' },
  { key: 'new', label: '最新发布' },
  { key: 'danmaku', label: '最多弹幕' },
];

const durations = [
  { key: 'all', label: '全部' },
  { key: 'short', label: '1分钟以下' },
  { key: 'mid', label: '1-10分钟' },
  { key: 'long', label: '10分钟以上' },
];

const tags = ['原创', '解说', '评测', '教程', '高能', '搞笑', '音乐', '舞蹈', '游戏', '美食'];

const allCategory = { slug: 'all', name: '全部', videoCount: 0 };
const categories = computed(() => [allCategory, ...props.categories]);
const visibleCategories = computed(() => categories.value.slice(0, 11));

function select(slug) {
  emit('change', { category: slug, sort: props.sort, duration: duration.value, tag: activeTag.value });
}

function selectSort(key) {
  emit('change', { category: props.active, sort: key, duration: duration.value, tag: activeTag.value });
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.filter-bar {
  margin-bottom: 18px;
  background: #fff;
  border-radius: $radius-lg;
  padding: 12px 16px;

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  &__cats {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__sort {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: none;
  }
}

.cat-chip {
  height: 30px;
  padding: 0 14px;
  font-size: 14px;
  color: $text-2;
  background: $bg-card;
  border-radius: $radius-md;
  transition: all $transition-fast;

  &:hover {
    color: #fff;
    background: $brand-blue;
  }

  &.is-active {
    color: #fff;
    background: $brand-pink;
    font-weight: 500;
  }

  &--more {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }
}

.sort-chip {
  height: 30px;
  padding: 0 10px;
  font-size: 13px;
  color: $text-3;
  border-radius: $radius-md;
  transition: all $transition-fast;

  &:hover {
    color: $brand-blue;
    background: $bg-card;
  }

  &.is-active {
    color: $brand-blue;
    background: rgba(0, 174, 236, 0.1);
    font-weight: 500;
  }
}

.filter-panel {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed $border-line;

  &__row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 6px 0;
  }

  &__label {
    flex: none;
    width: 44px;
    padding-top: 4px;
    font-size: 13px;
    color: $text-3;
  }

  &__options {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
}

.option {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 12px;
  font-size: 13px;
  color: $text-2;
  border-radius: 20px;
  transition: all $transition-fast;

  &:hover {
    color: $brand-blue;
    background: rgba(0, 174, 236, 0.08);
  }

  &.is-active {
    color: #fff;
    background: $brand-blue;
  }

  &__count {
    font-size: 11px;
    font-style: normal;
    opacity: 0.7;
  }

  &--tag {
    background: $bg-card;
  }
}
</style>
