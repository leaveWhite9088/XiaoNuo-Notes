<script setup lang="ts">
import { onMounted } from 'vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppToast from '@/components/common/AppToast.vue';
import SvgSprite from '@/components/common/SvgSprite.vue';
import BackTop from '@/components/common/BackTop.vue';
import { useHomeStore } from '@/stores/home';

const home = useHomeStore();
onMounted(() => {
  // 首屏聚合数据只拉一次（store 内部做了并发去重），供头部与首页共用
  void home.loadOverview().catch(() => undefined);
});
</script>

<template>
  <SvgSprite />
  <AppHeader />
  <AppToast />
  <main class="page-with-header">
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
  <AppFooter />
  <BackTop />
</template>

<style scoped>
.page-with-header {
  min-height: calc(100vh - var(--header-h));
}
</style>
