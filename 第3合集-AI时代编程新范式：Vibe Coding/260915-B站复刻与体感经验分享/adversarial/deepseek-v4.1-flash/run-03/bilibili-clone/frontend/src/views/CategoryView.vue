<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CategoryTabs from '@/components/layout/CategoryTabs.vue';
import Icon from '@/components/common/Icon.vue';
import VideoGrid from '@/components/video/VideoGrid.vue';
import { useHomeStore, type FeedSort } from '@/stores/home';

/**
 * 分区页：/category/:slug 是唯一事实来源。
 * 切换分区 tab 走路由跳转，URL / 标题 / 列表三者始终一致。
 */
const route = useRoute();
const router = useRouter();
const home = useHomeStore();
const sentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const slug = computed(() => String(route.params.slug ?? 'all'));
const feed = computed(() => home.feed);
const categoryName = computed(() => home.categoryName(slug.value));
const categoryIcon = computed(
  () => home.categories.find((c) => c.slug === slug.value)?.icon ?? 'home',
);

async function sync() {
  await home.loadOverview().catch(() => undefined);
  home.activeCategory = slug.value;
  await home.loadFeed(true);
  document.title = `${categoryName.value} - 哔哩哔哩`;
}

/** 分区 tab：改 URL（route.params 变化后由 watch 统一同步状态） */
function changeCategory(next: string) {
  if (next === slug.value) return;
  void router.push({ name: 'category', params: { slug: next } });
}

function changeSort(sort: FeedSort) {
  void home.setSort(sort);
}

onMounted(async () => {
  await sync();
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && feed.value.hasMore && !feed.value.loading) {
        void home.loadMore();
      }
    },
    { rootMargin: '400px' },
  );
  if (sentinel.value) observer.observe(sentinel.value);
});

watch(slug, () => void sync());
onUnmounted(() => observer?.disconnect());
</script>

<template>
  <div class="category bili-container">
    <header class="category__head">
      <Icon :name="`c-${categoryIcon}`" :size="40" />
      <div>
        <h1>{{ categoryName }}</h1>
        <p>共 {{ feed.total }} 个视频 · 每日更新</p>
      </div>
    </header>

    <CategoryTabs
      :categories="home.categories"
      :active="home.activeCategory"
      :sort="home.activeSort"
      :total="feed.total"
      @update:category="changeCategory"
      @update:sort="changeSort"
    />

    <div v-if="feed.error && !feed.list.length" class="tip tip--error">
      <p>{{ feed.error }}</p>
      <button class="btn-primary tip__retry" @click="home.retryFeed()">重新加载</button>
    </div>

    <VideoGrid v-else :videos="feed.list" :loading="feed.loading" />
    <div ref="sentinel" class="sentinel"></div>
    <div v-if="feed.loading && feed.list.length" class="tip">正在加载更多...</div>
    <div v-else-if="!feed.hasMore && feed.list.length" class="tip">已经到底啦 ~</div>
  </div>
</template>

<style scoped>
.category {
  padding: 20px 0 40px;
}
.category__head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: var(--radius-lg);
  background: linear-gradient(120deg, #fff5f8, #f3f9ff);
  border: 1px solid var(--line-light);
}
.category__head h1 {
  font-size: 20px;
  font-weight: 600;
}
.category__head p {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-3);
}
.sentinel {
  height: 1px;
}
.tip {
  padding: 18px 0;
  text-align: center;
  font-size: 13px;
  color: var(--text-3);
}
.tip--error {
  padding: 70px 0;
}
.tip__retry {
  margin-top: 14px;
  padding: 8px 18px;
  font-size: 13px;
}
</style>
