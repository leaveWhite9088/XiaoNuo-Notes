<template>
  <aside class="side-ranking">
    <div class="ranking-card">
      <div class="card-header">
        <span class="title">全站热播榜</span>
        <a class="more" href="#" @click.prevent>查看更多 ›</a>
      </div>
      <ol class="rank-list">
        <li v-for="(item, i) in items" :key="item.id" class="rank-item" @click="goVideo(item.id)">
          <span class="rank-num" :class="rankClass(i)">{{ i + 1 }}</span>
          <div class="rank-text">
            <div class="rank-title ellipsis-2">{{ item.title }}</div>
            <div class="rank-meta">
              <span v-if="item.score" class="rank-score">评分 {{ item.score }}</span>
              <span class="rank-play">{{ formatCount(item.playCount) }}播放</span>
              <span v-if="item.trend === 'up'" class="trend trend-up">▲</span>
              <span v-else-if="item.trend === 'down'" class="trend trend-down">▼</span>
              <span v-else class="trend">—</span>
            </div>
          </div>
        </li>
      </ol>
    </div>
    <div class="ranking-card promo">
      <p class="promo-title">成为大会员</p>
      <p class="promo-desc">畅享 4K HDR、杜比全景声、游戏礼包等专属权益</p>
      <button class="btn btn-primary promo-btn">立即开通</button>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { formatCount } from '@/utils/format';
defineProps({ items: { type: Array, default: () => [] } });
const router = useRouter();
function goVideo(id) { router.push({ name: 'video', params: { id } }); }
function rankClass(i) {
  if (i === 0) return 'r1';
  if (i === 1) return 'r2';
  if (i === 2) return 'r3';
  return '';
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.side-ranking { display: flex; flex-direction: column; gap: 16px; }
.ranking-card {
  background: #fff;
  border-radius: $radius-card;
  padding: 16px 14px;
  box-shadow: $shadow-card;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  .title { font-size: 16px; font-weight: 500; color: $bili-text; }
  .more { font-size: 12px; color: $bili-text-3; &:hover { color: $bili-pink; } }
}
.rank-list { display: flex; flex-direction: column; gap: 12px; }
.rank-item {
  display: flex;
  gap: 10px;
  cursor: pointer;
  &:hover .rank-title { color: $bili-pink; }
}
.rank-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 12px;
  font-weight: 600;
  color: $bili-text-3;
  background: $bili-tag-bg;
  border-radius: 2px;
  flex-shrink: 0;
  margin-top: 2px;
  &.r1 { color: #fff; background: $bili-rank-red; }
  &.r2 { color: #fff; background: $bili-rank-orange; }
  &.r3 { color: #fff; background: $bili-rank-blue; }
}
.rank-text { flex: 1; min-width: 0; }
.rank-title {
  font-size: 13px;
  line-height: 1.4;
  color: $bili-text;
  margin-bottom: 4px;
  transition: color 0.2s;
}
.rank-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: $bili-text-3;
}
.trend-up { color: $bili-pink; }
.trend-down { color: $bili-rank-blue; }
.trend { color: $bili-text-3; }

.promo { text-align: center; }
.promo-title { font-size: 16px; font-weight: 500; margin-bottom: 6px; }
.promo-desc { font-size: 12px; color: $bili-text-2; margin-bottom: 12px; line-height: 1.5; }
.promo-btn { width: 100%; height: 34px; border-radius: 17px; }
</style>
