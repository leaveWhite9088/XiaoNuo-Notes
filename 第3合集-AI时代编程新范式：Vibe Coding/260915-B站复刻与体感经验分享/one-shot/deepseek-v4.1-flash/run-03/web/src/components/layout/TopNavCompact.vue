<template>
  <ul class="top-nav-compact">
    <li v-for="item in items" :key="item.label" class="top-nav-compact__item">
      <RouterLink class="top-nav-compact__link" :to="item.to">{{ item.label }}</RouterLink>
    </li>
  </ul>
</template>

<script setup>
/**
 * 吸顶态导航：只保留核心频道入口，避免与 banner 态重复占用空间。
 */
const items = [
  { label: '首页', to: '/' },
  { label: '番剧', to: '/category/anime' },
  { label: '电影', to: '/category/movie' },
  { label: '国创', to: '/category/guochuang' },
  { label: '电视剧', to: '/category/tv' },
  { label: '综艺', to: '/category/variety' },
  { label: '纪录片', to: '/category/documentary' },
  { label: '动画', to: '/category/douga' },
  { label: '游戏', to: '/category/game' },
];
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.top-nav-compact {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: 24px;

  &__link {
    display: block;
    padding: 6px 10px;
    border-radius: $radius-md;
    font-size: 14px;
    color: $text-1;
    white-space: nowrap;
    transition: all $transition-fast;

    &:hover {
      color: $brand-pink;
      background: $bg-card;
    }

    &.router-link-active {
      color: $brand-pink;
      font-weight: 500;
    }
  }
}
</style>
