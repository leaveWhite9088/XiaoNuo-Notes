<template>
  <div class="search-box" :class="{ 'is-expanded': expanded }">
    <form class="search-box__bar" @submit.prevent="submit()">
      <input
        ref="inputRef"
        v-model="keyword"
        class="search-box__input"
        type="text"
        placeholder="搜索视频、番剧、UP主或AV号"
        autocomplete="off"
        @focus="onFocus"
        @blur="onBlur"
        @input="onInput"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.enter.prevent="submit(activeIndex >= 0 ? suggestions[activeIndex]?.keyword : undefined)"
        @keydown.esc="close"
      />
      <button class="search-box__btn" type="submit" aria-label="搜索">
        <SvgIcon name="search" :size="18" />
      </button>
    </form>

    <!-- 搜索建议面板：热搜 / 联想词 -->
    <transition name="pop">
      <div v-show="open" class="suggest-panel">
        <div class="suggest-panel__head">
          <span>{{ keyword.trim() ? '搜索建议' : '哔哩哔哩热搜' }}</span>
          <span v-if="!keyword.trim()" class="suggest-panel__refresh" @mousedown.prevent="reloadHot">
            <SvgIcon name="refresh" :size="13" /> 换一换
          </span>
        </div>

        <ul class="suggest-panel__list">
          <li
            v-for="(item, index) in suggestions"
            :key="item.keyword + index"
            class="suggest-item"
            :class="{ 'is-active': index === activeIndex }"
            @mousedown.prevent="submit(item.keyword)"
            @mouseenter="activeIndex = index"
          >
            <span class="suggest-item__rank" :class="{ 'is-top': !keyword.trim() && index < 3 }">
              <template v-if="!keyword.trim()">{{ index + 1 }}</template>
              <SvgIcon v-else name="search" :size="14" />
            </span>
            <span class="suggest-item__text" v-html="highlight(item.keyword)" />
            <span v-if="item.tag" class="suggest-item__tag">{{ item.tag }}</span>
          </li>
          <li v-if="!suggestions.length" class="suggest-empty">
            {{ suggesting ? '正在联想...' : '没有找到相关建议，直接回车搜索吧' }}
          </li>
        </ul>

        <div v-if="history.length" class="suggest-panel__history">
          <div class="suggest-panel__head">
            <span>搜索历史</span>
            <button class="suggest-panel__clear" @mousedown.prevent="clearHistory">清空</button>
          </div>
          <div class="history-tags">
            <RouterLink
              v-for="word in history"
              :key="word"
              class="history-tag"
              :to="{ name: 'search', query: { keyword: word } }"
              @mousedown.prevent="submit(word)"
            >
              {{ word }}
            </RouterLink>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SvgIcon from '@/components/common/SvgIcon.vue';
import { useSearchStore } from '@/stores/search.js';

/**
 * 搜索框：聚焦展开热搜、输入实时联想（防抖 180ms）、键盘上下选择、回车跳转结果页。
 */
const router = useRouter();
const route = useRoute();
const store = useSearchStore();

const keyword = ref(route.query.keyword ? String(route.query.keyword) : '');
const open = ref(false);
const activeIndex = ref(-1);
const expanded = ref(false);
const inputRef = ref(null);
let timer = null;

const suggestions = computed(() => {
  // 未输入时展示热搜榜；有输入时展示联想结果
  if (!keyword.value.trim()) {
    return store.hotSearches;
  }
  return store.suggestions;
});
const history = computed(() => store.history);

watch(
  () => route.query.keyword,
  (val) => {
    keyword.value = val ? String(val) : '';
  },
);

function onFocus() {
  open.value = true;
  expanded.value = true;
  store.fetchHot();
  store.fetchHistory();
  if (keyword.value.trim()) store.suggest(keyword.value);
}

function onBlur() {
  // 延迟关闭，保证 mousedown 选择生效
  setTimeout(() => {
    open.value = false;
    activeIndex.value = -1;
  }, 140);
  expanded.value = false;
}

function onInput() {
  expanded.value = true;
  clearTimeout(timer);
  timer = setTimeout(() => store.suggest(keyword.value), 180);
}

function move(step) {
  const len = suggestions.value.length;
  if (!len) return;
  open.value = true;
  activeIndex.value = (activeIndex.value + step + len) % len;
}

function submit(word) {
  const target = (word ?? keyword.value).trim();
  if (!target) return;
  keyword.value = target;
  open.value = false;
  store.search(target);
  router.push({ name: 'search', query: { keyword: target } });
}

function close() {
  open.value = false;
  inputRef.value?.blur();
}

async function reloadHot() {
  store.hotSearches = [];
  await store.fetchHot();
  store.suggest('');
}

async function clearHistory() {
  await store.clearHistory();
}

function highlight(text) {
  const kw = keyword.value.trim();
  if (!kw) return escapeHtml(text);
  return escapeHtml(text).replace(
    new RegExp(escapeRegExp(escapeHtml(kw)), 'gi'),
    (m) => `<em class="hl">${m}</em>`,
  );
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.search-box {
  position: relative;
  width: 500px;
  max-width: 100%;

  &__bar {
    display: flex;
    align-items: center;
    height: 40px;
    padding: 0 4px 0 14px;
    background: $bg-body;
    border-radius: $radius-lg;
    border: 1px solid transparent;
    transition: all $transition-fast;
  }

  &.is-expanded &__bar {
    background: #fff;
    border-color: $brand-blue;
  }

  &__input {
    flex: 1;
    height: 100%;
    font-size: 14px;
    color: $text-1;

    &::placeholder {
      color: $text-3;
    }
  }

  &__btn {
    width: 36px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $radius-md;
    color: $text-2;
    transition: all $transition-fast;

    &:hover {
      background: $brand-blue;
      color: #fff;
    }
  }
}

.suggest-panel {
  position: absolute;
  top: 46px;
  left: 0;
  right: 0;
  z-index: $z-popover;
  padding: 8px 0 10px;
  background: #fff;
  border-radius: $radius-lg;
  box-shadow: $shadow-pop;
  border: 1px solid rgba(0, 0, 0, 0.04);
  max-height: 460px;
  overflow-y: auto;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 14px;
    font-size: 12px;
    color: $text-3;
  }

  &__refresh {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    cursor: pointer;

    &:hover {
      color: $brand-blue;
    }
  }

  &__clear {
    font-size: 12px;
    color: $text-3;

    &:hover {
      color: $brand-blue;
    }
  }

  &__list {
    padding: 0 4px;
  }

  &__history {
    border-top: 1px solid $border-line;
    margin-top: 6px;
    padding-top: 4px;
  }
}

.suggest-item {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 36px;
  padding: 0 10px;
  border-radius: $radius-md;
  cursor: pointer;
  font-size: 14px;
  color: $text-1;

  &.is-active {
    background: $bg-card;
  }

  &__rank {
    width: 18px;
    text-align: center;
    font-size: 13px;
    font-weight: 600;
    color: $text-3;
    font-style: italic;

    &.is-top {
      color: $brand-pink;
    }
  }

  &__text {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__tag {
    flex: none;
    padding: 1px 6px;
    font-size: 11px;
    color: $brand-pink;
    background: rgba(251, 114, 153, 0.12);
    border-radius: $radius-sm;
  }
}

:deep(.hl) {
  font-style: normal;
  color: $brand-pink;
}

.suggest-empty {
  padding: 14px;
  text-align: center;
  color: $text-3;
  font-size: 13px;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 14px 8px;
}

.history-tag {
  padding: 3px 10px;
  font-size: 12px;
  color: $text-2;
  background: $bg-card;
  border-radius: 20px;
  transition: all $transition-fast;

  &:hover {
    color: #fff;
    background: $brand-blue;
  }
}
</style>
