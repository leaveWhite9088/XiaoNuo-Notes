<template>
  <div class="app-shell">
    <AppHeader />
    <RouterView v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
    <AppFooter />
    <BackToTop />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import BackToTop from '@/components/common/BackToTop.vue';
import { useSearchStore } from '@/stores/search.js';

const search = useSearchStore();

onMounted(() => {
  // 预热热搜，保证搜索框聚焦时立即有内容
  search.fetchHot();
  search.fetchHistory();
});
</script>

<style lang="scss" scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
