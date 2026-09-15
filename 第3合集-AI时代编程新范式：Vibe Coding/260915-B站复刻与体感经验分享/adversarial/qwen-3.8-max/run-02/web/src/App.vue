<script setup>
import TheHeader from './components/TheHeader.vue';
import ToastHost from './components/ToastHost.vue';
</script>

<template>
  <div class="app">
    <TheHeader />
    <router-view />
    <ToastHost />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
