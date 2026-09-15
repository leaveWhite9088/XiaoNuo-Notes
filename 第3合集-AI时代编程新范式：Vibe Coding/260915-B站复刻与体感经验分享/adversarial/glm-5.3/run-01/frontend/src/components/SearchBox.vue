<script setup>
/** B 站风格搜索框：聚焦/输入展示建议下拉（热搜榜、标题/UP主匹配、本地搜索历史），支持键盘上下选择 */
import { computed, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import BIcon from './BIcon.vue';
import { api } from '../api';
import { useUserStore } from '../stores/user';
import { useToastStore } from '../stores/toast';
import { formatCount } from '../utils/format';

const router = useRouter();
const user = useUserStore();
const toast = useToastStore();

const q = ref('');
const open = ref(false);
const trend = ref([]); // 空输入时的热搜
const matches = ref([]); // 输入时的联想
const activeIndex = ref(-1);
const inputEl = ref(null);

let debounceTimer = null;
watch(q, (v) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => loadSuggest(v), 150);
  activeIndex.value = -1;
});

// 序号守卫：慢的旧响应晚到时直接丢弃，防止联想列表回跳到上一个词
let suggestSeq = 0;
async function loadSuggest(value) {
  const seq = ++suggestSeq;
  try {
    const res = await api.suggest(value.trim());
    if (seq !== suggestSeq) return;
    if (value.trim() === '') trend.value = res.list;
    else matches.value = res.list;
  } catch {
    /* 建议失败不打断输入 */
  }
}
loadSuggest('');

/** 下拉全量行（用于键盘导航与展示）：有关键词 → 匹配 + 历史；无关键词 → 热搜 + 历史 */
const rows = computed(() => {
  const historyRows = user.searchHistory.map((text) => ({ text, type: 'history' }));
  return q.value.trim()
    ? [...matches.value, ...historyRows]
    : [...trend.value, ...historyRows];
});

function highlight(text) {
  const kw = q.value.trim();
  if (!kw) return [{ text, hit: false }];
  const idx = text.toLowerCase().indexOf(kw.toLowerCase());
  if (idx < 0) return [{ text, hit: false }];
  return [
    { text: text.slice(0, idx), hit: false },
    { text: text.slice(idx, idx + kw.length), hit: true },
    { text: text.slice(idx + kw.length), hit: false },
  ].filter((s) => s.text);
}

function focus() {
  open.value = true;
  loadSuggest(q.value.trim());
}
function blur() {
  setTimeout(() => (open.value = false), 150);
}
function go(text) {
  const kw = (text ?? q.value).trim();
  if (!kw) {
    toast.show('请输入搜索内容');
    return;
  }
  user.pushSearch(kw);
  open.value = false;
  inputEl.value?.blur();
  router.push({ name: 'search', query: { q: kw } });
}
function keydown(e) {
  if (!open.value || rows.value.length === 0) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const delta = e.key === 'ArrowDown' ? 1 : -1;
    activeIndex.value = (activeIndex.value + delta + rows.value.length) % rows.value.length;
  } else if (e.key === 'Enter') {
    go(activeIndex.value >= 0 ? rows.value[activeIndex.value].text : q.value);
  } else if (e.key === 'Escape') {
    open.value = false;
  }
}
function removeHistory(text, e) {
  e.stopPropagation();
  user.removeSearch(text);
}
async function nextTickFocus() {
  await nextTick();
  inputEl.value?.focus();
}
defineExpose({ focus: nextTickFocus });
</script>

<template>
  <div class="search-box">
    <div class="input-wrap" :class="{ focused: open }">
      <input
        ref="inputEl"
        v-model="q"
        type="text"
        placeholder="搜索视频、UP 主或分区"
        @focus="focus"
        @blur="blur"
        @keydown="keydown"
      />
      <button class="search-btn" aria-label="搜索" @mousedown.prevent="go()">
        <BIcon name="search" :size="17" />
      </button>
    </div>

    <Transition name="fade">
      <div v-if="open" class="suggest-panel">
        <template v-if="!q.trim() && trend.length">
          <div class="suggest-header"> bilibili 热搜 <span class="hot-badge"><BIcon name="rank-hot" :size="12" />实时</span></div>
          <div
            v-for="(row, i) in trend"
            :key="'t' + i"
            class="suggest-row"
            :class="{ active: i === activeIndex }"
            @mousedown.prevent="go(row.text)"
            @mouseenter="activeIndex = i"
          >
            <span class="rank" :class="{ top: i < 3 }">{{ i + 1 }}</span>
            <span class="row-text">
              <template v-for="(seg, j) in highlight(row.text)" :key="j">
                <em v-if="seg.hit">{{ seg.text }}</em><template v-else>{{ seg.text }}</template>
              </template>
            </span>
            <span class="heat">{{ formatCount(row.heat) }}热度</span>
          </div>
        </template>

        <template v-if="q.trim() && matches.length">
          <div class="suggest-header">猜你想搜</div>
          <div
            v-for="(row, i) in matches"
            :key="'m' + i"
            class="suggest-row"
            :class="{ active: i === activeIndex }"
            @mousedown.prevent="go(row.text)"
            @mouseenter="activeIndex = i"
          >
            <BIcon name="search" :size="14" class="row-icon" />
            <span class="row-text">
              <template v-for="(seg, j) in highlight(row.text)" :key="j">
                <em v-if="seg.hit">{{ seg.text }}</em><template v-else>{{ seg.text }}</template>
              </template>
            </span>
          </div>
        </template>

        <template v-if="user.searchHistory.length">
          <div class="suggest-header">搜索历史</div>
          <div
            v-for="(h, i) in user.searchHistory"
            :key="'h' + h"
            class="suggest-row history"
            :class="{ active: (q.trim() ? matches.length : trend.length) + i === activeIndex }"
            @mousedown.prevent="go(h)"
          >
            <BIcon name="history" :size="14" class="row-icon" />
            <span class="row-text">{{ h }}</span>
            <button class="del" aria-label="删除该历史" @mousedown.prevent.stop="removeHistory(h, $event)">
              <BIcon name="close" :size="12" />
            </button>
          </div>
        </template>

        <div v-if="!rows.length" class="suggest-empty">暂无相关建议</div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.search-box { position: relative; width: 100%; max-width: 500px; }
.input-wrap {
  display: flex;
  align-items: center;
  background: var(--bg-1);
  border: 1px solid transparent;
  border-radius: 8px;
  height: 40px;
  transition: all 0.2s;
}
.input-wrap.focused, .input-wrap:focus-within {
  background: var(--white);
  border-color: var(--text-3);
}
input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 0 4px 0 12px;
  font-size: 13.5px;
  color: var(--text-1);
  min-width: 0;
}
input::placeholder { color: var(--text-3); }
.search-btn {
  width: 52px;
  height: 100%;
  border: none;
  background: transparent;
  color: var(--text-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 8px 8px 0;
  transition: all 0.2s;
}
.search-btn:hover { color: var(--bili-pink); }

.suggest-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--white);
  border-radius: 10px;
  box-shadow: var(--shadow-panel);
  padding: 8px 0;
  z-index: 1600;
  max-height: 420px;
  overflow-y: auto;
}
.suggest-header {
  font-size: 12px;
  color: var(--text-3);
  padding: 8px 16px 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.hot-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: var(--bili-pink-light);
  color: var(--bili-pink);
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 3px;
}
.suggest-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  font-size: 13.5px;
  color: var(--text-1);
  cursor: pointer;
}
.suggest-row:hover, .suggest-row.active { background: var(--bg-2); }
.rank {
  width: 16px;
  font-size: 13px;
  color: var(--text-3);
  font-style: italic;
  text-align: center;
  flex-shrink: 0;
}
.rank.top { color: var(--bili-pink); font-weight: 600; }
.row-icon { color: var(--text-3); flex-shrink: 0; }
.row-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row-text em { color: var(--bili-pink); font-style: normal; }
.heat { font-size: 11px; color: var(--text-3); flex-shrink: 0; }
.del {
  border: none;
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  display: flex;
}
.del:hover { color: var(--bili-pink); background: var(--bg-1); }
.suggest-empty { padding: 20px; text-align: center; color: var(--text-3); font-size: 13px; }
</style>
