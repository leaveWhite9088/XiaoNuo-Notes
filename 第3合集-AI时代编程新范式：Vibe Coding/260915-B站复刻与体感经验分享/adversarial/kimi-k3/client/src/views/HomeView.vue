<template>
  <div class="home">
    <ChannelNav />

    <!-- 首屏：轮播 + 右侧推荐 -->
    <section class="hero container">
      <div class="hero-left">
        <BannerCarousel :banners="banners" />
      </div>
      <div class="hero-right">
        <VideoCard v-for="v in recommend" :key="v.id" :video="v" />
      </div>
    </section>

    <!-- 分类 Tab + 视频流 -->
    <section class="feed container">
      <CategoryTabs v-model="category" @change="onCategoryChange" />

      <div v-if="loading && !videos.length" class="state">加载中…</div>
      <div v-else-if="!videos.length" class="state">该分类下暂时没有视频</div>
      <VideoGrid v-else :videos="videos" />

      <div class="load-more-wrap" v-if="videos.length">
        <button v-if="hasMore" class="load-more" :disabled="loading" @click="loadMore">
          {{ loading ? '加载中…' : '加载更多' }}
        </button>
        <span v-else class="no-more">已经到底啦，去别的分类看看吧 ~</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ChannelNav from '../components/ChannelNav.vue';
import BannerCarousel from '../components/BannerCarousel.vue';
import VideoCard from '../components/VideoCard.vue';
import VideoGrid from '../components/VideoGrid.vue';
import CategoryTabs from '../components/CategoryTabs.vue';
import { fetchBanners, fetchVideos } from '../api';

const banners = ref([]);
const recommend = ref([]);
const videos = ref([]);
const category = ref('推荐');
const page = ref(1);
const hasMore = ref(true);
const loading = ref(false);
const PAGE_SIZE = 10;

async function loadFeed(reset = false) {
  loading.value = true;
  try {
    if (reset) {
      page.value = 1;
      videos.value = [];
    }
    const data = await fetchVideos({ category: category.value, page: page.value, pageSize: PAGE_SIZE });
    videos.value = reset ? data.items : videos.value.concat(data.items);
    hasMore.value = data.hasMore;
  } catch (e) {
    console.error('加载视频列表失败', e);
  } finally {
    loading.value = false;
  }
}

function onCategoryChange() {
  loadFeed(true);
}

function loadMore() {
  page.value += 1;
  loadFeed();
}

onMounted(async () => {
  // 轮播
  fetchBanners()
    .then((data) => (banners.value = data))
    .catch((e) => console.error('加载轮播失败', e));

  // 右侧推荐：取热门前 6
  fetchVideos({ category: '热门', page: 1, pageSize: 6 })
    .then((data) => (recommend.value = data.items))
    .catch((e) => console.error('加载推荐失败', e));

  loadFeed(true);
});
</script>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.5fr);
  gap: 16px;
  padding-top: 8px;
  padding-bottom: 8px;
}

.hero-left {
  min-width: 0;
}

.hero-right {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  align-content: start;
}

.hero-right :deep(.title) {
  font-size: 13px;
  min-height: 36px;
}

.hero-right :deep(.card-info) {
  padding: 8px 8px 10px;
}

.hero-right :deep(.meta) {
  font-size: 11px;
}

.state {
  text-align: center;
  color: var(--text-light);
  padding: 60px 0;
  font-size: 14px;
}

.load-more-wrap {
  display: flex;
  justify-content: center;
  padding: 26px 0 40px;
}

.load-more {
  padding: 10px 48px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid var(--border-gray);
  color: var(--text-sub);
  font-size: 14px;
  transition: all 0.2s;
}

.load-more:hover:not(:disabled) {
  color: var(--bili-pink);
  border-color: var(--bili-pink);
}

.load-more:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.no-more {
  color: var(--text-light);
  font-size: 13px;
}

@media (max-width: 1100px) {
  .hero {
    grid-template-columns: 1fr;
  }
}
</style>
