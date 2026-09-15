<template>
  <header class="app-header">
    <!-- 顶部主导航：logo + 搜索 + 右侧操作 -->
    <div class="header-row1">
      <div class="container header-inner">
        <router-link to="/" class="logo" aria-label="B 站首页">
          <svg class="logo-svg" viewBox="0 0 160 48" width="160" height="48" aria-hidden="true">
            <defs>
              <linearGradient id="bili-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="#00a1d6" />
                <stop offset="1" stop-color="#fb7299" />
              </linearGradient>
            </defs>
            <text x="0" y="34" font-family="-apple-system, 'PingFang SC', sans-serif" font-size="22" font-weight="700" fill="url(#bili-grad)">
              哔哩哔哩
            </text>
            <text x="105" y="34" font-family="-apple-system, 'PingFang SC', sans-serif" font-size="14" font-weight="500" fill="#9499a0">
              干杯～
            </text>
            <circle cx="124" cy="14" r="3" fill="#fb7299" />
            <circle cx="138" cy="14" r="3" fill="#fb7299" />
          </svg>
        </router-link>

        <div class="search-wrapper">
          <SearchBar />
        </div>

        <div class="header-right">
          <button class="btn btn-ghost" type="button">大会员</button>
          <button class="btn btn-ghost" type="button">投稿</button>
          <button class="btn btn-primary login-btn" type="button">登录</button>
        </div>
      </div>
    </div>

    <!-- 第二行：主导航（首页、动态、频道、…） -->
    <nav class="header-row2">
      <div class="container header-nav">
        <ul class="nav-list">
          <li v-for="item in mainNav" :key="item.path" class="nav-item" :class="{ active: isActive(item.path) }">
            <router-link :to="item.path">{{ item.label }}</router-link>
          </li>
          <li class="nav-divider"></li>
          <li v-for="extra in extras" :key="extra.label" class="nav-item">
            <a href="#" @click.prevent>{{ extra.label }}</a>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import SearchBar from './SearchBar.vue';

const route = useRoute();
const mainNav = [
  { path: '/', label: '首页' },
  { path: '/c/anime', label: '番剧' },
  { path: '/c/guochuang', label: '国创' },
  { path: '/c/music', label: '音乐' },
  { path: '/c/dance', label: '舞蹈' },
  { path: '/c/game', label: '游戏' },
  { path: '/c/knowledge', label: '知识' },
  { path: '/c/tech', label: '科技' },
  { path: '/c/sports', label: '运动' },
  { path: '/c/life', label: '生活' },
  { path: '/c/food', label: '美食' },
];
const extras = [{ label: '动态' }, { label: '频道' }, { label: '直播' }, { label: '会员购' }];

function isActive(path) {
  if (path === '/') return route.path === '/' || route.name === 'video';
  if (path.startsWith('/c/')) return route.path === path;
  return false;
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #fff;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
}
.header-row1 {
  height: $header-height;
  border-bottom: 1px solid $bili-border;
}
.header-inner {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 32px;
}
.logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  .logo-svg {
    display: block;
  }
}
.search-wrapper {
  flex: 1;
  max-width: 600px;
  margin: 0 auto;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.login-btn {
  height: 32px;
  padding: 0 18px;
  border-radius: 18px;
  font-size: 13px;
}

.header-row2 {
  height: $main-nav-height;
  background: #fff;
}
.header-nav {
  height: 100%;
}
.nav-list {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 4px;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}
.nav-item {
  flex-shrink: 0;
  a {
    display: inline-flex;
    align-items: center;
    height: 32px;
    padding: 0 12px;
    font-size: 14px;
    color: $bili-text-2;
    border-radius: 16px;
    transition: all 0.2s;
    &:hover { color: $bili-pink; background: rgba(251, 114, 153, 0.08); }
  }
  &.active a {
    color: $bili-pink;
    background: rgba(251, 114, 153, 0.1);
    font-weight: 500;
  }
}
.nav-divider {
  width: 1px;
  height: 16px;
  background: $bili-border;
  margin: 0 6px;
  flex-shrink: 0;
}
</style>
