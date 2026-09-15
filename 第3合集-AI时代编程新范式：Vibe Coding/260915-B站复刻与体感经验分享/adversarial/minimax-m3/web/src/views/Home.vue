<template>
  <div class="home">
    <div class="container">
      <Banner />
      <CategoryTabs
        :categories="categories"
        v-model="category"
        v-model:sort="sort"
      />

      <div class="layout">
        <div class="layout-main">
          <div class="section-header">
            <h2 class="title">
              <span class="icon"></span>
              {{ sectionTitle }}
            </h2>
            <a class="more" href="#" @click.prevent>换一换</a>
          </div>
          <VideoGrid :items="items" :loading="loading" :has-more="hasMore" />
          <div v-if="hasMore" class="load-more-wrap">
            <button class="load-more-btn" :disabled="loading" @click="loadMore">
              {{ loading ? '加载中…' : '加载更多' }}
            </button>
          </div>
        </div>
        <div class="layout-side">
          <SideRanking :items="ranking" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Banner from '@/components/Banner.vue';
import CategoryTabs from '@/components/CategoryTabs.vue';
import VideoGrid from '@/components/VideoGrid.vue';
import SideRanking from '@/components/SideRanking.vue';
import { api } from '@/api';

const route = useRoute();
const categories = ref([]);
const category = ref('all');
const sort = ref('default');
const items = ref([]);
const ranking = ref([]);
const loading = ref(false);
const hasMore = ref(true);
const page = ref(1);
const pageSize = 30;

const sectionTitle = computed(() => {
  const c = categories.value.find((x) => x.tid === category.value);
  if (!c || c.tid === 'all') return '为你推荐';
  return `${c.name} · 推荐`;
});

async function loadCategories() {
  const res = await api.categories();
  categories.value = res.items;
}

async function loadRanking() {
  const res = await api.ranking();
  ranking.value = res.items;
}

async function loadPage(reset = false) {
  loading.value = true;
  try {
    const res = await api.videos({
      category: category.value,
      sort: sort.value,
      page: page.value,
      pageSize,
    });
    items.value = reset ? res.items : items.value.concat(res.items);
    hasMore.value = res.hasMore;
  } catch (e) {
    console.error('[home] loadPage error', e);
  } finally {
    loading.value = false;
  }
}

async function refresh() {
  page.value = 1;
  hasMore.value = true;
  await loadPage(true);
}
function loadMore() {
  if (!hasMore.value || loading.value) return;
  page.value += 1;
  loadPage(false);
}

watch([category, sort], () => { refresh(); });

// 搜索 query.q 进来时，模拟「搜索结果」交互
watch(
  () => route.query?.q,
  (q) => {
    if (q) {
      // 简单实现：把 q 注入到默认分类顶部
      console.log('[home] search query:', q);
    }
  },
);

onMounted(async () => {
  await loadCategories();
  await loadRanking();
  await loadPage(true);
});
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.home { padding-bottom: 32px; }
.layout {
  display: grid;
  grid-template-columns: 1fr $sidebar-width;
  gap: 24px;
  margin-top: 16px;
  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
  @media (max-width: 720px) {
    gap: 12px;
  }
}
.layout-main { min-width: 0; }
.load-more-wrap { display: flex; justify-content: center; margin: 24px 0; }
.load-more-btn {
  width: 200px;
  height: 40px;
  border-radius: 20px;
  background: #fff;
  color: $bili-text-2;
  font-size: 13px;
  border: 1px solid $bili-border;
  cursor: pointer;
  transition: all 0.2s;
  &:hover:not(:disabled) { color: $bili-pink; border-color: $bili-pink; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}
</style>
