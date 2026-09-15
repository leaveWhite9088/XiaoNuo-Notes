<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../api/index.js';
import CategoryRail from '../components/CategoryRail.vue';
import BannerCarousel from '../components/BannerCarousel.vue';
import VideoGrid from '../components/VideoGrid.vue';

const route = useRoute();
const router = useRouter();

const categories = ref([]);
const banners = ref([]);
const videos = ref([]);
const region = ref(typeof route.query.region === 'string' ? route.query.region : 'home');
const loading = ref(false);
const firstLoad = ref(true);
const page = ref(1);
const hasMore = ref(true);
const loadingMore = ref(false);
const loadError = ref('');

const PAGE_SIZE = 20;
let scrollHandler = null;
let lastCheck = 0;

function checkSentinel() {
  // 每次查询而非缓存引用：切换分区后哨兵元素会被 v-if 重建
  const el = document.querySelector('.feed-sentinel');
  if (!el) return;
  if (el.getBoundingClientRect().top < window.innerHeight + 300) loadMore();
}

function onScroll() {
  const now = Date.now();
  if (now - lastCheck < 150) return;
  lastCheck = now;
  if (loadingMore.value || loading.value) return;
  checkSentinel();
}

function regionName() {
  return categories.value.find((c) => c.key === region.value)?.name || '首页';
}

async function loadFeed(reset) {
  if (reset) {
    page.value = 1;
    hasMore.value = true;
    videos.value = [];
  }
  loading.value = true;
  loadError.value = '';
  try {
    const data = await api.feed({ region: region.value, page: 1, pageSize: PAGE_SIZE });
    videos.value = data.list;
    hasMore.value = data.has_more;
    page.value = 1;
  } catch (err) {
    loadError.value = err.message;
  } finally {
    loading.value = false;
    firstLoad.value = false;
  }
}

async function loadMore() {
  if (!hasMore.value || loadingMore.value || loading.value) return;
  loadingMore.value = true;
  try {
    const data = await api.feed({ region: region.value, page: page.value + 1, pageSize: PAGE_SIZE });
    page.value = data.page;
    videos.value.push(...data.list);
    hasMore.value = data.has_more;
  } catch {
    hasMore.value = false;
  } finally {
    loadingMore.value = false;
  }
}

function onRegionSelect() {
  router.replace({ query: region.value === 'home' ? {} : { region: region.value } });
  window.scrollTo({ top: 0 });
}

watch(
  () => route.query.region,
  async (val) => {
    const next = typeof val === 'string' ? val : 'home';
    if (next !== region.value || videos.value.length === 0) {
      region.value = next;
      await loadFeed(true);
    }
  }
);

onMounted(async () => {
  try {
    const [cats, bs] = await Promise.all([api.categories(), api.banners()]);
    categories.value = cats;
    banners.value = bs;
  } catch { /* 静默，rail 缺失不影响主流程 */ }
  await loadFeed(true);

  await nextTick();
  scrollHandler = onScroll;
  window.addEventListener('scroll', scrollHandler, { passive: true });
  // 兜底：初始加载后哨兵已在视口附近时直接补一页
  requestAnimationFrame(checkSentinel);
});

onBeforeUnmount(() => {
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler);
});
</script>

<template>
  <div class="home-wrap">
    <CategoryRail v-model="region" :categories="categories" @select="onRegionSelect" />

    <div class="home-main">
      <BannerCarousel v-if="region === 'home' && banners.length" :banners="banners" />

      <div class="feed-head">
        <h2 class="feed-title">{{ regionName() }}</h2>
        <span v-if="!loading" class="feed-sub">为你推荐</span>
      </div>

      <!-- 骨架屏 -->
      <div v-if="loading" class="skeleton-grid">
        <div v-for="i in 10" :key="i" class="skeleton-card">
          <div class="skeleton cover"></div>
          <div class="skeleton title"></div>
          <div class="skeleton meta"></div>
        </div>
      </div>

      <div v-else-if="loadError" class="feed-error">
        加载失败：{{ loadError }}
        <button class="retry-btn" @click="loadFeed(true)">重试</button>
      </div>

      <VideoGrid v-else :videos="videos">
        <template #empty>
          <p>该分区暂时没有视频，去别的分区逛逛吧</p>
        </template>
      </VideoGrid>

      <!-- 无限滚动哨兵 + 手动加载兜底 -->
      <div v-if="!loading && hasMore" class="feed-sentinel" @click="loadMore">
        <span v-if="loadingMore">正在加载更多…</span>
        <button v-else class="load-more-btn">加载更多</button>
      </div>
      <div v-else-if="!loading && videos.length" class="feed-end">— 没有更多内容了 —</div>
    </div>
  </div>
</template>

<style scoped>
.home-wrap {
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px 24px 0;
  display: flex;
  gap: 16px;
}
.home-main {
  flex: 1;
  min-width: 0;
}
.feed-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 4px 0 14px;
}
.feed-title {
  font-size: 20px;
  font-weight: 600;
}
.feed-sub {
  color: var(--text-3);
  font-size: 12px;
}
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(216px, 1fr));
  gap: 20px;
}
.skeleton-card .cover {
  aspect-ratio: 16 / 10;
  margin-bottom: 8px;
}
.skeleton-card .title {
  height: 18px;
  margin-bottom: 6px;
}
.skeleton-card .meta {
  height: 14px;
  width: 60%;
}
.feed-error {
  padding: 60px 0;
  text-align: center;
  color: #f25d8e;
}
.retry-btn {
  display: block;
  margin: 12px auto 0;
  color: var(--bili-blue);
  border: 1px solid var(--line);
  padding: 6px 20px;
  border-radius: 16px;
}
.feed-sentinel {
  padding: 30px 0 10px;
  text-align: center;
  color: var(--text-3);
  cursor: pointer;
}
.load-more-btn {
  color: var(--text-2);
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 18px;
  padding: 8px 26px;
  font-size: 13px;
}
.load-more-btn:hover {
  color: var(--bili-pink);
  border-color: var(--bili-pink);
}
.feed-end {
  padding: 30px 0 10px;
  text-align: center;
  color: var(--text-3);
  font-size: 12px;
}
@media (max-width: 1100px) {
  .home-wrap {
    flex-direction: column;
  }
}
</style>
