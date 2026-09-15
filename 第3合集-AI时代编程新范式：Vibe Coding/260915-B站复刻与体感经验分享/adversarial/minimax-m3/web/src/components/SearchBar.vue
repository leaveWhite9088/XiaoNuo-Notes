<template>
  <div class="search-bar" :class="{ focused }">
    <div class="search-input-wrap">
      <span class="search-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M10 2a8 8 0 1 0 4.906 14.32l4.387 4.387a1 1 0 0 0 1.414-1.414l-4.387-4.387A8 8 0 0 0 10 2zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12z" />
        </svg>
      </span>
      <input
        v-model="query"
        type="text"
        class="search-input"
        :placeholder="placeholder"
        @focus="onFocus"
        @blur="onBlur"
        @keydown.enter="onSubmit"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.esc="closePanel"
      />
      <button v-if="query" class="clear-btn" @click="query = ''; focused = true" type="button" aria-label="清空">×</button>
    </div>
    <!-- 热搜：默认 + 焦点都展示 -->
    <div v-show="focused" class="search-panel" @mousedown.prevent>
      <div v-if="!query" class="panel-section">
        <div class="panel-title">热门搜索</div>
        <ul class="hot-list">
          <li v-for="(h, i) in hotList" :key="h" class="hot-item" @click="useHot(h)">
            <span class="hot-rank" :class="rankClass(i)">{{ i + 1 }}</span>
            <span class="hot-text">{{ h }}</span>
            <span v-if="i < 3" class="hot-flag">热</span>
          </li>
        </ul>
      </div>
      <div v-else class="panel-section">
        <div v-if="suggestions.length" class="panel-title">猜你想搜</div>
        <ul v-if="suggestions.length" class="suggest-list">
          <li v-for="(s, i) in suggestions" :key="s" :class="{ active: i === activeIdx }" @click="useHot(s)">
            <span class="suggest-icon">🔍</span>
            <span class="suggest-text" v-html="highlight(s)"></span>
          </li>
        </ul>
        <div v-else class="empty-tip">暂无相关结果</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { api } from '@/api';

const query = ref('');
const focused = ref(false);
const placeholder = '搜索视频、番剧、UP主…';
const hotList = ref([]);
const suggestions = ref([]);
const activeIdx = ref(-1);
let fetchTimer = null;

const defaultHot = ['黑神话悟空', 'iPhone 17', '原神 5.2', '罗翔刑法', '三体', 'FF7 重生'];

function rankClass(i) {
  if (i === 0) return 'r1';
  if (i === 1) return 'r2';
  if (i === 2) return 'r3';
  return '';
}

function onFocus() {
  focused.value = true;
  if (hotList.value.length === 0) loadHot();
}
function onBlur() {
  setTimeout(() => { focused.value = false; }, 120);
}
function closePanel() {
  focused.value = false;
}
function useHot(v) {
  query.value = v;
  // 简易提交：跳到首页，首页会拉全列表
  window.location.hash = '#/';
  focused.value = false;
}
function onSubmit() {
  if (!query.value.trim()) return;
  useHot(query.value);
}
function move(delta) {
  if (!suggestions.value.length) return;
  activeIdx.value = (activeIdx.value + delta + suggestions.value.length) % suggestions.value.length;
}
function highlight(s) {
  const q = query.value;
  if (!q) return s;
  const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  return s.replace(re, '<em>$1</em>');
}

async function loadHot() {
  try {
    const res = await api.search('');
    hotList.value = (res.hot || defaultHot).slice(0, 8);
  } catch (_) {
    hotList.value = defaultHot;
  }
}

watch(query, (v) => {
  if (fetchTimer) clearTimeout(fetchTimer);
  if (!v) {
    suggestions.value = [];
    return;
  }
  fetchTimer = setTimeout(async () => {
    try {
      const res = await api.search(v);
      suggestions.value = res.suggestions || [];
      activeIdx.value = -1;
    } catch (_) {
      suggestions.value = [];
    }
  }, 220);
});

onMounted(() => {
  loadHot();
});
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.search-bar {
  position: relative;
  width: 100%;
}
.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  height: 40px;
  background: $bili-tag-bg;
  border: 2px solid transparent;
  border-radius: 20px;
  padding: 0 14px;
  transition: all 0.2s;
  .search-bar.focused & {
    background: #fff;
    border-color: $bili-pink;
  }
}
.search-icon {
  display: flex;
  align-items: center;
  color: $bili-text-3;
  margin-right: 8px;
}
.search-input {
  flex: 1;
  height: 100%;
  font-size: 14px;
  color: $bili-text;
  &::placeholder { color: $bili-text-3; }
}
.clear-btn {
  width: 18px;
  height: 18px;
  line-height: 1;
  font-size: 16px;
  color: #fff;
  background: $bili-text-3;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { background: $bili-text-2; }
}
.search-panel {
  position: absolute;
  top: 44px;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  padding: 12px 16px 16px;
  z-index: 20;
  max-height: 480px;
  overflow-y: auto;
}
.panel-title {
  font-size: 12px;
  color: $bili-text-3;
  margin-bottom: 8px;
}
.hot-list { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; }
.hot-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 4px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: $bili-text;
  &:hover { background: $bili-hover; }
}
.hot-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 12px;
  font-weight: 600;
  color: $bili-text-3;
  background: $bili-tag-bg;
  border-radius: 2px;
  &.r1 { color: #fff; background: $bili-rank-red; }
  &.r2 { color: #fff; background: $bili-rank-orange; }
  &.r3 { color: #fff; background: $bili-rank-blue; }
}
.hot-text { flex: 1; }
.hot-flag {
  display: inline-block;
  padding: 0 4px;
  height: 16px;
  line-height: 16px;
  font-size: 10px;
  color: #fff;
  background: $bili-pink;
  border-radius: 2px;
}
.suggest-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  color: $bili-text;
  &.active, &:hover { background: $bili-hover; }
  em { color: $bili-pink; font-style: normal; font-weight: 500; }
}
.suggest-icon { color: $bili-text-3; font-size: 12px; }
.empty-tip {
  padding: 12px 4px;
  color: $bili-text-3;
  font-size: 13px;
  text-align: center;
}
</style>
