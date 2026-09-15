<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api/index.js';
import VideoGrid from '../components/VideoGrid.vue';

const route = useRoute();

const keyword = ref('');
const videos = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = 20;
const loading = ref(false);
const searched = ref(false);

async function search(q, p = 1) {
  loading.value = true;
  try {
    const data = await api.search(q, p, pageSize);
    videos.value = data.list;
    total.value = data.total;
    page.value = data.page;
  } finally {
    loading.value = false;
    searched.value = true;
  }
  window.scrollTo({ top: 0 });
}

const totalPages = ref(1);
watch(total, (t) => (totalPages.value = Math.max(1, Math.ceil(t / pageSize))));

onMounted(() => {
  keyword.value = String(route.query.q || '');
  if (keyword.value) search(keyword.value);
});

watch(
  () => route.query.q,
  (q) => {
    keyword.value = String(q || '');
    if (keyword.value) search(keyword.value);
    else {
      videos.value = [];
      total.value = 0;
      searched.value = false;
    }
  }
);

function changePage(p) {
  if (p < 1 || p > totalPages.value || p === page.value) return;
  search(keyword.value, p);
}
</script>

<template>
  <div class="search-wrap">
    <div class="search-head">
      <h2 class="search-title">
        搜索结果：<span class="keyword">{{ keyword }}</span>
      </h2>
      <span v-if="searched && !loading" class="search-count">共 {{ total }} 个视频</span>
    </div>

    <div v-if="loading" class="search-loading">
      <div class="skeleton" style="height: 24px; width: 200px; margin-bottom: 16px"></div>
      <div class="skeleton-grid">
        <div v-for="i in 10" :key="i" class="skeleton-card">
          <div class="skeleton cover"></div>
          <div class="skeleton title"></div>
          <div class="skeleton meta"></div>
        </div>
      </div>
    </div>

    <template v-else-if="searched">
      <VideoGrid v-if="videos.length" :videos="videos" />
      <div v-else class="search-empty">
        <svg viewBox="0 0 160 110" class="empty-art" aria-hidden="true">
          <rect x="20" y="25" width="120" height="66" rx="10" fill="#e7e9eb" />
          <circle cx="65" cy="58" r="12" fill="#fb7299" opacity="0.7" />
          <rect x="82" y="50" width="40" height="6" rx="3" fill="#c9ccd0" />
          <rect x="82" y="62" width="28" height="6" rx="3" fill="#c9ccd0" />
          <path d="M45 98q35 12 70 0" stroke="#fb7299" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.5" />
        </svg>
        <p class="empty-text">什么也没找到 (´;ω;`)</p>
        <p class="empty-sub">换个关键词试试，或回首页逛逛</p>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
        <button
          v-for="p in totalPages"
          :key="p"
          class="page-btn"
          :class="{ active: p === page }"
          @click="changePage(p)"
        >
          {{ p }}
        </button>
        <button class="page-btn" :disabled="page >= totalPages" @click="changePage(page + 1)">下一页</button>
      </div>
    </template>

    <div v-else class="search-empty">
      <p class="empty-text">输入关键词开始搜索吧</p>
    </div>
  </div>
</template>

<style scoped>
.search-wrap {
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px 24px 0;
}
.search-head {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 18px;
}
.search-title {
  font-size: 20px;
}
.keyword {
  color: var(--bili-pink);
}
.search-count {
  color: var(--text-3);
  font-size: 13px;
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
.search-empty {
  padding: 60px 0;
  text-align: center;
}
.empty-art {
  width: 180px;
  margin-bottom: 12px;
}
.empty-text {
  font-size: 16px;
  color: var(--text-2);
}
.empty-sub {
  font-size: 13px;
  color: var(--text-3);
  margin-top: 6px;
}
.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 30px 0;
}
.page-btn {
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 6px;
  min-width: 34px;
  height: 34px;
  padding: 0 12px;
  color: var(--text-2);
  font-size: 13px;
}
.page-btn:hover:not(:disabled) {
  border-color: var(--bili-pink);
  color: var(--bili-pink);
}
.page-btn.active {
  background: var(--bili-pink);
  border-color: var(--bili-pink);
  color: #fff;
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
