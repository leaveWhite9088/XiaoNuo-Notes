<template>
  <header class="app-header">
    <div class="header-inner container">
      <!-- 左侧 Logo -->
      <router-link to="/" class="logo" title="哔哩哔哩首页">
        <svg class="logo-icon" viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
          <rect x="2" y="7" width="28" height="21" rx="5" fill="#FB7299" />
          <path d="M9 2 L14 8 M23 2 L18 8" stroke="#FB7299" stroke-width="2.6" stroke-linecap="round" />
          <circle cx="11.5" cy="17" r="2.2" fill="#fff" />
          <circle cx="20.5" cy="17" r="2.2" fill="#fff" />
          <path d="M12.5 22 Q16 25 19.5 22" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" />
        </svg>
        <span class="logo-text">哔哩哔哩</span>
      </router-link>

      <!-- 中间搜索框 -->
      <div class="search-wrap" ref="searchWrap">
        <div class="search-box" :class="{ focused: searchFocused }">
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索视频、UP主、番剧"
            @focus="onFocus"
            @input="onInput"
            @keyup.enter="goSearch(keyword)"
          />
          <button class="search-btn" @click="goSearch(keyword)" title="搜索">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
              <path d="M16.5 16.5 L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
        <!-- 搜索建议下拉 -->
        <div v-if="showSuggest && suggestions.length" class="suggest-panel">
          <div
            v-for="(s, i) in suggestions"
            :key="i"
            class="suggest-item"
            @mousedown.prevent="goSearch(s)"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" class="suggest-icon">
              <circle cx="11" cy="11" r="7" fill="none" stroke="#9499a0" stroke-width="2" />
              <path d="M16.5 16.5 L21 21" stroke="#9499a0" stroke-width="2" stroke-linecap="round" />
            </svg>
            <span>{{ s }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧入口 -->
      <nav class="header-right">
        <a class="nav-item" href="javascript:;">大会员</a>
        <a class="nav-item" href="javascript:;" title="消息">
          <svg viewBox="0 0 24 24" width="19" height="19"><path d="M4 6 h16 v11 h-9 l-4 3 v-3 h-3 z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
          <span>消息</span>
        </a>
        <a class="nav-item" href="javascript:;" title="动态">
          <svg viewBox="0 0 24 24" width="19" height="19"><path d="M3 12 q4 -8 9 -8 q5 0 9 8 q-4 8 -9 8 q-5 0 -9 -8 z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>
          <span>动态</span>
        </a>
        <a class="nav-item" href="javascript:;" title="收藏">
          <svg viewBox="0 0 24 24" width="19" height="19"><path d="M12 3 l2.7 5.6 6.1.8 -4.5 4.2 1.1 6 -5.4 -2.9 -5.4 2.9 1.1 -6 -4.5 -4.2 6.1 -.8 z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
          <span>收藏</span>
        </a>
        <a class="nav-item" href="javascript:;" title="历史">
          <svg viewBox="0 0 24 24" width="19" height="19"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7 v5 l3.5 2" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round"/></svg>
          <span>历史</span>
        </a>
        <a class="nav-item" href="javascript:;" title="创作中心">
          <svg viewBox="0 0 24 24" width="19" height="19"><path d="M4 20 l1 -4 L16.5 4.5 a2.1 2.1 0 0 1 3 3 L8 19 z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
          <span>创作中心</span>
        </a>
        <button class="upload-btn" title="投稿">
          <svg viewBox="0 0 24 24" width="15" height="15"><path d="M12 16 V6 M7.5 10.5 L12 6 l4.5 4.5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 18 h16" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>
          投稿
        </button>
        <img class="avatar" src="https://randomuser.me/api/portraits/women/33.jpg" alt="我的头像" title="个人中心" />
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { fetchSuggest } from '../api';

const router = useRouter();
const keyword = ref('');
const suggestions = ref([]);
const showSuggest = ref(false);
const searchFocused = ref(false);
const searchWrap = ref(null);
let timer = null;

function onFocus() {
  searchFocused.value = true;
  if (suggestions.value.length) showSuggest.value = true;
}

function onInput() {
  clearTimeout(timer);
  const q = keyword.value.trim();
  if (!q) {
    suggestions.value = [];
    showSuggest.value = false;
    return;
  }
  // 简单防抖
  timer = setTimeout(async () => {
    try {
      suggestions.value = await fetchSuggest(q);
      showSuggest.value = suggestions.value.length > 0;
    } catch {
      suggestions.value = [];
    }
  }, 200);
}

function goSearch(kw) {
  const q = (kw || '').trim();
  if (!q) return;
  showSuggest.value = false;
  keyword.value = q;
  router.push({ path: '/search', query: { keyword: q } });
}

function onClickOutside(e) {
  if (searchWrap.value && !searchWrap.value.contains(e.target)) {
    showSuggest.value = false;
    searchFocused.value = false;
  }
}

onMounted(() => document.addEventListener('click', onClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside));
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #fff;
  box-shadow: var(--shadow-header);
  z-index: 100;
}

.header-inner {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  color: var(--bili-pink);
  letter-spacing: 1px;
}

.search-wrap {
  position: relative;
  flex: 1;
  max-width: 500px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f1f2f3;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 0 4px 0 14px;
  height: 40px;
  transition: border-color 0.2s, background 0.2s;
}

.search-box:hover {
  border-color: var(--bili-pink);
  background: #fff;
}

.search-box.focused {
  border-color: var(--bili-pink);
  background: #fff;
}

.search-box input {
  flex: 1;
  background: transparent;
  font-size: 14px;
  color: var(--text-main);
  height: 100%;
}

.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 32px;
  border-radius: 6px;
  color: var(--text-sub);
  transition: background 0.2s, color 0.2s;
}

.search-btn:hover {
  background: var(--bili-pink-light);
  color: var(--bili-pink);
}

.suggest-panel {
  position: absolute;
  top: 46px;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid var(--border-gray);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 6px 0;
  z-index: 110;
}

.suggest-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  font-size: 13px;
  color: var(--text-main);
  cursor: pointer;
}

.suggest-item:hover {
  background: var(--bili-pink-light);
  color: var(--bili-pink);
}

.suggest-icon {
  flex-shrink: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  flex-shrink: 0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  font-size: 13px;
  color: var(--text-main);
  border-radius: 6px;
  transition: color 0.2s;
  white-space: nowrap;
}

.nav-item:hover {
  color: var(--bili-pink);
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--bili-pink);
  color: #fff;
  font-size: 14px;
  padding: 8px 18px;
  border-radius: 8px;
  margin: 0 8px;
  transition: background 0.2s;
  white-space: nowrap;
}

.upload-btn:hover {
  background: var(--bili-pink-dark);
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px var(--border-gray);
  transition: transform 0.2s;
}

.avatar:hover {
  transform: scale(1.15);
}

@media (max-width: 1100px) {
  .nav-item span {
    display: none;
  }
}
</style>
