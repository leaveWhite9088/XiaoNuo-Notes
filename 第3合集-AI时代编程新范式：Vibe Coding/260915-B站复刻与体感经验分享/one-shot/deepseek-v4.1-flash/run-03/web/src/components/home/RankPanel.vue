<template>
  <div class="rank-panel">
    <div class="rank-panel__head">
      <span class="rank-panel__title">
        <SvgIcon name="fire" :size="15" filled />
        {{ title }}
      </span>
      <button class="rank-panel__more" @click="refresh">
        <SvgIcon name="refresh" :size="13" /> 换一换
      </button>
    </div>

    <ul class="rank-panel__list">
      <li
        v-for="item in items"
        :key="item.bvid"
        class="rank-row"
        @click="go(item)"
      >
        <span class="rank-row__no" :class="{ 'is-top': item.rank <= 3 }">{{ item.rank }}</span>
        <span class="rank-row__title">{{ item.title }}</span>
        <span class="rank-row__heat">
          <SvgIcon name="play" :size="12" filled />{{ item.stats?.viewCount }}
        </span>
      </li>
      <li v-if="!items.length" class="rank-empty">暂无排行数据</li>
    </ul>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import SvgIcon from '@/components/common/SvgIcon.vue';

/**
 * 轮播下方的小型排行卡：填满 2x2 网格的剩余高度。
 */
defineProps({
  items: { type: Array, default: () => [] },
  title: { type: String, default: '热门排行' },
});

const emit = defineEmits(['refresh']);
const router = useRouter();

function go(item) {
  router.push({ name: 'video', params: { bvid: item.bvid } });
}

function refresh() {
  emit('refresh');
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.rank-panel {
  margin-top: 12px;
  padding: 12px 14px;
  background: #fff;
  border-radius: $radius-lg;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  &__title {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    font-weight: 600;
    color: $text-1;

    :deep(.svg-icon) {
      color: #ff6b35;
    }
  }

  &__more {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 12px;
    color: $text-3;

    &:hover {
      color: $brand-blue;
    }
  }

  &__list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px 14px;
  }
}

.rank-row {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 26px;
  cursor: pointer;
  font-size: 13px;
  color: $text-2;

  &:hover .rank-row__title {
    color: $brand-blue;
  }

  &__no {
    width: 16px;
    flex: none;
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    font-style: italic;
    color: $text-3;

    &.is-top {
      color: $brand-pink;
    }
  }

  &__title {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__heat {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 12px;
    color: $text-3;
  }
}

.rank-empty {
  grid-column: span 2;
  padding: 10px 0;
  text-align: center;
  font-size: 12px;
  color: $text-3;
}
</style>
