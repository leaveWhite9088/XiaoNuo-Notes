<script setup>
import { defineOptions } from 'vue';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../api';
import { useCategories } from '../composables/useCategories';
import CategoryBar from '../components/CategoryBar.vue';
import VideoGrid from '../components/VideoGrid.vue';
import RankRail from '../components/RankRail.vue';

defineOptions({ name: 'HomeView' }); // keep-alive 依据此名缓存

const route = useRoute();
const router = useRouter();
const { chips, failed: categoriesFailed, reload: reloadCategories } = useCategories();

const category = ref(typeof route.query.category === 'string' ? route.query.category : 'recommend');
const videos = ref([]);
const page = ref(1);
const hasMore = ref(true);
const loading = ref(false);
const error = ref('');

// 代际令牌：切换分类时让在途的旧请求作废，防止旧响应覆盖新列表
let gen = 0;

function resetFeed() {
  gen += 1;
  loading.value = false;
  videos.value = [];
  page.value = 1;
  hasMore.value = true;
  error.value = '';
  loadMore(gen); // 首页结果在 loadMore 内整体替换
}

async function loadMore(g = gen) {
  if (loading.value) return;
  loading.value = true;
  try {
    const res = await api.feed(category.value, page.value, 30);
    if (g !== gen) return; // 已被新一轮请求取代，丢弃
    // 原子替换/追加，避免"清空后再逐条 push"造成列表过渡产生残留节点
    videos.value = page.value === 1 ? res.list : [...videos.value, ...res.list];
    hasMore.value = res.hasMore;
    page.value += 1;
  } catch (e) {
    if (g === gen) error.value = '视频加载失败，请检查后端服务后重试';
  } finally {
    if (g === gen) loading.value = false;
  }
}

function onCategoryChange(key) {
  if (key === category.value) return;
  category.value = key;
  router.replace({ name: 'home', query: key === 'recommend' ? {} : { category: key } });
  resetFeed();
}

// 头部"分区"菜单/主导航修改 query 时同步刷新（含 keep-alive 激活场景）
watch(
  () => route.query.category,
  (v) => {
    const next = typeof v === 'string' ? v : 'recommend';
    if (next !== category.value) {
      category.value = next;
      resetFeed();
    }
  },
);

function dislike(bvid) {
  videos.value = videos.value.filter((v) => v.bvid !== bvid);
}

onMounted(resetFeed);
</script>

<template>
  <div class="home-wrap">
    <div class="home-inner">
      <CategoryBar :chips="chips" :model-value="category" @update:model-value="onCategoryChange" />
      <div v-if="!chips.length && categoriesFailed" class="feed-error">
        <span>分类加载失败</span>
        <button @click="reloadCategories">重试</button>
      </div>
      <div v-if="error" class="feed-error">
        <span>{{ error }}</span>
        <button @click="resetFeed">重试</button>
      </div>
      <div class="home-layout">
        <VideoGrid :videos="videos" :loading="loading" :has-more="hasMore" @load-more="loadMore" @dislike="dislike" />
        <RankRail />
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-wrap { padding: 0 24px; }
.home-inner { max-width: 1660px; margin: 0 auto; }
.home-layout { display: flex; gap: 20px; align-items: flex-start; padding-bottom: 30px; }
.home-layout > :first-child { flex: 1; min-width: 0; }
.feed-error {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff4f6;
  border: 1px solid #ffd9e3;
  color: #c4527a;
  border-radius: 8px;
  padding: 10px 16px;
  margin: 8px 0 4px;
  font-size: 13.5px;
}
.feed-error button {
  border: 1px solid #ffd9e3;
  background: #fff;
  color: var(--bili-pink);
  border-radius: 6px;
  padding: 4px 14px;
  cursor: pointer;
}
.feed-error button:hover { background: var(--bili-pink-light); }
</style>
