<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../api.js';
import { toast } from '../toast.js';
import { saveHomeContext, takeHomeContext } from '../home-context.js';
import ChannelTabs from '../components/ChannelTabs.vue';
import VideoCard from '../components/VideoCard.vue';

const route = useRoute();
const router = useRouter();

const PAGE_SIZE = 20;

// P3-11：若从详情页返回，取出离开前保存的列表上下文（一次性消费）。
// 仅当 URL 未携带关键词（返回动作）或与保存的关键词一致（浏览器后退）时才恢复；
// 若 URL 带着新的 keyword（如详情页点 UP 主名跳转搜索），以 URL 为准，丢弃旧上下文。
const savedCtx = takeHomeContext();
const urlKw = String(route.query.keyword || '');
const saved = savedCtx && (urlKw === '' || urlKw === savedCtx.keyword) ? savedCtx : null;

const channels = ref([]);
const activeChannel = ref(saved?.channel ?? '全部');
const keyword = ref(saved?.keyword ?? String(route.query.keyword || ''));
const videos = ref(saved?.videos ?? []);
const page = ref(saved?.page ?? 1);
const hasMore = ref(saved?.hasMore ?? false);
const total = ref(saved?.total ?? 0);

const loading = ref(!saved);      // 首屏（无缓存上下文）时立即进入加载态，避免闪现空态（P3-3）
const loadingMore = ref(false);   // 追加加载（不清空当前列表）
const loaded = ref(!!saved);      // 是否完成过至少一次加载
const error = ref(null);          // 首屏/刷新加载错误（P3-2，与空结果区分）
const loadMoreError = ref(false); // 追加加载错误（P3-1/P3-2，可原地重试）

// P2-1：请求序号——只有最后一次发起的查询允许写入状态，过期响应直接丢弃
let reqSeq = 0;
// 程序性修改 URL（清空搜索 / 恢复上下文回填）时，跳过 keyword watcher 的重复请求
let skipKwWatch = false;

function queryParams(forPage) {
  return {
    channel: activeChannel.value === '全部' ? '' : activeChannel.value,
    keyword: keyword.value,
    page: forPage,
    pageSize: PAGE_SIZE,
  };
}

async function fetchVideos() {
  const seq = ++reqSeq;
  loading.value = true;
  error.value = null;
  // 新查询接管全部加载标志：清掉可能悬挂的追加加载状态（其过期响应会被 seq 丢弃）
  loadingMore.value = false;
  loadMoreError.value = false;
  try {
    const data = await api.getVideos(queryParams(1));
    if (seq !== reqSeq) return; // 过期响应：丢弃，不写任何状态
    videos.value = data.list;
    page.value = 1;
    total.value = data.total;
    hasMore.value = data.hasMore;
  } catch (e) {
    if (seq !== reqSeq) return;
    error.value = e;
  } finally {
    if (seq === reqSeq) {
      loading.value = false;
      loaded.value = true;
    }
  }
}

// P3-1：页码只在成功拿到数据后推进，失败原地重试不跳页
async function loadMore() {
  // 首屏/切换类请求进行中时不允许追加，避免用旧页码混入新分类数据
  if (loading.value) return;
  const seq = ++reqSeq;
  const nextPage = page.value + 1;
  loadingMore.value = true;
  loadMoreError.value = false;
  try {
    const data = await api.getVideos(queryParams(nextPage));
    if (seq !== reqSeq) return;
    videos.value = [...videos.value, ...data.list];
    page.value = nextPage; // 成功后才推进
    total.value = data.total;
    hasMore.value = data.hasMore;
  } catch (e) {
    if (seq !== reqSeq) return;
    loadMoreError.value = true;
  } finally {
    if (seq === reqSeq) loadingMore.value = false;
  }
}

function openVideo(v) {
  // P3-11：跳详情前保存列表上下文（频道/关键词/页码/数据/滚动位置）
  saveHomeContext({
    channel: activeChannel.value,
    keyword: keyword.value,
    videos: videos.value,
    page: page.value,
    hasMore: hasMore.value,
    total: total.value,
    scrollY: window.scrollY,
  });
  router.push(`/video/${v.id}`);
}

function clearSearch() {
  keyword.value = '';
  // 仅当 URL 上确有 keyword 时才需要改写路由，并跳过 watcher 的重复请求
  if (route.query.keyword) {
    skipKwWatch = true;
    router.replace({ path: '/' });
  }
  fetchVideos();
}

function onLater() {
  toast('「稍后再看」V0 暂未开放');
}

// 分类切换 → 重新拉取
watch(activeChannel, () => fetchVideos());

// URL keyword 变化（顶部搜索 / 清空 / 上下文回填）
watch(
  () => route.query.keyword,
  (kw) => {
    const next = kw ? String(kw) : '';
    if (skipKwWatch) {
      skipKwWatch = false;
      keyword.value = next;
      return;
    }
    if (next === keyword.value) return; // 已同步（如恢复上下文时的回填）
    keyword.value = next;
    fetchVideos();
  }
);

// P3-11：恢复上下文时把 keyword 回填到 URL（不触发请求）
if (saved?.keyword && String(route.query.keyword || '') !== saved.keyword) {
  skipKwWatch = true;
  router.replace({ path: '/', query: { keyword: saved.keyword } });
}

onMounted(() => {
  api
    .getChannels()
    .then((ch) => {
      channels.value = ch;
    })
    .catch((e) => {
      // 频道加载失败不阻塞主列表；打印日志（P3-2：无未处理 rejection）
      console.error('加载频道失败', e);
    });

  if (saved) {
    // 数据已在 setup 中同步恢复，只需还原滚动位置
    nextTick(() => window.scrollTo({ top: saved.scrollY || 0 }));
  } else {
    fetchVideos();
  }
});
</script>

<template>
  <main class="home">
    <ChannelTabs v-model="activeChannel" :channels="channels" />

    <div class="container">
      <!-- 搜索结果提示条 -->
      <div v-if="keyword" class="search-banner">
        <span>
          “<b>{{ keyword }}</b>” 的搜索结果，共 {{ total }} 个视频
        </span>
        <button class="clear-btn" @click="clearSearch">清空搜索 ✕</button>
      </div>

      <!-- P3-2：错误态（区别于空结果），提供重试 -->
      <div v-if="error" class="state error-state">
        <p>加载失败：后端服务不可用或网络异常</p>
        <button class="retry-btn" @click="fetchVideos">重试</button>
      </div>
      <!-- P3-3：首屏加载态；只有"完成加载且零结果"才显示空态 -->
      <div v-else-if="loading && !videos.length" class="state">正在加载视频流…</div>
      <div v-else-if="loaded && !videos.length" class="state">
        没有找到相关视频，换个关键词或分类试试～
      </div>
      <!-- 视频流网格 -->
      <div v-else class="grid">
        <VideoCard v-for="v in videos" :key="v.id" :video="v" @click="openVideo" @later="onLater" />
      </div>

      <!-- 加载更多 -->
      <div v-if="videos.length && !error" class="load-more">
        <span v-if="loadMoreError" class="load-err">
          加载失败
          <button :disabled="loadingMore" @click="loadMore">重试</button>
        </span>
        <button v-else-if="hasMore" :disabled="loadingMore || loading" @click="loadMore">
          {{ loadingMore ? '加载中…' : '加载更多' }}
        </button>
        <span v-else class="end">已经到底啦 ~</span>
      </div>
    </div>

    <footer class="footer">
      <p>哔哩哔哩克隆 · 学习用途 · 数据来自 bilibili 公开接口（80 条真实视频），播放内容为本地样例视频</p>
    </footer>
  </main>
</template>

<style scoped>
.home {
  flex: 1;
  margin-top: var(--header-h);
  display: flex;
  flex-direction: column;
}

.search-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 16px;
  margin: 8px 0 14px;
  font-size: 14px;
  color: var(--text-sub);
}
.search-banner b {
  color: var(--bili-pink);
}
.clear-btn {
  font-size: 13px;
  color: var(--text-sub);
  padding: 4px 10px;
  border-radius: 6px;
}
.clear-btn:hover {
  color: var(--bili-pink);
  background: #fff0f5;
}

.state {
  padding: 90px 0;
  text-align: center;
  color: var(--text-light);
  font-size: 15px;
}
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  color: #f66;
}
.retry-btn {
  padding: 8px 30px;
  font-size: 14px;
  color: var(--bili-pink);
  background: #fff;
  border: 1px solid var(--bili-pink);
  border-radius: 8px;
}
.retry-btn:hover {
  background: var(--bili-pink);
  color: #fff;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(235px, 1fr));
  gap: 16px;
  padding: 8px 0 20px;
}

.load-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0 40px;
}
.load-more button {
  padding: 10px 44px;
  font-size: 14px;
  color: var(--bili-pink);
  background: #fff;
  border: 1px solid var(--bili-pink);
  border-radius: 8px;
  transition: all 0.15s;
}
.load-more button:hover:not(:disabled) {
  background: var(--bili-pink);
  color: #fff;
}
.load-more button:disabled {
  opacity: 0.6;
  cursor: default;
}
.load-err {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #f66;
  font-size: 14px;
}
.load-err button {
  padding: 8px 26px;
}
.end {
  color: var(--text-light);
  font-size: 13px;
}

.footer {
  border-top: 1px solid var(--border);
  padding: 18px 0 26px;
  text-align: center;
  color: var(--text-light);
  font-size: 12px;
}
</style>
