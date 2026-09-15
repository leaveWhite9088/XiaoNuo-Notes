<template>
  <div class="app-root">
    <AppHeader />
    <router-view />
    <AppFooter v-if="route.name !== 'video'" />
    <div class="toast-host">
      <div v-for="t in user.toasts" :key="t.id" class="toast">{{ t.text }}</div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import { useUserStore } from './stores/user'

const route = useRoute()
const user = useUserStore()
</script>
