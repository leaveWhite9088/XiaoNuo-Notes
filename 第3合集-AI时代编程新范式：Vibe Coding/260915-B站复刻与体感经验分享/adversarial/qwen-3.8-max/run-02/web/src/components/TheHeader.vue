<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../api.js';
import { toast } from '../toast.js';

const route = useRoute();
const router = useRouter();

// ------- 导航菜单（hover 下拉） -------
const NAV_MENUS = [
  { label: '首页', to: '/', children: [] },
  {
    label: '番剧',
    children: ['连载动画', '完结动画', '资讯', '官方延伸'],
  },
  {
    label: '直播',
    children: ['网游', '手游', '单机', '娱乐', '电台', '虚拟主播'],
  },
  {
    label: '游戏中心',
    children: ['新游预告', '热门手游', '热门端游'],
  },
  { label: '会员购', children: ['手办', '会员购', '漫展演出', '卡牌集市'] },
  { label: '漫画', children: ['排行榜', '分类', '最新上架'] },
  { label: '赛事', children: ['LPL', 'KPL', 'CBA', 'PGS'] },
];

// ------- 搜索与搜索建议 -------
const keyword = ref('');
const suggestions = ref([]);
const showSuggest = ref(false);
const activeIdx = ref(-1);
let debounceTimer = null;

async function loadSuggest() {
  try {
    suggestions.value = keyword.value.trim()
      ? await api.suggest(keyword.value.trim())
      : await api.hotSearches();
    showSuggest.value = true;
  } catch {
    suggestions.value = [];
  }
}

function onInput() {
  activeIdx.value = -1;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadSuggest, 200);
}

function onFocus() {
  clearTimeout(debounceTimer);
  loadSuggest();
}

function onBlur() {
  // 延迟关闭，保证下拉项可被点击
  setTimeout(() => (showSuggest.value = false), 150);
}

function doSearch(kw) {
  const q = (kw ?? keyword.value).trim();
  showSuggest.value = false;
  if (!q) return;
  keyword.value = q;
  router.push({ path: '/', query: { keyword: q } });
}

function onKeydown(e) {
  if (!showSuggest.value) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIdx.value = (activeIdx.value + 1) % Math.max(suggestions.value.length, 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIdx.value =
      (activeIdx.value - 1 + suggestions.value.length) % Math.max(suggestions.value.length, 1);
  } else if (e.key === 'Enter') {
    doSearch(activeIdx.value >= 0 ? suggestions.value[activeIdx.value] : keyword.value);
  } else if (e.key === 'Escape') {
    showSuggest.value = false;
  }
}

const goHome = () => router.push('/');

// P2-2 / P3-4：持续跟随路由 keyword，双向串联——
// 深链或刷新 /?keyword=X 时立即回填（immediate）；清空搜索/返回首页时同步清空
watch(
  () => route.query.keyword,
  (kw) => {
    const next = kw ? String(kw) : '';
    if (next !== keyword.value) keyword.value = next;
  },
  { immediate: true }
);

// P3-5：V0 未开放的功能给出明确提示，而非无反馈
const notReady = (name) => toast(`「${name}」V0 暂未开放`);

onBeforeUnmount(() => clearTimeout(debounceTimer));
</script>

<template>
  <header class="header">
    <div class="header-inner">
      <!-- Logo -->
      <div class="logo" @click="goHome" title="返回首页">
        <svg viewBox="0 0 32 32" class="logo-icon" aria-hidden="true">
          <path d="M9.5 1.8a1.2 1.2 0 0 1 1.7.1l5.2 5.6h-.3l5.2-5.6a1.2 1.2 0 0 1 1.8 1.6l-3.8 4.2h4.2a6.5 6.5 0 0 1 6.5 6.5v9.8a6.5 6.5 0 0 1-6.5 6.5H6.5A6.5 6.5 0 0 1 0 23.5v-9.8a6.5 6.5 0 0 1 6.5-6.5h4.2L6.9 3.5a1.2 1.2 0 0 1 .1-1.7zM23 9.9H6.5a4.1 4.1 0 0 0-4.1 4.1v9.5a4.1 4.1 0 0 0 4.1 4.1h19a4.1 4.1 0 0 0 4.1-4.1V14a4.1 4.1 0 0 0-4.1-4.1z" fill="#fb7299"/>
          <rect x="7.4" y="14.6" width="2.4" height="6.2" rx="1.2" fill="#fb7299"/>
          <rect x="18.2" y="14.6" width="2.4" height="6.2" rx="1.2" fill="#fb7299"/>
        </svg>
        <span class="logo-text">bilibili</span>
      </div>

      <!-- 导航菜单 -->
      <nav class="nav">
        <div v-for="menu in NAV_MENUS" :key="menu.label" class="nav-item"
             :class="{ active: menu.to && $route.path === menu.to }">
          <component :is="menu.to ? 'router-link' : 'span'" :to="menu.to" class="nav-label">
            {{ menu.label }}
          </component>
          <!-- hover 下拉菜单 -->
          <div v-if="menu.children.length" class="dropdown">
            <a v-for="c in menu.children" :key="c" class="dropdown-item" href="javascript:;"
               @click="doSearch(c)">{{ c }}</a>
          </div>
        </div>
      </nav>

      <div class="spacer"></div>

      <!-- 搜索框 + 搜索建议 -->
      <div class="search-wrap">
        <div class="search-box">
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索视频、UP主"
            maxlength="60"
            @input="onInput"
            @focus="onFocus"
            @blur="onBlur"
            @keydown="onKeydown"
          />
          <button class="search-btn" title="搜索" @click="doSearch()">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M10.5 3a7.5 7.5 0 0 1 5.9 12.1l4.7 4.8-1.6 1.5-4.7-4.7A7.5 7.5 0 1 1 10.5 3zm0 2.2a5.3 5.3 0 1 0 0 10.6 5.3 5.3 0 0 0 0-10.6z" fill="currentColor"/></svg>
          </button>
        </div>
        <!-- 建议下拉 -->
        <transition name="fade">
          <div v-if="showSuggest && suggestions.length" class="suggest-panel">
            <div class="suggest-head">{{ keyword.trim() ? '搜索建议' : '大家都在搜' }}</div>
            <ul>
              <li
                v-for="(s, i) in suggestions"
                :key="s"
                class="suggest-item"
                :class="{ active: i === activeIdx }"
                @mousedown.prevent="doSearch(s)"
                @mouseenter="activeIdx = i"
              >
                <span class="suggest-idx">{{ i + 1 }}</span>
                <span class="suggest-text">{{ s }}</span>
              </li>
            </ul>
          </div>
        </transition>
      </div>

      <!-- 右侧操作（V0 未开放：点击给出明确提示） -->
      <div class="actions">
        <button class="upload-btn" @click="notReady('投稿')">
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 3l4 4h-3v7h-2V7H8l4-4zm-7 15h14v2H5v-2z" fill="currentColor"/></svg>
          投稿
        </button>
        <div class="avatar" title="V0 未开放登录" @click="notReady('登录')">
          <svg viewBox="0 0 32 32" width="34" height="34">
            <circle cx="16" cy="16" r="16" fill="#fb7299"/>
            <circle cx="16" cy="13" r="5.5" fill="#fff"/>
            <path d="M5 27a11 11 0 0 1 22 0z" fill="#fff"/>
          </svg>
        </div>
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
  height: var(--header-h);
  background: #fff;
  border-bottom: 1px solid var(--border);
  z-index: 100;
}

.header-inner {
  max-width: 1600px;
  margin: 0 auto;
  height: 100%;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  flex-shrink: 0;
  margin-right: 12px;
}
.logo-icon {
  width: 34px;
  height: 34px;
}
.logo-text {
  font-size: 22px;
  font-weight: 700;
  color: var(--bili-pink);
  letter-spacing: -0.5px;
}

/* 导航菜单 */
.nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.nav-item {
  position: relative;
  padding: 0 10px;
  height: var(--header-h);
  display: flex;
  align-items: center;
}
.nav-label {
  font-size: 15px;
  color: var(--text-main);
  cursor: pointer;
  line-height: var(--header-h);
}
.nav-item .nav-label:hover {
  color: var(--bili-pink);
}
.nav-item.active .nav-label {
  color: var(--bili-pink);
  font-weight: 600;
}

/* 下拉菜单 */
.dropdown {
  position: absolute;
  top: calc(var(--header-h) - 6px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  min-width: 130px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
  padding: 8px 0;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s;
  z-index: 200;
}
.nav-item:hover .dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}
.dropdown-item {
  display: block;
  padding: 8px 18px;
  font-size: 13px;
  color: var(--text-main);
  white-space: nowrap;
}
.dropdown-item:hover {
  background: #f6f7f8;
  color: var(--bili-pink);
}

.spacer {
  flex: 1;
}

/* 搜索框 */
.search-wrap {
  position: relative;
  width: 300px;
  flex-shrink: 0;
}
.search-box {
  display: flex;
  align-items: center;
  height: 38px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #f1f2f3;
  overflow: hidden;
  transition: border-color 0.2s, background 0.2s;
}
.search-box:focus-within {
  border-color: var(--bili-pink);
  background: #fff;
}
.search-box input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 0 12px;
  font-size: 14px;
  color: var(--text-main);
  height: 100%;
}
.search-btn {
  width: 46px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-sub);
  border-left: 1px solid var(--border);
  transition: color 0.15s, background 0.15s;
}
.search-btn:hover {
  color: #fff;
  background: var(--bili-pink);
}

/* 搜索建议下拉 */
.suggest-panel {
  position: absolute;
  top: 44px;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
  padding: 6px 0 8px;
  z-index: 300;
}
.suggest-head {
  padding: 6px 14px;
  font-size: 12px;
  color: var(--text-light);
}
.suggest-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  cursor: pointer;
}
.suggest-item:hover,
.suggest-item.active {
  background: #f6f7f8;
}
.suggest-idx {
  width: 14px;
  text-align: center;
  font-size: 12px;
  color: var(--text-light);
}
.suggest-item:nth-child(-n + 3) .suggest-idx {
  color: var(--bili-pink);
  font-weight: 700;
}
.suggest-text {
  flex: 1;
  font-size: 13px;
  color: var(--text-main);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 右侧操作 */
.actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-left: 16px;
  flex-shrink: 0;
}
.upload-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-sub);
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 6px;
}
.upload-btn:hover {
  color: var(--bili-pink);
  background: #fff0f5;
}
.avatar {
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

@media (max-width: 1100px) {
  .nav-item:not(:first-child):not(:nth-child(2)):not(:nth-child(3)) {
    display: none;
  }
  .search-wrap {
    width: 200px;
  }
}
</style>
