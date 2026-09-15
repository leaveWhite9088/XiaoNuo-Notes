<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import Icon from '@/components/common/Icon.vue';
import { meApi } from '@/api';
import type { VideoCard } from '@/types';
import { PLACEHOLDER_COVER } from '@/utils';

/**
 * 顶栏下拉面板：消息 / 动态 / 收藏 / 创作中心。
 * 全部走后端真实接口，避免「点了没反应」的空交互。
 */
const props = defineProps<{ type: 'message' | 'dynamic' | 'favorite' | 'creator' }>();
const router = useRouter();

const loading = ref(false);
const error = ref('');
const videos = ref<VideoCard[]>([]);
const notices = ref<{ id: string; type: string; title: string; desc: string; bvid?: string }[]>([]);
const stats = ref<{ faved: number; liked: number; coined: number; followed: number; watched: number; note: string } | null>(
  null,
);
const source = ref<'following' | 'latest'>('latest');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    if (props.type === 'message') {
      const data = await meApi.notifications();
      notices.value = data.items;
    } else if (props.type === 'dynamic') {
      const data = await meApi.dynamics(6);
      videos.value = data.list;
      source.value = data.source;
    } else if (props.type === 'favorite') {
      const data = await meApi.favorites(6);
      videos.value = data.list;
    } else {
      stats.value = await meApi.creatorStats();
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败';
  } finally {
    loading.value = false;
  }
}

function open(bvid?: string) {
  if (!bvid) return;
  void router.push({ name: 'video', params: { bvid } });
}

onMounted(load);
watch(() => props.type, load);
</script>

<template>
  <div class="panel">
    <div v-if="loading" class="panel__state">加载中...</div>
    <div v-else-if="error" class="panel__state panel__state--error">{{ error }}</div>

    <template v-else>
      <!-- 消息 -->
      <template v-if="type === 'message'">
        <ul class="msg">
          <li v-for="item in notices" :key="item.id" class="msg__item" @click="open(item.bvid)">
            <span class="msg__type">{{ item.type }}</span>
            <span class="msg__body">
              <b class="ellipsis">{{ item.title }}</b>
              <em class="ellipsis">{{ item.desc }}</em>
            </span>
          </li>
        </ul>
        <p class="panel__note">消息为演示数据（本站无账号体系）</p>
      </template>

      <!-- 动态 / 收藏 -->
      <template v-else-if="type === 'dynamic' || type === 'favorite'">
        <p v-if="type === 'dynamic'" class="panel__note panel__note--top">
          {{ source === 'following' ? '你关注的 UP 主最新投稿' : '你还没有关注 UP 主，先看看全站最新' }}
        </p>
        <ul v-if="videos.length" class="videos">
          <li v-for="v in videos" :key="v.bvid" class="videos__item" @click="open(v.bvid)">
            <img
              class="videos__cover"
              :src="v.cover || PLACEHOLDER_COVER"
              alt=""
              @error="($event.target as HTMLImageElement).src = PLACEHOLDER_COVER"
            />
            <span class="videos__body">
              <b class="clamp-2">{{ v.title }}</b>
              <em>{{ v.owner.name }} · {{ v.playText }}播放</em>
            </span>
          </li>
        </ul>
        <div v-else class="panel__state">
          {{ type === 'favorite' ? '还没有收藏任何视频，点开一个视频试试「收藏」' : '暂无动态' }}
        </div>
      </template>

      <!-- 创作中心 -->
      <template v-else>
        <div class="stats">
          <div class="stats__cell"><b>{{ stats?.watched ?? 0 }}</b><em>观看</em></div>
          <div class="stats__cell"><b>{{ stats?.faved ?? 0 }}</b><em>收藏</em></div>
          <div class="stats__cell"><b>{{ stats?.liked ?? 0 }}</b><em>点赞</em></div>
          <div class="stats__cell"><b>{{ stats?.followed ?? 0 }}</b><em>关注</em></div>
        </div>
        <p class="panel__note">{{ stats?.note }}</p>
        <button class="panel__action" @click="router.push({ name: 'history' })">
          <Icon name="i-history" :size="14" />查看观看历史
        </button>
      </template>
    </template>
  </div>
</template>

<style scoped>
.panel {
  width: 300px;
}
.panel__state {
  padding: 26px 16px;
  text-align: center;
  font-size: 13px;
  color: var(--text-3);
}
.panel__state--error {
  color: #fe2d46;
}
.panel__note {
  padding: 8px 14px 10px;
  font-size: 12px;
  color: var(--text-3);
  border-top: 1px solid var(--line-light);
}
.panel__note--top {
  border-top: none;
  padding-bottom: 4px;
}
.panel__action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  padding: 9px;
  font-size: 13px;
  color: var(--bili-pink);
  border-top: 1px solid var(--line-light);
}
.panel__action:hover {
  background: var(--bili-pink-light);
}
.msg__item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s;
}
.msg__item:hover {
  background: var(--bg-gray);
}
.msg__type {
  flex: none;
  padding: 1px 6px;
  border-radius: 3px;
  background: var(--bili-pink-light);
  color: var(--bili-pink);
  font-size: 11px;
}
.msg__body {
  min-width: 0;
}
.msg__body b {
  display: block;
  font-size: 13px;
  font-weight: 500;
}
.msg__body em {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  font-style: normal;
  color: var(--text-3);
}
.videos__item {
  display: flex;
  gap: 10px;
  padding: 8px 14px;
  cursor: pointer;
  transition: background 0.15s;
}
.videos__item:hover {
  background: var(--bg-gray);
}
.videos__cover {
  width: 74px;
  height: 46px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex: none;
}
.videos__body {
  min-width: 0;
}
.videos__body b {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.35;
}
.videos__body em {
  display: block;
  margin-top: 3px;
  font-size: 11px;
  font-style: normal;
  color: var(--text-3);
}
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 14px 8px;
}
.stats__cell {
  text-align: center;
}
.stats__cell b {
  display: block;
  font-size: 17px;
  color: var(--bili-pink);
}
.stats__cell em {
  font-size: 11px;
  font-style: normal;
  color: var(--text-3);
}
</style>
