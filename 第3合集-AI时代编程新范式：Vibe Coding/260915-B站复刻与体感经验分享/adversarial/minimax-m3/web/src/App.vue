<template>
  <div class="app-root">
    <AppHeader />
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
</script>

<style lang="scss" scoped>
.app-root {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background: #f6f7f8;
}
.app-main {
  flex: 1;
  padding-top: 8px;
}
</style>
