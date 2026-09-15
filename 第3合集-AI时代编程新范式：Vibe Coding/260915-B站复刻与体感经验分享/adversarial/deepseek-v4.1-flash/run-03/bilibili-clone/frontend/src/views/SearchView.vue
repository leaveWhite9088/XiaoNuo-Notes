<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Icon from '@/components/common/Icon.vue';
import RankSidebar from '@/components/layout/RankSidebar.vue';
import VideoGrid from '@/components/video/VideoGrid.vue';
import { homeApi } from '@/api';
import { useSearchStore } from '@/stores/search';
import type { RankItem } from '@/types';

/** 搜索结果页：结果流 + 排序 + 右侧排行榜/热搜榜 */
const route = useRoute();
const router = useRouter();
const search = useSearchStore();

const ranking = ref<RankItem[]>([]);
const sideError = ref('');
const sorts = [
  { key: 'default', label: '综合排序' },
  { key: 'play', label: '最多播放' },
  { key: 'newest', label: '最新发布' },
  { key: 'danmaku', label: '最多弹幕' },
];

const keyword = computed(() => String(route.query.keyword ?? ''));

async function run() {
  const kw = keyword.value;
  if (!kw) {
    search.results = [];
    search.resultKeyword = '';
    await search.loadHot();
    document.title = '搜索 - 哔哩哔哩';
    return;
  }
  await search.runSearch(kw, true);
  document.title = `${kw} 的搜索结果 - 哔哩哔哩`;
}

async function loadSidebar() {
  try {
    const data = await homeApi.sidebar(String(route.query.category ?? 'all'));
    ranking.value = data.ranking;
    sideError.value = '';
  } catch (err) {
    sideError.value = err instanceof Error ? err.message : '排行榜加载失败';
  }
}

onMounted(() => {
  void run();
  void loadSidebar();
});

watch(keyword, () => void run());
</script>

<template>
  <div class="search bili-container">
    <div class="search__crumb">
      <button class="search__back" @click="router.back()">‹ 返回</button>
      <span>搜索结果</span>
    </div>

    <div class="search__layout">
      <div class="search__main">
        <header class="search__head">
          <h1>
            <template v-if="keyword">“<em>{{ keyword }}</em>” 的搜索结果</template>
            <template v-else>搜索</template>
          </h1>
          <span v-if="keyword" class="search__count">共找到 {{ search.total }} 个视频</span>
        </header>

        <div v-if="!keyword" class="recent">
          <div class="recent__block">
            <h3>搜索历史</h3>
            <div v-if="search.recent.length" class="recent__chips">
              <button v-for="k in search.recent" :key="k" class="chip" @click="router.push({ name: 'search', query: { keyword: k } })">
                {{ k }}
              </button>
              <button class="chip chip--clear" @click="search.clearRecent()">清空</button>
            </div>
            <p v-else class="recent__empty">还没有搜索记录，试试上方搜索框</p>
          </div>
          <div class="recent__block">
            <h3>大家在搜</h3>
            <div class="recent__chips">
              <button
                v-for="(k, i) in search.hotSearch"
                :key="k"
                class="chip"
                :class="{ 'chip--hot': i < 3 }"
                @click="router.push({ name: 'search', query: { keyword: k } })"
              >
                {{ k }}
              </button>
            </div>
          </div>
        </div>

        <template v-else>
          <div class="search__sorts">
            <button
              v-for="s in sorts"
              :key="s.key"
              class="search__sort"
              :class="{ 'is-active': search.sort === s.key }"
              @click="search.setSort(s.key as 'default' | 'play' | 'newest' | 'danmaku')"
            >
              {{ s.label }}
            </button>
          </div>

          <div v-if="search.error" class="search__error">
            <span>{{ search.error }}</span>
            <button class="btn-ghost" @click="search.runSearch(keyword, true)">重试</button>
          </div>

          <VideoGrid
            v-else
            :videos="search.results"
            :loading="search.searching"
            empty-text="没有找到相关视频，换个关键词试试"
          />

          <div v-if="search.hasMore" class="search__more">
            <button class="btn-ghost" :disabled="search.searching" @click="search.runSearch(search.resultKeyword, false)">
              加载更多
            </button>
          </div>
        </template>
      </div>

      <RankSidebar v-if="!sideError" :ranking="ranking" :hot-search="search.hotSearch" />
      <aside v-else class="search__side-error">{{ sideError }}</aside>
    </div>
  </div>
</template>

<style scoped>
.search {
  padding-bottom: 40px;
}
.search__crumb {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 0 6px;
  font-size: 13px;
  color: var(--text-3);
}
.search__back {
  padding: 4px 10px;
  border-radius: var(--radius);
  background: var(--bg-gray);
  color: var(--text-2);
}
.search__back:hover {
  color: var(--bili-pink);
}
.search__layout {
  display: flex;
  gap: 26px;
  margin-top: 6px;
}
.search__main {
  flex: 1;
  min-width: 0;
}
.search__head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line-light);
}
.search__head h1 {
  font-size: 18px;
  font-weight: 600;
}
.search__head em {
  font-style: normal;
  color: var(--bili-pink);
}
.search__count {
  font-size: 12px;
  color: var(--text-3);
}
.search__sorts {
  display: flex;
  gap: 4px;
  padding: 12px 0;
}
.search__sort {
  padding: 6px 12px;
  border-radius: var(--radius);
  font-size: 13px;
  color: var(--text-2);
}
.search__sort:hover {
  color: var(--bili-pink);
}
.search__sort.is-active {
  background: var(--bili-pink);
  color: #fff;
}
.recent__block {
  margin-top: 22px;
}
.recent__block h3 {
  font-size: 15px;
  margin-bottom: 12px;
}
.recent__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.chip {
  padding: 6px 14px;
  border-radius: 16px;
  background: var(--bg-gray);
  color: var(--text-2);
  font-size: 13px;
  transition: all 0.16s;
}
.chip:hover {
  background: var(--bili-pink);
  color: #fff;
}
.chip--hot {
  color: #fe2d46;
  background: #fff0f2;
}
.chip--clear {
  color: var(--text-3);
}
.recent__empty {
  font-size: 13px;
  color: var(--text-3);
}
.search__error {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 40px 0;
  font-size: 13px;
  color: #fe2d46;
}
.search__error button {
  padding: 4px 12px;
  font-size: 12px;
}
.search__side-error {
  width: 320px;
  flex: none;
  padding: 20px;
  font-size: 13px;
  color: var(--text-3);
}
.search__more {
  padding: 16px 0;
  text-align: center;
}
.search__more button {
  padding: 8px 26px;
  font-size: 13px;
}
</style>
