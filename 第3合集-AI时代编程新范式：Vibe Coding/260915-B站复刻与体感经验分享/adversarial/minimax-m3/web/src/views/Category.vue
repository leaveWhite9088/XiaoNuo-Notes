<template>
  <div class="category-page">
    <div class="container">
      <div class="cat-header">
        <div class="cat-meta">
          <span class="cat-icon">{{ catInfo?.icon }}</span>
          <h1 class="cat-title">{{ catInfo?.name || '分区' }}</h1>
          <span class="cat-count">{{ total }} 个视频</span>
        </div>
        <button class="back-home-btn" @click="goHome" type="button">
          ← 返回首页
        </button>
      </div>
      <CategoryTabs
        :categories="categories"
        v-model="category"
        v-model:sort="sort"
      />
      <VideoGrid :items="items" :loading="loading" :has-more="hasMore" />
      <div v-if="hasMore" class="load-more-wrap">
        <button class="load-more-btn" :disabled="loading" @click="loadMore">
          {{ loading ? '加载中…' : '加载更多' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CategoryTabs from '@/components/CategoryTabs.vue';
import VideoGrid from '@/components/VideoGrid.vue';
import { api } from '@/api';

const props = defineProps({ tid: { type: String, required: true } });
const router = useRouter();

const categories = ref([]);
const category = ref(props.tid);
const sort = ref('default');
const items = ref([]);
const loading = ref(false);
const hasMore = ref(true);
const total = ref(0);
const page = ref(1);
const pageSize = 30;

function goHome() { router.push({ name: 'home' }); }

const catInfo = computed(() => categories.value.find((c) => c.tid === category.value));

async function loadCategories() {
  const res = await api.categories();
  categories.value = res.items;
}

async function refresh() {
  page.value = 1;
  hasMore.value = true;
  loading.value = true;
  try {
    const res = await api.videos({
      category: category.value,
      sort: sort.value,
      page: page.value,
      pageSize,
    });
    items.value = res.items;
    total.value = res.total;
    hasMore.value = res.hasMore;
  } finally {
    loading.value = false;
  }
}

function loadMore() {
  if (!hasMore.value || loading.value) return;
  page.value += 1;
  loading.value = true;
  api.videos({
    category: category.value,
    sort: sort.value,
    page: page.value,
    pageSize,
  }).then((res) => {
    items.value = items.value.concat(res.items);
    hasMore.value = res.hasMore;
  }).finally(() => { loading.value = false; });
}

watch([category, sort], refresh);
watch(() => props.tid, (v) => { category.value = v; });

onMounted(async () => {
  await loadCategories();
  await refresh();
});
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.category-page { padding-bottom: 32px; }
.cat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px 0;
}
.cat-meta { display: flex; align-items: center; gap: 12px; }
.cat-icon { font-size: 28px; }
.cat-title { font-size: 22px; font-weight: 500; color: $bili-text; }
.cat-count { font-size: 12px; color: $bili-text-3; padding: 4px 10px; background: $bili-tag-bg; border-radius: 12px; }
.back-home-btn {
  height: 30px;
  padding: 0 14px;
  border-radius: 15px;
  background: $bili-tag-bg;
  font-size: 13px;
  color: $bili-text-2;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: rgba(251, 114, 153, 0.1); color: $bili-pink; }
}
.load-more-wrap { display: flex; justify-content: center; margin: 24px 0; }
.load-more-btn {
  width: 200px; height: 40px; border-radius: 20px;
  background: #fff; color: $bili-text-2; font-size: 13px;
  border: 1px solid $bili-border; cursor: pointer; transition: all 0.2s;
  &:hover:not(:disabled) { color: $bili-pink; border-color: $bili-pink; }
}
</style>
