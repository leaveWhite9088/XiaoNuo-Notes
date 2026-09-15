<script setup>
import AppHeader from './components/AppHeader.vue';
import ToastHost from './components/ToastHost.vue';
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <main class="app-main">
      <!-- keep-alive：从详情返回首页时保留视频流与滚动位置 -->
      <router-view v-slot="{ Component }">
        <keep-alive include="HomeView">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>
    <ToastHost />
  </div>
</template>

<style scoped>
.app-shell { min-height: 100vh; }
.app-main { min-height: calc(100vh - var(--header-h)); }
</style>
