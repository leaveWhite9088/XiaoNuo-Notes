<template>
  <div class="search-page container">
    <h1 class="page-title">
      「<span class="kw">{{ keyword }}</span>」的搜索结果
      <span v-if="!loading" class="total">共 {{ results.length }} 条</span>
    </h1>

    <div v-if="loading" class="state">搜索中…</div>
    <div v-else-if="!results.length" class="state empty">
      <div class="empty-icon">(´；ω；`)</div>
      <p>没有找到与「{{ keyword }}」相关的内容</p>
      <router-link to="/" class="back-home">回首页逛逛</router-link>
    </div>
    <VideoGrid v-else :videos="results" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import VideoGrid from '../components/VideoGrid.vue';
import { searchVideos } from '../api';

const route = useRoute();
const keyword = ref('');
const results = ref([]);
const loading = ref(false);

async function doSearch(kw) {
  keyword.value = kw || '';
  if (!keyword.value) {
    results.value = [];
    return;
  }
  loading.value = true;
  try {
    const data = await searchVideos(keyword.value);
    results.value = data.items;
  } catch (e) {
    console.error('搜索失败', e);
    results.value = [];
  } finally {
    loading.value = false;
  }
}

watch(
  () => route.query.keyword,
  (kw) => doSearch(kw),
  { immediate: true }
);
</script>

<style scoped>
.search-page {
  padding-top: 24px;
  padding-bottom: 40px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
}

.kw {
  color: var(--bili-pink);
}

.total {
  margin-left: 10px;
  font-size: 13px;
  font-weight: 400;
  color: var(--text-light);
}

.state {
  text-align: center;
  color: var(--text-light);
  padding: 70px 0;
  font-size: 14px;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 14px;
}

.back-home {
  display: inline-block;
  margin-top: 16px;
  padding: 8px 28px;
  border-radius: 8px;
  border: 1px solid var(--bili-pink);
  color: var(--bili-pink);
  transition: all 0.2s;
}

.back-home:hover {
  background: var(--bili-pink);
  color: #fff;
}
</style>
