<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../api';
import { useUserStore } from '../stores/user';
import { formatCount, formatDuration, formatDate } from '../utils/format';

const route = useRoute();
const router = useRouter();
const user = useUserStore();

const q = computed(() => String(route.query.q || '').trim());
const results = ref([]);
const total = ref(0);
const hasMore = ref(false);
const page = ref(1);
const loading = ref(false);
const error = ref('');
const filter = ref('all'); // all=视频+UP主 / video=仅视频 / up=仅UP主

// 代际令牌：连续换词搜索时作废在途旧请求
let gen = 0;

async function search(reset = true) {
  if (!q.value) return;
  if (reset) {
    gen += 1;
    results.value = [];
    page.value = 1;
    hasMore.value = false;
    error.value = '';
  }
  const g = gen;
  loading.value = true;
  try {
    const res = await api.search(q.value, page.value);
    if (g !== gen) return;
    results.value.push(...res.list);
    total.value = res.total;
    hasMore.value = res.hasMore;
    user.pushSearch(q.value);
  } catch (e) {
    if (g === gen) error.value = '搜索失败，请检查后端服务后重试';
  } finally {
    if (g === gen) loading.value = false;
  }
}

function loadMore() {
  if (!hasMore.value || loading.value) return;
  page.value += 1;
  search(false);
}

/** 结果中的 UP 主（去重计数），供"UP主"页签与"全部"页签的 UP 主行使用 */
const owners = computed(() => {
  const map = new Map();
  for (const v of results.value) {
    const cur = map.get(v.owner.mid) || { mid: v.owner.mid, name: v.owner.name, count: 0 };
    cur.count += 1;
    map.set(v.owner.mid, cur);
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
});

function searchOwner(name) {
  router.push({ name: 'search', query: { q: name } });
}

/** 标题按关键词分段高亮 */
function segs(text) {
  const kw = q.value;
  if (!kw) return [{ text, hit: false }];
  const out = [];
  let rest = text;
  let guard = 0;
  while (rest && kw && guard++ < 20) {
    const idx = rest.toLowerCase().indexOf(kw.toLowerCase());
    if (idx < 0) break;
    if (idx > 0) out.push({ text: rest.slice(0, idx), hit: false });
    out.push({ text: rest.slice(idx, idx + kw.length), hit: true });
    rest = rest.slice(idx + kw.length);
  }
  if (rest) out.push({ text: rest, hit: false });
  return out;
}

watch(q, () => {
  filter.value = 'all'; // 换搜索词回到"全部"页签，避免沿用旧筛选误判空结果
  search(true);
});
onMounted(() => search(true));
</script>

<template>
  <div class="search-wrap">
    <div class="search-inner">
      <div class="filter-bar">
        <button :class="{ active: filter === 'all' }" @click="filter = 'all'">全部</button>
        <button :class="{ active: filter === 'video' }" @click="filter = 'video'">视频</button>
        <button :class="{ active: filter === 'up' }" @click="filter = 'up'">UP主</button>
        <span class="result-count" v-if="total && filter !== 'up'">共 {{ total }} 条结果</span>
        <span class="result-count" v-if="filter === 'up'">共 {{ owners.length }} 位相关 UP 主</span>
      </div>

      <div v-if="loading && !results.length && filter !== 'up'" class="list-loading">搜索中…</div>

      <div v-else-if="error" class="empty">
        <p>{{ error }}</p>
        <button @click="search(true)">重试</button>
      </div>

      <div v-else-if="!q" class="empty">
        <p>输入关键词开始搜索吧</p>
      </div>

      <div v-else-if="!results.length && !loading" class="empty">
        <p>很抱歉，没有找到与 “{{ q }}” 相关的视频</p>
        <small>试试其他关键词，或从热搜榜逛逛</small>
        <button class="back-home" @click="router.push('/')">返回首页</button>
      </div>

      <template v-else>
        <!-- UP 主区：UP主页签或全部页签都展示 -->
        <div v-if="filter !== 'video' && owners.length" class="owner-section">
          <div class="owner-title">相关 UP 主</div>
          <a v-for="o in owners" :key="o.mid" class="owner-row" href="javascript:;" @click="searchOwner(o.name)">
            <span class="owner-avatar">{{ o.name.slice(0, 1) }}</span>
            <span class="owner-info">
              <b>{{ o.name }}</b>
              <small>{{ o.count }} 个相关视频</small>
            </span>
            <span class="owner-go">查看视频 ›</span>
          </a>
        </div>

        <!-- 视频区：全部/视频页签展示 -->
        <div v-if="filter !== 'up'" class="result-list">
          <a
            v-for="v in results"
            :key="v.bvid"
            class="result-item"
            href="javascript:;"
            @click="router.push({ name: 'video', params: { id: v.bvid } })"
          >
            <div class="thumb">
              <img :src="v.cover" :alt="v.title" loading="lazy" />
              <span class="dur">{{ formatDuration(v.duration) }}</span>
            </div>
            <div class="item-info">
              <p class="item-title">
                <template v-for="(s, i) in segs(v.title)" :key="i">
                  <em v-if="s.hit">{{ s.text }}</em><template v-else>{{ s.text }}</template>
                </template>
              </p>
              <p class="item-meta">{{ formatCount(v.stat.view) }}播放 · {{ formatCount(v.stat.danmaku) }}弹幕 · {{ formatDate(v.pubdate) }}</p>
              <p class="item-up">
                UP主：<b>{{ v.owner.name }}</b>
              </p>
              <p class="item-tags">
                <span class="tag">{{ v.regionLabel }}</span>
                <span v-if="v.tname" class="tag">{{ v.tname }}</span>
              </p>
            </div>
          </a>
          <div v-if="hasMore" class="load-more">
            <button :disabled="loading" @click="loadMore">{{ loading ? '加载中…' : '加载更多' }}</button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.search-wrap { background: var(--white); min-height: calc(100vh - var(--header-h)); padding: 20px 24px 60px; }
.search-inner { max-width: 1100px; margin: 0 auto; }

.filter-bar { display: flex; gap: 4px; border-bottom: 1px solid var(--line); padding-bottom: 12px; align-items: center; }
.filter-bar button {
  border: none;
  background: transparent;
  font-size: 15px;
  color: var(--text-2);
  padding: 6px 14px;
  cursor: pointer;
  border-radius: 6px;
}
.filter-bar button.active { color: var(--bili-pink); background: var(--bili-pink-light); font-weight: 600; }
.result-count { margin-left: auto; color: var(--text-3); font-size: 13px; }

.list-loading, .empty { text-align: center; color: var(--text-3); padding: 80px 0; }
.empty p { font-size: 16px; color: var(--text-2); }
.empty small { display: block; margin-top: 6px; }
.empty button {
  margin-top: 18px;
  border: none;
  background: var(--bili-pink);
  color: #fff;
  padding: 8px 26px;
  border-radius: 8px;
  cursor: pointer;
}
.empty button:hover { background: var(--bili-pink-hover); }
.back-home { margin-top: 18px; }

.owner-section { padding: 18px 0 6px; }
.owner-title { font-size: 14px; color: var(--text-3); margin-bottom: 10px; }
.owner-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 8px;
}
.owner-row:hover { background: var(--bg-2); }
.owner-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--bili-blue), #7ed8f7);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
}
.owner-info { display: flex; flex-direction: column; gap: 3px; }
.owner-info b { font-size: 14.5px; font-weight: 600; }
.owner-info small { color: var(--text-3); font-size: 12.5px; }
.owner-go { margin-left: auto; font-size: 13px; color: var(--bili-blue); }

.result-list { display: flex; flex-direction: column; }
.result-item { display: flex; gap: 16px; padding: 18px 8px; border-bottom: 1px solid var(--bg-2); border-radius: 8px; }
.result-item:hover { background: var(--bg-2); }
.thumb { position: relative; width: 240px; aspect-ratio: 16/9; border-radius: 6px; overflow: hidden; flex-shrink: 0; background: #e7e9eb; }
.thumb img { width: 100%; height: 100%; object-fit: cover; }
.dur { position: absolute; right: 5px; bottom: 5px; background: rgba(0,0,0,.65); color: #fff; font-size: 12px; padding: 2px 5px; border-radius: 3px; }

.item-info { min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.item-title { margin: 0; font-size: 16.5px; line-height: 24px; color: var(--text-1); }
.item-title em { color: var(--bili-pink); font-style: normal; }
.item-meta { margin: 0; color: var(--text-3); font-size: 13px; }
.item-up { margin: 0; color: var(--text-3); font-size: 13px; }
.item-up b { color: var(--text-2); font-weight: 500; }
.item-tags { margin: 0; display: flex; gap: 6px; }
.tag { background: var(--bg-2); color: var(--text-2); font-size: 12px; padding: 2px 8px; border-radius: 4px; }

.load-more { text-align: center; padding: 24px 0; }
.load-more button {
  border: 1px solid var(--line);
  background: var(--white);
  padding: 8px 40px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-2);
}
.load-more button:hover { color: var(--bili-pink); border-color: var(--bili-pink); }
</style>
