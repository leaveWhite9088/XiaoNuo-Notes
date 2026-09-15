<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { api } from '@/api'
import type { NavItem } from '@/api'
import { useUIStore } from '@/stores/ui'
import SearchBox from './SearchBox.vue'

const route = useRoute()
const router = useRouter()
const ui = useUIStore()

const nav = ref<NavItem[]>([])
const userMenuOpen = ref(false)

onMounted(async () => {
  try {
    const r = await api.categories()
    nav.value = r.data.nav
  } catch (e) {
    console.error(e)
  }
})

const isNavActive = (item: NavItem) => {
  if (item.tid === 0) return route.path === '/'
  return route.path === item.path
}

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}
function onLogin() {
  ui.fakeLogin()
  userMenuOpen.value = false
}
function gotoWatchLater() {
  router.push({ name: 'channel', params: { tid: '999' } }).catch(() => {})
  userMenuOpen.value = false
}
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- Logo -->
      <RouterLink to="/" class="logo" aria-label="哔哩哔哩">
        <span class="logo-icon">
          <svg viewBox="0 0 32 32" width="36" height="36">
            <rect x="2" y="6" width="28" height="20" rx="5" fill="#fb7299" />
            <text x="16" y="22" text-anchor="middle" font-size="14" fill="#fff" font-weight="700">TV</text>
            <circle cx="10" cy="16" r="2" fill="#fff" />
            <circle cx="22" cy="16" r="2" fill="#fff" />
          </svg>
        </span>
        <span class="logo-text">哔哩哔哩</span>
      </RouterLink>

      <!-- 主导航 -->
      <nav class="main-nav">
        <RouterLink
          v-for="item in nav"
          :key="item.tid"
          :to="item.path"
          class="nav-link"
          :class="{ active: isNavActive(item) }"
        >
          {{ item.name }}
        </RouterLink>
      </nav>

      <!-- 搜索 -->
      <SearchBox />

      <!-- 用户区 -->
      <div class="user-area">
        <button v-if="!ui.isLogged" class="login-btn" @click="onLogin">登录</button>
        <div v-else class="user-menu" @mouseleave="userMenuOpen = false">
          <button class="avatar" @click="toggleUserMenu">
            <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=demo&backgroundColor=ffd5dc" alt="avatar" />
            <span class="username">{{ ui.username }}</span>
          </button>
          <transition name="dropdown">
            <div v-if="userMenuOpen" class="user-dropdown">
              <button @click="gotoWatchLater">稍后再看</button>
              <button>历史记录</button>
              <button>我的收藏</button>
              <button @click="onLogin">退出登录</button>
            </div>
          </transition>
        </div>
        <button class="upload-btn" title="投稿">投稿</button>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--header-bg);
  border-bottom: 1px solid var(--border-2);
  height: var(--header-h);
}
.header-inner {
  max-width: var(--container-w);
  margin: 0 auto;
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  .logo-icon {
    display: flex;
  }
  .logo-text {
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
    margin-left: 4px;
  }
  &:hover .logo-text {
    color: var(--brand);
  }
}
.main-nav {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  .nav-link {
    padding: 6px 10px;
    font-size: 14px;
    color: var(--text-2);
    border-radius: var(--radius);
    white-space: nowrap;
    transition: color 0.15s, background 0.15s;
    &:hover {
      color: var(--brand);
      background: var(--bg-2);
    }
    &.active {
      color: var(--brand);
      font-weight: 600;
    }
  }
}
.user-area {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  .login-btn {
    height: 32px;
    padding: 0 14px;
    border-radius: 16px;
    background: var(--brand);
    color: #fff;
    font-size: 13px;
    transition: background 0.15s;
    &:hover {
      background: var(--brand-hover);
    }
  }
  .user-menu {
    position: relative;
    .avatar {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px 4px 4px;
      border-radius: 16px;
      transition: background 0.15s;
      img {
        width: 28px;
        height: 28px;
        border-radius: 50%;
      }
      .username {
        font-size: 13px;
        color: var(--text);
      }
      &:hover {
        background: var(--bg-2);
      }
    }
    .user-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      background: #fff;
      border-radius: var(--radius);
      box-shadow: var(--shadow-2);
      padding: 4px 0;
      min-width: 120px;
      z-index: 100;
      button {
        display: block;
        width: 100%;
        text-align: left;
        padding: 8px 16px;
        font-size: 13px;
        color: var(--text);
        &:hover {
          background: var(--bg-2);
          color: var(--brand);
        }
      }
    }
  }
  .upload-btn {
    height: 32px;
    padding: 0 12px;
    border-radius: 16px;
    border: 1px solid var(--brand);
    color: var(--brand);
    font-size: 13px;
    transition: background 0.15s, color 0.15s;
    &:hover {
      background: var(--brand);
      color: #fff;
    }
  }
}
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s, transform 0.15s;
  transform-origin: top right;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
