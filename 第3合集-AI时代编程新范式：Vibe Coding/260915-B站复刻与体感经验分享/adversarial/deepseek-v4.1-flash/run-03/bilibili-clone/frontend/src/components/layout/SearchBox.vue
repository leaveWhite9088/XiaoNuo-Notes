<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Icon from '@/components/common/Icon.vue';
import { useSearchStore } from '@/stores/search';
import { debounce, PLACEHOLDER_COVER } from '@/utils';

/**
 * 搜索框：聚焦展开热搜 / 输入实时请求建议 / 上下键选择 / 回车跳转。
 */
const router = useRouter();
const route = useRoute();
const search = useSearchStore();

const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const keyword = ref('');
const open = ref(false);
const highlight = ref(-1);

const panelVisible = computed(() => open.value);
const suggestions = computed(() => search.suggestions);
const rows = computed(() =>
  search.mode === 'hot'
    ? search.hotSearch.map((k) => ({ type: 'keyword' as const, text: k }))
    : suggestions.value,
);

const debouncedSuggest = debounce((kw: string) => {
  void search.loadSuggest(kw);
}, 200);

watch(keyword, (kw) => {
  highlight.value = -1;
  debouncedSuggest(kw);
});

// 从搜索页返回时同步关键词
watch(
  () => route.query.keyword,
  (kw) => {
    if (typeof kw === 'string' && kw && kw !== keyword.value && route.name === 'search') {
      keyword.value = kw;
    }
  },
  { immediate: true },
);

function onFocus() {
  open.value = true;
  if (!keyword.value) void search.loadSuggest('');
}

function onDocClick(e: MouseEvent) {
  if (!rootRef.value?.contains(e.target as Node)) open.value = false;
}

onMounted(() => document.addEventListener('click', onDocClick));
onUnmounted(() => document.removeEventListener('click', onDocClick));

function submit(kw?: string) {
  const target = (kw ?? keyword.value).trim();
  if (!target) return;
  keyword.value = target;
  open.value = false;
  inputRef.value?.blur();
  void router.push({ name: 'search', query: { keyword: target } });
}

function pick(row: { type: string; text: string; bvid?: string }) {
  if (row.type === 'video' && row.bvid) {
    open.value = false;
    void router.push({ name: 'video', params: { bvid: row.bvid } });
    return;
  }
  submit(row.text);
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    highlight.value = Math.min(highlight.value + 1, rows.value.length - 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    highlight.value = Math.max(highlight.value - 1, -1);
  } else if (e.key === 'Enter') {
    const row = rows.value[highlight.value];
    if (open.value && highlight.value >= 0 && row) pick(row);
    else submit();
  } else if (e.key === 'Escape') {
    open.value = false;
    inputRef.value?.blur();
  }
}

async function clearInput() {
  keyword.value = '';
  highlight.value = -1;
  await nextTick();
  inputRef.value?.focus();
  void search.loadSuggest('');
}
</script>

<template>
  <div ref="rootRef" class="search-box" :class="{ 'is-open': panelVisible }">
    <div class="search-box__input">
      <input
        ref="inputRef"
        v-model="keyword"
        type="text"
        placeholder="搜索"
        autocomplete="off"
        @focus="onFocus"
        @keydown="onKeydown"
      />
      <button v-if="keyword" class="search-box__clear" title="清空" @click="clearInput">
        <Icon name="i-close" :size="16" />
      </button>
      <button class="search-box__btn" title="搜索" @click="submit()">
        <Icon name="i-search" :size="20" />
      </button>
    </div>

    <!-- 下拉面板：热搜榜 / 实时建议 -->
    <div v-show="panelVisible" class="search-panel">
      <div v-if="search.mode === 'hot'" class="search-panel__section">
        <div class="search-panel__title">bilibili 热搜</div>
        <ul class="hot-list">
          <li
            v-for="(k, i) in search.hotSearch"
            :key="k"
            :class="{ 'is-active': highlight === i }"
            @mouseenter="highlight = i"
            @click="pick({ type: 'keyword', text: k })"
          >
            <span class="hot-list__rank" :class="`rank-${i + 1}`">{{ i + 1 }}</span>
            <span class="hot-list__text ellipsis">{{ k }}</span>
            <Icon v-if="i < 3" name="i-fire" :size="14" class="hot-list__fire" />
          </li>
        </ul>
      </div>

      <div v-else class="search-panel__section">
        <div class="search-panel__title">搜索建议</div>
        <ul v-if="suggestions.length" class="suggest-list">
          <li
            v-for="(s, i) in suggestions"
            :key="`${s.type}-${s.text}-${i}`"
            :class="{ 'is-active': highlight === i }"
            @mouseenter="highlight = i"
            @click="pick(s)"
          >
            <img
              v-if="s.type === 'video' && s.cover"
              class="suggest-list__cover"
              :src="s.cover || PLACEHOLDER_COVER"
              alt=""
              @error="($event.target as HTMLImageElement).src = PLACEHOLDER_COVER"
            />
            <Icon :name="s.type === 'up' ? 'i-user' : 'i-search'" :size="16" class="suggest-list__icon" />
            <span class="suggest-list__text ellipsis">{{ s.text }}</span>
            <span v-if="s.playText" class="suggest-list__meta ellipsis">{{ s.playText }}</span>
            <span v-if="s.type === 'up'" class="suggest-list__tag">UP主</span>
          </li>
        </ul>
        <div v-else class="search-panel__empty">没有找到相关建议，按回车直接搜索「{{ keyword }}」</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-box {
  position: relative;
  flex: 1;
  max-width: 500px;
}

.search-box__input {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 8px 0 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg-gray-deep);
  transition: all 0.2s;
}
.search-box__input:focus-within {
  background: #fff;
  border-color: var(--bili-pink);
  box-shadow: 0 0 0 3px rgba(251, 114, 153, 0.12);
}
.search-box__input input {
  flex: 1;
  height: 100%;
  font-size: 14px;
  background: transparent;
  color: var(--text-1);
}
.search-box__input input::placeholder {
  color: var(--text-3);
}
.search-box__clear {
  color: var(--text-3);
  padding: 4px;
  display: flex;
}
.search-box__clear:hover {
  color: var(--text-1);
}
.search-box__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 32px;
  border-radius: var(--radius-sm);
  color: var(--text-2);
  transition: all 0.2s;
}
.search-box__btn:hover {
  color: var(--bili-pink);
  background: rgba(251, 114, 153, 0.1);
}

.search-panel {
  position: absolute;
  top: 46px;
  left: 0;
  right: 0;
  max-height: 460px;
  overflow-y: auto;
  padding: 6px 0 10px;
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-3);
  z-index: 40;
  animation: panel-in 0.16s ease;
}
@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
}
.search-panel__section {
  padding: 0 6px;
}
.search-panel__title {
  padding: 10px 10px 6px;
  font-size: 12px;
  color: var(--text-3);
}
.search-panel__empty {
  padding: 16px 12px 18px;
  color: var(--text-3);
  font-size: 13px;
}

.hot-list li,
.suggest-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 10px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.15s;
}
.hot-list li.is-active,
.suggest-list li.is-active {
  background: var(--bg-gray-deep);
}
.hot-list__rank {
  width: 18px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-3);
  font-style: italic;
}
.hot-list__rank.rank-1 {
  color: #fe2d46;
}
.hot-list__rank.rank-2 {
  color: #ff6600;
}
.hot-list__rank.rank-3 {
  color: #faa90e;
}
.hot-list__text {
  flex: 1;
  font-size: 14px;
}
.hot-list__fire {
  color: #fe2d46;
}
.suggest-list__cover {
  width: 34px;
  height: 22px;
  border-radius: 3px;
  object-fit: cover;
  flex: none;
}
.suggest-list__icon {
  color: var(--text-3);
}
.suggest-list__text {
  flex: 1;
  font-size: 14px;
}
.suggest-list__meta {
  max-width: 90px;
  font-size: 12px;
  color: var(--text-3);
}
.suggest-list__tag {
  font-size: 11px;
  color: var(--bili-pink);
  border: 1px solid var(--bili-pink);
  border-radius: 3px;
  padding: 0 4px;
  line-height: 15px;
}
</style>
