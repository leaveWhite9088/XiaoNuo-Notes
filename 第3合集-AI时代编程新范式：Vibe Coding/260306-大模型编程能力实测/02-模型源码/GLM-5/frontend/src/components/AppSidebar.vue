<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const menuItems = [
  { path: '/', name: '首页', icon: 'home' },
  { path: '/favorites', name: '我的收藏', icon: 'favorite', requireLogin: true },
  { path: '/history', name: '历史记录', icon: 'history', requireLogin: true }
]

const isActive = (path: string) => {
  return route.path === path
}

const handleNavigate = (item: typeof menuItems[0]) => {
  if (item.requireLogin && !userStore.isLoggedIn) {
    router.push({ name: 'Login' })
    return
  }
  router.push(item.path)
}
</script>

<template>
  <aside class="sidebar">
    <nav class="nav-menu">
      <div
        v-for="item in menuItems"
        :key="item.path"
        :class="['nav-item', { active: isActive(item.path), disabled: item.requireLogin && !userStore.isLoggedIn }]"
        @click="handleNavigate(item)"
      >
        <!-- 首页图标 -->
        <svg v-if="item.icon === 'home'" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
        <!-- 收藏图标 -->
        <svg v-if="item.icon === 'favorite'" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <!-- 历史图标 -->
        <svg v-if="item.icon === 'history'" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
        </svg>
        <span>{{ item.name }}</span>
      </div>
    </nav>

    <!-- 登录提示 -->
    <div v-if="!userStore.isLoggedIn" class="login-tip">
      <p>登录后可使用更多功能</p>
      <button class="btn btn-primary" @click="router.push({ name: 'Login' })">
        立即登录
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 60px;
  bottom: 0;
  width: 200px;
  background-color: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.nav-menu {
  flex: 1;
  padding: var(--spacing-md);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-bottom: var(--spacing-xs);
}

.nav-item:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background-color: var(--bili-pink-light);
  color: var(--bili-pink);
}

.nav-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-tip {
  padding: var(--spacing-md);
  margin: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
  text-align: center;
}

.login-tip p {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-sm);
}

@media (max-width: 1024px) {
  .sidebar {
    width: 60px;
  }

  .nav-item span {
    display: none;
  }

  .nav-item {
    justify-content: center;
    padding: var(--spacing-sm);
  }

  .login-tip {
    display: none;
  }
}
</style>
