<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import Icon from '@/components/common/Icon.vue';
import VideoCard from '@/components/video/VideoCard.vue';
import VideoCardSkeleton from '@/components/video/VideoCardSkeleton.vue';
import { useHistoryStore } from '@/stores/history';

/** 历史记录页：展示观看进度（播放器上报），支持清空 */
const history = useHistoryStore();

onMounted(() => {
  document.title = '历史记录 - 哔哩哔哩';
  void history.load(true);
});

async function clearAll() {
  await history.clear();
}
</script>

<template>
  <div class="history bili-container">
    <header class="history__head">
      <div class="history__title">
        <Icon name="i-history" :size="26" />
        <h1>历史记录</h1>
        <span class="history__count">{{ history.items.length }} 条</span>
      </div>
      <div class="history__actions">
        <button class="btn-ghost history__clear" :disabled="!history.items.length" @click="clearAll">
          清空历史
        </button>
      </div>
    </header>

    <div v-if="history.items.length" class="history__list">
      <div class="history__time">今天 · 最近观看</div>
      <div class="history__grid">
        <VideoCard
          v-for="item in history.items"
          :key="item.bvid"
          :video="item"
          :progress="item.progress"
        />
      </div>
    </div>
    <div v-else-if="history.loading" class="history__grid">
      <VideoCardSkeleton v-for="i in 4" :key="i" />
    </div>

    <div v-else-if="history.error" class="history__empty">
      <p>{{ history.error }}</p>
      <button class="btn-primary history__go" @click="history.load(true)">重试</button>
    </div>

    <div v-else class="history__empty">
      <p>还没有观看记录</p>
      <RouterLink to="/" class="btn-primary history__go">去首页看看</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.history {
  padding: 22px 0 40px;
}
.history__head {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line-light);
}
.history__title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--bili-pink);
}
.history__title h1 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-1);
}
.history__count {
  font-size: 13px;
  color: var(--text-3);
}
.history__actions {
  margin-left: auto;
}
.history__clear {
  padding: 7px 16px;
  font-size: 13px;
}
.history__clear:disabled {
  color: var(--text-4);
  cursor: not-allowed;
}
.history__time {
  padding: 16px 0 6px;
  font-size: 14px;
  font-weight: 600;
}
.history__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 8px;
}
@media (max-width: 1100px) {
  .history__grid {
    grid-template-columns: 1fr;
  }
}
.history__empty {
  padding: 100px 0;
  text-align: center;
  color: var(--text-3);
}
.history__go {
  display: inline-block;
  margin-top: 16px;
  padding: 8px 22px;
  font-size: 14px;
}
</style>
