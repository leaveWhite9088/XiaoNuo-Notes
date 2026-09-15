<template>
  <div class="search-view">
    <div class="layout">
      <div class="search-view__head">
        <h1 class="search-view__title">
          搜索 <em>{{ keyword }}</em>
        </h1>
        <p class="search-view__count">
          共找到 <b>{{ result.total }}</b> 个相关视频
          <span v-if="loading">（搜索中...）</span>
        </p>
      </div>

      <div class="search-view__filters">
        <button
          v-for="cat in categoryOptions"
          :key="cat.slug"
          class="filter-chip"
          :class="{ 'is-active': activeCategory === cat.slug }"
          @click="filterByCategory(cat.slug)"
        >
          {{ cat.name }}
        </button>
      </div>

      <VideoGrid
        :videos="result.list || []"
        :loading="loading"
        :skeleton-count="10"
        class="search-view__grid"
      />

      <div v-if="!loading && !(result.list || []).length" class="search-view__empty">
        <SvgIcon name="search" :size="40" />
        <p>没有找到与「{{ keyword }}」相关的视频</p>
        <span>换个关键词试试，或者看看下方热搜榜</span>
        <div class="search-view__hot">
          <button
            v-for="hot in hotSearches"
            :key="hot.keyword"
            class="hot-chip"
            @click="searchKeyword(hot.keyword)"
          >
            {{ hot.keyword }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import VideoGrid from '@/components/home/VideoGrid.vue';
import SvgIcon from '@/components/common/SvgIcon.vue';
import { useSearchStore } from '@/stores/search.js';
import { useHomeStore } from '@/stores/home.js';

/**
 * 搜索结果页：关键词结果 + 分区筛选 + 空态热搜引导。
 */
const route = useRoute();
const router = useRouter();
const store = useSearchStore();
const home = useHomeStore();
const activeCategory = ref('all');

const keyword = computed(() => String(route.query.keyword || ''));
const result = computed(() => store.result);
const loading = computed(() => store.loadingResult);
const hotSearches = computed(() => home.hotSearches);

const categoryOptions = computed(() => [
  { slug: 'all', name: '全部' },
  ...(home.categories || []).slice(0, 10),
]);

async function run() {
  await store.search(keyword.value, { category: activeCategory.value });
}

function filterByCategory(slug) {
  activeCategory.value = slug;
  run();
}

function searchKeyword(word) {
  router.push({ name: 'search', query: { keyword: word } });
}

watch(keyword, () => {
  activeCategory.value = 'all';
  run();
});

onMounted(async () => {
  if (!home.categories.length) await home.fetchHome();
  if (keyword.value) run();
});
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.search-view {
  padding: 24px 0 0;

  &__head {
    margin-bottom: 16px;
  }

  &__title {
    font-size: 22px;
    font-weight: 600;
    color: $text-1;

    em {
      font-style: normal;
      color: $brand-pink;
    }
  }

  &__count {
    margin-top: 6px;
    font-size: 13px;
    color: $text-3;

    b {
      color: $brand-blue;
    }
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 18px;
    padding: 12px 16px;
    background: #fff;
    border-radius: $radius-lg;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 80px 0;
    color: $text-3;

    p {
      font-size: 16px;
      color: $text-2;
    }

    span {
      font-size: 13px;
    }
  }

  &__hot {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-top: 14px;
  }
}

.filter-chip {
  height: 30px;
  padding: 0 14px;
  font-size: 13px;
  color: $text-2;
  background: $bg-card;
  border-radius: $radius-md;
  transition: all $transition-fast;

  &:hover {
    color: $brand-blue;
  }

  &.is-active {
    color: #fff;
    background: $brand-pink;
  }
}

.hot-chip {
  padding: 6px 14px;
  font-size: 13px;
  color: $text-2;
  background: #fff;
  border-radius: 20px;
  box-shadow: $shadow-card;
  transition: all $transition-fast;

  &:hover {
    color: #fff;
    background: $brand-blue;
  }
}
</style>
