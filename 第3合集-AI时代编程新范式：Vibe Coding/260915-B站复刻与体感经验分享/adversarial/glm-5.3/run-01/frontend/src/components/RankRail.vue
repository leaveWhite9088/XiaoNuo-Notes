<script setup>
/** 首页右侧排行榜（≥1440px 显示）：今日/三日 双榜，点击跳详情 */
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';
import { formatCount } from '../utils/format';

const router = useRouter();
const raw = ref([]);
const tab = ref('today');
const loaded = ref(false);
const failed = ref(false);

async function loadRank() {
  failed.value = false;
  try {
    raw.value = (await api.rank()).list;
    loaded.value = true;
  } catch {
    failed.value = true;
  }
}
loadRank();

const list = computed(() => {
  const arr = [...raw.value];
  return tab.value === 'today' ? arr.sort((a, b) => b.view - a.view) : arr.sort((a, b) => b.like - a.like);
});
</script>

<template>
  <aside class="rank-rail">
    <div class="rank-head">
      <span class="rank-title">排行榜</span>
      <div class="tabs">
        <button :class="{ active: tab === 'today' }" @click="tab = 'today'">今日</button>
        <button :class="{ active: tab === 'threeday' }" @click="tab = 'threeday'">三日</button>
      </div>
    </div>
    <div v-if="!loaded && failed" class="rank-loading">
      排行榜加载失败，
      <a href="javascript:;" class="retry" @click="loadRank">点击重试</a>
    </div>
    <div v-else-if="!loaded" class="rank-loading">加载中…</div>
    <a v-for="(item, i) in list" :key="item.bvid" class="rank-item" href="javascript:;" @click="router.push({ name: 'video', params: { id: item.bvid } })">
      <span class="no" :class="{ top: i < 3 }">{{ i + 1 }}</span>
      <span class="rank-info">
        <span class="clamp-2">{{ item.title }}</span>
        <small>{{ formatCount(item.view) }}播放 · {{ item.owner }}</small>
      </span>
      <span class="score">{{ formatCount(tab === 'today' ? item.view : item.like) }}<i>{{ tab === 'today' ? '综合' : '点赞' }}</i></span>
    </a>
  </aside>
</template>

<style scoped>
.rank-rail {
  width: 280px;
  flex-shrink: 0;
  background: var(--white);
  border-radius: 10px;
  padding: 14px 12px;
  align-self: flex-start;
  position: sticky;
  top: calc(var(--header-h) + 16px);
}
.rank-head { display: flex; align-items: center; justify-content: space-between; padding: 0 4px 10px; }
.rank-title { font-size: 15px; font-weight: 600; }
.tabs { display: flex; gap: 2px; }
.tabs button {
  border: none;
  background: transparent;
  color: var(--text-3);
  font-size: 12.5px;
  padding: 3px 10px;
  border-radius: 6px;
  cursor: pointer;
}
.tabs button.active { background: var(--bili-pink-light); color: var(--bili-pink); font-weight: 600; }
.rank-loading { color: var(--text-3); font-size: 13px; text-align: center; padding: 20px 0; }
.rank-loading .retry { color: var(--bili-pink); }
.rank-item {
  display: flex;
  gap: 10px;
  padding: 9px 6px;
  border-radius: 8px;
  align-items: flex-start;
}
.rank-item:hover { background: var(--bg-2); }
.no {
  width: 18px;
  font-size: 15px;
  font-weight: 700;
  font-style: italic;
  color: var(--text-3);
  text-align: center;
  flex-shrink: 0;
  padding-top: 1px;
}
.no.top { color: var(--bili-pink); }
.rank-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; font-size: 13px; line-height: 17px; }
.rank-info small { color: var(--text-3); font-size: 12px; }
.score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 13px;
  color: var(--bili-pink);
  font-weight: 600;
  flex-shrink: 0;
}
.score i { font-style: normal; font-size: 11px; color: var(--text-3); font-weight: 400; }
@media (max-width: 1439px) {
  .rank-rail { display: none; }
}
</style>
