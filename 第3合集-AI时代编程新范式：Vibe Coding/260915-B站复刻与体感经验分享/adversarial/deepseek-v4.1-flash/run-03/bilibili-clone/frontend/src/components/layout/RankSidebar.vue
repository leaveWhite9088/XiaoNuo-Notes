<script setup lang="ts">
import { useRouter } from 'vue-router';
import Icon from '@/components/common/Icon.vue';
import type { RankItem } from '@/types';
import { PLACEHOLDER_COVER } from '@/utils';

/** 侧栏：排行榜 + 热搜榜（搜索页右侧，数据来自后端 /api/sidebar 与 /api/search/hot） */
defineProps<{ ranking: RankItem[]; hotSearch: string[] }>();
const router = useRouter();
</script>

<template>
  <aside class="side">
    <section class="side__block">
      <header class="side__head">
        <Icon name="i-fire" :size="16" class="side__head-icon" />
        <h3>全站排行榜</h3>
      </header>
      <ul class="rank">
        <li
          v-for="item in ranking"
          :key="item.bvid"
          class="rank__item"
          @click="router.push({ name: 'video', params: { bvid: item.bvid } })"
        >
          <span class="rank__no" :class="`rank__no--${item.rank <= 3 ? item.rank : 'n'}`">{{ item.rank }}</span>
          <img
            class="rank__cover"
            :src="item.cover || PLACEHOLDER_COVER"
            alt=""
            loading="lazy"
            @error="($event.target as HTMLImageElement).src = PLACEHOLDER_COVER"
          />
          <span class="rank__body">
            <span class="rank__title clamp-2">{{ item.title }}</span>
            <span class="rank__meta">
              <Icon name="i-play" :size="11" />{{ item.playText }}
              <Icon name="i-danmaku" :size="11" />{{ item.danmakuText }}
            </span>
          </span>
        </li>
      </ul>
    </section>

    <section class="side__block">
      <header class="side__head">
        <Icon name="i-search" :size="16" class="side__head-icon" />
        <h3>热搜榜</h3>
      </header>
      <ul class="hot">
        <li
          v-for="(kw, i) in hotSearch"
          :key="kw"
          class="hot__item"
          @click="router.push({ name: 'search', query: { keyword: kw } })"
        >
          <span class="hot__no" :class="`hot__no--${i < 3 ? 'top' : 'n'}`">{{ i + 1 }}</span>
          <span class="hot__text ellipsis">{{ kw }}</span>
        </li>
      </ul>
    </section>
  </aside>
</template>

<style scoped>
.side {
  width: 320px;
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.side__block {
  background: #fff;
  border: 1px solid var(--line-light);
  border-radius: var(--radius-lg);
  padding: 14px 14px 8px;
}
.side__head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line-light);
}
.side__head h3 {
  font-size: 14px;
  font-weight: 600;
}
.side__head-icon {
  color: #fe2d46;
}
.rank__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.16s;
}
.rank__item:hover {
  background: var(--bg-gray);
}
.rank__item:hover .rank__title {
  color: var(--bili-pink);
}
.rank__no {
  width: 18px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  font-style: italic;
  color: var(--text-3);
  flex: none;
}
.rank__no--1 {
  color: #fe2d46;
}
.rank__no--2 {
  color: #ff6600;
}
.rank__no--3 {
  color: #faa90e;
}
.rank__cover {
  width: 68px;
  height: 42px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex: none;
}
.rank__body {
  min-width: 0;
  flex: 1;
}
.rank__title {
  font-size: 13px;
  line-height: 1.35;
  transition: color 0.16s;
}
.rank__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 3px;
  font-size: 11px;
  color: var(--text-3);
}
.hot__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 4px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.16s;
}
.hot__item:hover {
  background: var(--bg-gray);
  color: var(--bili-pink);
}
.hot__no {
  width: 18px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  font-style: italic;
  color: var(--text-3);
  flex: none;
}
.hot__no--top {
  color: #fe2d46;
}
.hot__text {
  font-size: 13px;
}
</style>
