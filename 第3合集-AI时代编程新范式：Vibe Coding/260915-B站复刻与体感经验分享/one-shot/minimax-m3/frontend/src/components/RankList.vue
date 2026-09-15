<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { api, formatViews, type Video } from '@/api'

const props = withDefaults(
  defineProps<{
    rid?: number
    title?: string
    limit?: number
  }>(),
  { rid: 0, title: '热门', limit: 10 },
)

const list = ref<Video[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    if (props.rid > 0) {
      const r = await api.channel(props.rid, 1, props.limit)
      list.value = r.data.items.slice(0, props.limit)
    } else {
      const r = await api.hot(props.limit)
      list.value = r.data.items
    }
  } catch (e: any) {
    error.value = e?.message ?? '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => props.rid, load)
</script>

<template>
  <div class="rank-list">
    <div class="rank-head">
      <h3 class="rank-title">{{ title }}</h3>
      <button class="refresh" @click="load" title="刷新">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M17.65 6.35A8 8 0 1 0 19.73 14h-2.1A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
        </svg>
      </button>
    </div>
    <ol v-if="!loading && list.length" class="rank-items">
      <li v-for="(v, idx) in list" :key="v.bvid" :class="{ top3: idx < 3 }">
        <span class="rank-no">{{ idx + 1 }}</span>
        <RouterLink :to="`/video/${v.bvid}`" class="rank-title-link">
          <span class="rank-video-title ellipsis-2" :title="v.title">{{ v.title }}</span>
          <span class="rank-meta">
            <span class="rank-views">{{ formatViews(v.views) }}播放</span>
            <span class="rank-typename" v-if="v.typename">· {{ v.typename }}</span>
          </span>
        </RouterLink>
      </li>
    </ol>
    <div v-else-if="loading" class="loading">加载中…</div>
    <div v-else-if="error" class="error">{{ error }}</div>
  </div>
</template>

<style lang="scss" scoped>
.rank-list {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 16px 0;
  .rank-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px 12px;
    border-bottom: 1px solid var(--border-2);
    .rank-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin: 0;
    }
    .refresh {
      color: var(--text-3);
      &:hover {
        color: var(--brand);
      }
    }
  }
  .rank-items {
    padding: 8px 0;
    li {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 8px 16px;
      transition: background 0.15s;
      &:hover {
        background: var(--bg-2);
      }
      .rank-no {
        font-size: 14px;
        color: var(--text-3);
        font-weight: 600;
        width: 18px;
        text-align: center;
        flex-shrink: 0;
        margin-top: 2px;
        font-family: 'Helvetica Neue', sans-serif;
      }
      &.top3 .rank-no {
        color: var(--brand);
        font-weight: 700;
      }
      .rank-title-link {
        flex: 1;
        color: var(--text);
        display: flex;
        flex-direction: column;
        gap: 2px;
        .rank-video-title {
          font-size: 13px;
          line-height: 1.4;
        }
        .rank-meta {
          font-size: 11px;
          color: var(--text-3);
          .rank-typename {
            margin-left: 2px;
          }
        }
        &:hover .rank-video-title {
          color: var(--brand);
        }
      }
    }
  }
  .loading,
  .error {
    padding: 20px 16px;
    text-align: center;
    color: var(--text-3);
    font-size: 13px;
  }
  .error {
    color: #d65481;
  }
}
</style>
