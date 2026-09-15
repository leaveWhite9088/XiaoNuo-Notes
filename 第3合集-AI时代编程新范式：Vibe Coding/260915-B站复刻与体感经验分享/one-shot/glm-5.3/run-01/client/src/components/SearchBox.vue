<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { api } from '../api/index.js';
import { useSearchHistoryStore } from '../stores/searchHistory.js';
import BaseIcon from './BaseIcon.vue';

const router = useRouter();
const route = useRoute();
const history = useSearchHistoryStore();

const q = ref(typeof route.query.q === 'string' ? route.query.q : '');
const focused = ref(false);
const suggestList = ref([]);
const hotList = ref([]);
const activeIdx = ref(-1);
const loadingSuggest = ref(false);

let timer = null;

watch(
  () => route.query.q,
  (val) => {
    if (typeof val === 'string' && val !== q.value) q.value = val;
  }
);

watch(q, (val) => {
  clearTimeout(timer);
  const text = val.trim();
  if (!text) {
    suggestList.value = [];
    activeIdx.value = -1;
    return;
  }
  timer = setTimeout(async () => {
    loadingSuggest.value = true;
    try {
      suggestList.value = await api.suggest(text);
    } catch {
      suggestList.value = [];
    } finally {
      loadingSuggest.value = false;
    }
    activeIdx.value = -1;
  }, 160);
});

async function onFocus() {
  focused.value = true;
  if (!hotList.value.length) {
    try {
      hotList.value = await api.hotSearch();
    } catch { /* 忽略 */ }
  }
}

function onBlur() {
  // 延迟失焦，保证面板上的 mousedown/click 先触发
  setTimeout(() => (focused.value = false), 120);
}

function go(keyword) {
  const text = String(keyword ?? q.value).trim();
  if (!text) return;
  history.add(text);
  focused.value = false;
  router.push({ path: '/search', query: { q: text } });
}

function onKeydown(e) {
  const panel = suggestList.value;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    if (!panel.length) return;
    e.preventDefault();
    activeIdx.value = (activeIdx.value + (e.key === 'ArrowDown' ? 1 : -1) + panel.length) % panel.length;
  } else if (e.key === 'Enter') {
    go(activeIdx.value >= 0 ? panel[activeIdx.value].text : q.value);
  } else if (e.key === 'Escape') {
    focused.value = false;
  }
}

function typeOfLabel(type) {
  return { 视频: '视频', 用户: '用户', 标签: '标签', 分区: '分区' }[type] || '视频';
}

onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
  <div class="search-box" @keydown="onKeydown">
    <div class="input-row">
      <input
        v-model="q"
        type="text"
        class="search-input"
        placeholder="search 一下，你就知道了"
        @focus="onFocus"
        @blur="onBlur"
      />
      <button class="search-btn" title="搜索" @mousedown.prevent @click="go()">
        <BaseIcon name="search" :size="18" />
      </button>
    </div>

    <!-- 搜索建议面板：输入时展示联想，空输入展示 历史 + 热搜 -->
    <div v-if="focused" class="suggest-panel fade-in">
      <template v-if="q.trim()">
        <div v-if="loadingSuggest" class="panel-tip">搜索建议加载中...</div>
        <div v-else-if="!suggestList.length" class="panel-tip">没有与“{{ q }}”相关的联想词</div>
        <ul v-else class="suggest-list">
          <li
            v-for="(item, i) in suggestList"
            :key="item.type + item.text"
            class="suggest-item"
            :class="{ active: i === activeIdx }"
            @mousedown.prevent
            @click="go(item.text)"
          >
            <BaseIcon name="search" :size="14" class="suggest-icon" />
            <span class="suggest-text line-clamp-1">{{ item.text }}</span>
            <span class="suggest-type">{{ typeOfLabel(item.type) }}</span>
          </li>
        </ul>
      </template>

      <template v-else>
        <div v-if="history.list.length" class="panel-block">
          <div class="panel-head">
            <span>搜索历史</span>
            <button class="clear-btn" @mousedown.prevent @click="history.clear()">清空</button>
          </div>
          <ul class="history-list">
            <li v-for="h in history.list" :key="h" class="history-item">
              <span class="history-text line-clamp-1" @mousedown.prevent @click="go(h)">{{ h }}</span>
              <button class="history-del" @mousedown.prevent @click="history.remove(h)">✕</button>
            </li>
          </ul>
        </div>
        <div class="panel-block">
          <div class="panel-head">
            <span>bilibili 热搜</span>
          </div>
          <ol class="hot-list">
            <li
              v-for="h in hotList"
              :key="h.rank"
              class="hot-item"
              @mousedown.prevent
              @click="go(h.keyword)"
            >
              <span class="hot-rank" :class="{ top: h.rank <= 3 }">{{ h.rank }}</span>
              <span class="hot-keyword line-clamp-1">{{ h.keyword }}</span>
            </li>
          </ol>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.search-box {
  position: relative;
  width: 400px;
  max-width: 40vw;
}
.input-row {
  display: flex;
  align-items: center;
  background: #f1f2f3;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 0 2px 0 12px;
  transition: all 0.2s;
}
.input-row:focus-within {
  background: #fff;
  border-color: var(--line);
  box-shadow: 0 0 0 2px rgba(35, 174, 219, 0.15);
}
.search-input {
  flex: 1;
  border: none;
  background: transparent;
  height: 36px;
  font-size: 13px;
  color: var(--text-1);
}
.search-input::placeholder {
  color: var(--text-3);
}
.search-btn {
  width: 56px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  color: var(--text-2);
}
.search-btn:hover {
  color: var(--bili-pink);
  background: var(--bili-pink-bg);
}

.suggest-panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: var(--shadow-pop);
  padding: 12px 4px;
  z-index: 1200;
  max-height: 420px;
  overflow: auto;
}
.panel-tip {
  color: var(--text-3);
  text-align: center;
  padding: 14px 0;
  font-size: 13px;
}
.suggest-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 13px;
}
.suggest-item:hover,
.suggest-item.active {
  background: var(--bg-page);
}
.suggest-icon {
  color: var(--text-3);
}
.suggest-text {
  flex: 1;
  color: var(--text-1);
}
.suggest-type {
  color: var(--text-3);
  font-size: 12px;
  background: var(--bg-page);
  border-radius: 4px;
  padding: 1px 6px;
}
.panel-block {
  padding: 0 8px 6px;
}
.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-2);
  font-size: 12px;
  padding: 4px 8px 8px;
}
.clear-btn {
  color: var(--text-3);
  font-size: 12px;
}
.clear-btn:hover {
  color: var(--bili-pink);
}
.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 8px 10px;
}
.history-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-page);
  border-radius: 4px;
  padding: 3px 10px;
  font-size: 12px;
  color: var(--text-2);
  max-width: 100%;
}
.history-text {
  cursor: pointer;
}
.history-text:hover {
  color: var(--bili-pink);
}
.history-del {
  color: var(--text-3);
  font-size: 11px;
}
.history-del:hover {
  color: var(--bili-pink);
}
.hot-list {
  padding: 0 8px;
}
.hot-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.hot-item:hover {
  background: var(--bg-page);
}
.hot-rank {
  width: 16px;
  text-align: center;
  font-size: 13px;
  font-style: italic;
  color: var(--text-3);
}
.hot-rank.top {
  color: var(--bili-pink);
  font-weight: 700;
}
.hot-keyword {
  font-size: 13px;
}
</style>
