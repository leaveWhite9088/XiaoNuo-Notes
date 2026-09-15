<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { api, type Video, type Category } from '@/api'
import VideoCard from '@/components/VideoCard.vue'

const route = useRoute()
const tid = computed(() => Number(route.params.tid))
const category = ref<Category | null>(null)
const items = ref<Video[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 30
const hasMore = ref(false)
const loading = ref(false)
const sortKey = ref<'latest' | 'hot' | 'view'>('hot')

const SORT_TABS: { key: 'latest' | 'hot' | 'view'; label: string }[] = [
  { key: 'hot', label: '热门' },
  { key: 'latest', label: '最新' },
  { key: 'view', label: '播放多' },
]

async function load(reset = false) {
  loading.value = true
  try {
    const r = await api.channel(tid.value, reset ? 1 : page.value, pageSize)
    category.value = r.data.category
    total.value = r.data.total
    hasMore.value = r.data.hasMore
    if (reset) items.value = r.data.items
    else items.value = items.value.concat(r.data.items)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => load(true))
watch(tid, () => {
  page.value = 1
  load(true)
})

const sortedItems = computed(() => {
  const arr = [...items.value]
  if (sortKey.value === 'latest') arr.sort((a, b) => b.pubdate - a.pubdate)
  else if (sortKey.value === 'view') arr.sort((a, b) => b.views - a.views)
  else arr.sort((a, b) => b.likes - a.likes)
  return arr
})

function loadMore() {
  if (loading.value || !hasMore.value) return
  page.value += 1
  load(false)
}
</script>

<template>
  <div class="channel-view">
    <div class="container">
      <div class="channel-head">
        <div class="head-info">
          <h1 class="channel-title">{{ category?.name ?? '频道' }}</h1>
          <p v-if="category" class="channel-desc">{{ category.description }}</p>
        </div>
      </div>
      <div class="sort-tabs">
        <button
          v-for="t in SORT_TABS"
          :key="t.key"
          class="tab"
          :class="{ active: sortKey === t.key }"
          @click="sortKey = t.key"
        >
          {{ t.label }}
        </button>
        <span class="total">共 {{ total }} 个视频</span>
      </div>
      <div class="grid">
        <VideoCard v-for="v in sortedItems" :key="v.bvid" :video="v" />
      </div>
      <div class="load-more">
        <button v-if="hasMore" class="btn-ghost" :disabled="loading" @click="loadMore">
          {{ loading ? '加载中…' : '加载更多' }}
        </button>
        <span v-else class="no-more">没有更多了</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.channel-view {
  padding: 16px 0 32px;
}
.channel-head {
  padding: 16px 0 24px;
  .head-info {
    display: flex;
    align-items: baseline;
    gap: 16px;
  }
  .channel-title {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
  }
  .channel-desc {
    margin: 0;
    color: var(--text-3);
    font-size: 13px;
  }
}
.sort-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 0 0 8px;
  border-bottom: 1px solid var(--border-2);
  .tab {
    padding: 8px 16px;
    font-size: 14px;
    color: var(--text-2);
    border-radius: 16px;
    transition: background 0.15s, color 0.15s;
    &:hover {
      background: var(--bg-2);
      color: var(--brand);
    }
    &.active {
      background: var(--brand);
      color: #fff;
    }
  }
  .total {
    margin-left: auto;
    font-size: 12px;
    color: var(--text-3);
  }
}
.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px 12px;
}
@media (max-width: 1100px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 880px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.load-more {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  .no-more {
    color: var(--text-3);
    font-size: 13px;
  }
}
</style>
