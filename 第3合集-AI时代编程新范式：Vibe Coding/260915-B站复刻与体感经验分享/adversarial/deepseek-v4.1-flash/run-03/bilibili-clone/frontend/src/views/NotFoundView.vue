<script setup lang="ts">
import { RouterLink } from 'vue-router';
import Icon from '@/components/common/Icon.vue';

/** 404 页面 */
</script>

<template>
  <div class="nf bili-container">
    <div class="nf__face">(゜-゜)</div>
    <h1 class="nf__title">404 · 页面走丢了</h1>
    <p class="nf__desc">你访问的页面不存在，或者已经被移动到别的次元了。</p>
    <div class="nf__actions">
      <RouterLink to="/" class="btn-primary nf__btn">
        <Icon name="i-left" :size="16" />返回首页
      </RouterLink>
      <RouterLink :to="{ name: 'search', query: { keyword: '鬼畜' } }" class="btn-ghost nf__btn">
        随便看看
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.nf {
  padding: 120px 0;
  text-align: center;
}
.nf__face {
  font-size: 56px;
  color: var(--bili-pink);
  letter-spacing: 2px;
}
.nf__title {
  margin-top: 18px;
  font-size: 24px;
  font-weight: 600;
}
.nf__desc {
  margin-top: 10px;
  font-size: 14px;
  color: var(--text-3);
}
.nf__actions {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-top: 28px;
}
.nf__btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 9px 22px;
  font-size: 14px;
}
</style>
