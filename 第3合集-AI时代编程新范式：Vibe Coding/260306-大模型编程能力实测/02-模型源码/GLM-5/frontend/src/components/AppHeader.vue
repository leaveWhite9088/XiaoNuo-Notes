<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'

const router = useRouter()
const userStore = useUserStore()

const searchKeyword = ref('')
const showUserMenu = ref(false)

// 搜索
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ name: 'Search', query: { keyword: searchKeyword.value } })
  }
}

// 跳转到登录页
const goToLogin = () => {
  router.push({ name: 'Login' })
}

// 退出登录
const handleLogout = async () => {
  await userStore.logout()
  showUserMenu.value = false
}

// 跳转到收藏
const goToFavorites = () => {
  router.push({ name: 'Favorites' })
  showUserMenu.value = false
}

// 跳转到历史
const goToHistory = () => {
  router.push({ name: 'History' })
  showUserMenu.value = false
}
</script>

<template>
  <header class="header">
    <div class="header-content">
      <!-- Logo -->
      <router-link to="/" class="logo">
        <svg viewBox="0 0 512 512" width="40" height="40">
          <path
            fill="#FB7299"
            d="M306.73 60.72h-124.5c-71.5 0-129.5 58-129.5 129.5v124.5c0 71.5 58 129.5 129.5 129.5h124.5c71.5 0 129.5-58 129.5-129.5v-124.5c0-71.5-58-129.5-129.5-129.5zm-62.25 306.25c-57.16 0-103.5-46.34-103.5-103.5s46.34-103.5 103.5-103.5 103.5 46.34 103.5 103.5-46.34 103.5-103.5 103.5z"
          />
          <circle fill="#FB7299" cx="244.48" cy="263.47" r="51.75" />
        </svg>
        <span class="logo-text">bilibili</span>
      </router-link>

      <!-- 搜索框 -->
      <div class="search-box">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索视频、UP主"
          @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path
              d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
            />
          </svg>
        </button>
      </div>

      <!-- 用户区域 -->
      <div class="user-area">
        <template v-if="userStore.isLoggedIn && userStore.user">
          <div class="user-info" @click="showUserMenu = !showUserMenu">
            <div class="avatar">
              <img :src="userStore.user.face" :alt="userStore.user.name" />
            </div>
            <span class="username">{{ userStore.user.name }}</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M7 10l5 5 5-5z" />
            </svg>

            <!-- 用户菜单 -->
            <transition name="fade">
              <div v-if="showUserMenu" class="user-menu">
                <div class="menu-item" @click="goToFavorites">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    />
                  </svg>
                  我的收藏
                </div>
                <div class="menu-item" @click="goToHistory">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path
                      d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"
                    />
                  </svg>
                  历史记录
                </div>
                <div class="menu-divider"></div>
                <div class="menu-item logout" @click="handleLogout">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path
                      d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                    />
                  </svg>
                  退出登录
                </div>
              </div>
            </transition>
          </div>
        </template>
        <template v-else>
          <button class="login-btn" @click="goToLogin">登录</button>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  z-index: 1000;
}

.header-content {
  max-width: 1400px;
  height: 100%;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: var(--bili-pink);
}

.search-box {
  flex: 1;
  max-width: 480px;
  display: flex;
  align-items: center;
  background-color: var(--bg-secondary);
  border-radius: 100px;
  overflow: hidden;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 14px;
}

.search-box input:focus {
  outline: none;
}

.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 36px;
  background-color: var(--bili-pink);
  color: var(--text-white);
  border: none;
  border-radius: 0 100px 100px 0;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.search-btn:hover {
  background-color: var(--bili-pink-hover);
}

.user-area {
  flex-shrink: 0;
}

.user-info {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.user-info:hover {
  background-color: var(--bg-hover);
}

.username {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--spacing-xs);
  min-width: 160px;
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 100;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.menu-item:hover {
  background-color: var(--bg-hover);
}

.menu-item.logout {
  color: var(--text-secondary);
}

.menu-item.logout:hover {
  color: var(--bili-pink);
}

.menu-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: var(--spacing-xs) 0;
}

.login-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--bili-pink);
  color: var(--text-white);
  border: none;
  border-radius: var(--border-radius);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.login-btn:hover {
  background-color: var(--bili-pink-hover);
}
</style>
