<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'

const userStore = useUserStore()

onMounted(() => {
  userStore.init()
})
</script>

<template>
  <div class="app">
    <AppHeader />
    <div class="app-body">
      <AppSidebar />
      <main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-body {
  display: flex;
  flex: 1;
  padding-top: 60px;
}

.app-main {
  flex: 1;
  margin-left: 200px;
  padding: var(--spacing-lg);
  min-height: calc(100vh - 60px);
}

@media (max-width: 1024px) {
  .app-main {
    margin-left: 60px;
  }
}
</style>
