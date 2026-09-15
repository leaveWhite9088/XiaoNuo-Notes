<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import BannerCarousel from '@/components/layout/BannerCarousel.vue';
import CategoryTabs from '@/components/layout/CategoryTabs.vue';
import ChannelNav from '@/components/layout/ChannelNav.vue';
import PromoPanel from '@/components/layout/PromoPanel.vue';
import Icon from '@/components/common/Icon.vue';
import VideoGrid from '@/components/video/VideoGrid.vue';
import { useHomeStore, type FeedSort } from '@/stores/home';

/** 首页：轮播 + 分区导航 + 分区筛选 + 视频流（无限滚动） */
const home = useHomeStore();
const sentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const feed = computed(() => home.feed);
const promoItems = computed(() => feed.value.list.slice(0, 4));

onMounted(async () => {
  // 进入首页默认展示「全部」，不沿用分区页残留的筛选状态
  home.activeCategory = 'all';
  await Promise.all([
    home.loadOverview().catch(() => undefined),
    home.loadFeed(true).catch(() => undefined),
  ]);

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

onUnmounted(() => observer?.disconnect());

watch(
  () => home.activeCategory + home.activeSort,
  () => {
    if (sentinel.value) {
      observer?.unobserve(sentinel.value);
      observer?.observe(sentinel.value);
    }
  },
);

function changeSort(sort: FeedSort) {
  void home.setSort(sort);
}
</script>

<template>
  <div class="home bili-container">
    <!-- 顶部：轮播 + 推广位 -->
    <section class="home__top">
      <BannerCarousel :banners="home.banners" />
      <PromoPanel :items="promoItems" />
    </section>

    <!-- 分区导航（hover 展开二级分区） -->
    <ChannelNav :categories="home.categories.filter((c) => c.slug !== 'all')" />

    <!-- 分区筛选 + 排序 -->
    <CategoryTabs
      :categories="home.categories"
      :active="home.activeCategory"
      :sort="home.activeSort"
      :total="feed.total"
      @update:category="home.setCategory"
      @update:sort="changeSort"
    />

    <!-- 视频流 -->
    <div v-if="feed.error && !feed.list.length" class="home__error">
      <p>{{ feed.error }}</p>
      <button class="btn-primary home__retry" @click="home.retryFeed()">
        <Icon name="i-history" :size="14" />重新加载
      </button>
    </div>

    <VideoGrid
      v-else
      :videos="feed.list"
      :loading="feed.loading"
      :skeleton-count="feed.list.length ? 6 : 12"
      empty-text="这里还什么都没有哦~"
    />

    <div ref="sentinel" class="sentinel"></div>

    <div v-if="feed.loading && feed.list.length" class="loading-more">正在加载更多...</div>
    <div v-else-if="!feed.hasMore && feed.list.length" class="loading-more">没有更多了 ~</div>

    <p class="home__stat">
      本站共收录 {{ home.totalVideos }} 条真实视频数据（来自 B 站公开接口快照）
    </p>
  </div>
</template>

<style scoped>
.home {
  padding-bottom: 40px;
}
.home__top {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}
.home__top > :first-child {
  flex: 1;
  min-width: 0;
}
.sentinel {
  height: 1px;
}
.loading-more {
  padding: 18px 0 26px;
  text-align: center;
  color: var(--text-3);
  font-size: 13px;
}
.home__error {
  padding: 70px 0;
  text-align: center;
  color: var(--text-3);
}
.home__retry {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 14px;
  padding: 8px 18px;
  font-size: 13px;
}
.home__stat {
  padding: 8px 0 20px;
  text-align: center;
  font-size: 12px;
  color: var(--text-4);
}

@media (max-width: 1100px) {
  .home__top {
    flex-direction: column;
  }
}
</style>
