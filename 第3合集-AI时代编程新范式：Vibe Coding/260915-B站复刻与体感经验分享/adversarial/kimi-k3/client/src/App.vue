<template>
  <AppHeader />
  <main class="main-body">
    <router-view />
  </main>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue';
</script>

<style scoped>
.main-body {
  padding-top: 64px;
  min-height: 100vh;
}
</style>
