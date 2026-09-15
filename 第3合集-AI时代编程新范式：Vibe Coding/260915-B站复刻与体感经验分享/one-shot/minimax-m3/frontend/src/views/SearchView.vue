<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, type Video } from '@/api'
import { useUIStore } from '@/stores/ui'
import VideoCard from '@/components/VideoCard.vue'

const route = useRoute()
const router = useRouter()
const ui = useUIStore()

const kw = ref(String(route.query.kw ?? ''))
const items = ref<Video[]>([])
const total = ref(0)
const loading = ref(false)

const FILTERS: { key: string; label: string; sort?: 'views' | 'pubdate' | 'likes' }[] = [
  { key: 'default', label: '综合' },
  { key: 'views', label: '播放多', sort: 'views' },
  { key: 'likes', label: '点赞多', sort: 'likes' },
  { key: 'pubdate', label: '最新', sort: 'pubdate' },
]
const filterKey = ref('default')

async function load() {
  if (!kw.value.trim()) {
    items.value = []
    total.value = 0
    return
  }
  loading.value = true
  try {
    const r = await api.search(kw.value, 100)
    items.value = r.data.items
    total.value = r.data.total
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => route.query.kw, (v) => {
  kw.value = String(v ?? '')
  load()
})

const sortedItems = computed(() => {
  const arr = [...items.value]
  const cur = FILTERS.find((f) => f.key === filterKey.value)
  if (cur?.sort) {
    arr.sort((a, b) => (b[cur.sort!] as number) - (a[cur.sort!] as number))
  }
  return arr
})

function clearAndGoHome() {
  ui.clearHistory()
  router.push('/')
}
</script>

<template>
  <div class="search-view">
    <div class="container">
      <div class="search-head">
        <h1 class="title">
          搜索结果：<span class="kw">"{{ kw }}"</span>
        </h1>
        <div class="meta">
          找到约 <strong>{{ total }}</strong> 条结果
          <button v-if="ui.searchHistory.length" class="link-btn" @click="clearAndGoHome">清空搜索历史</button>
        </div>
      </div>
      <div class="filter-tabs">
        <button
          v-for="f in FILTERS"
          :key="f.key"
          class="tab"
          :class="{ active: filterKey === f.key }"
          @click="filterKey = f.key"
        >
          {{ f.label }}
        </button>
      </div>
      <div v-if="!kw" class="empty">
        <p>请输入关键词搜索。</p>
        <div v-if="ui.searchHistory.length" class="history">
          <h3>历史搜索</h3>
          <div class="tags">
            <span v-for="h in ui.searchHistory" :key="h" class="tag" @click="router.push({ name: 'search', query: { kw: h } })">
              {{ h }}
            </span>
          </div>
        </div>
      </div>
      <div v-else-if="loading" class="loading">搜索中…</div>
      <div v-else-if="!items.length" class="empty">没有找到相关视频，试试别的关键词？</div>
      <div v-else class="grid">
        <VideoCard v-for="v in sortedItems" :key="v.bvid" :video="v" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-view {
  padding: 16px 0 32px;
}
.search-head {
  padding: 16px 0 8px;
  .title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 4px;
    .kw {
      color: var(--brand);
    }
  }
  .meta {
    font-size: 13px;
    color: var(--text-3);
    strong {
      color: var(--brand);
      font-weight: 600;
    }
    .link-btn {
      margin-left: 12px;
      color: var(--blue-link);
      font-size: 12px;
      &:hover {
        color: var(--brand);
      }
    }
  }
}
.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-2);
  .tab {
    padding: 6px 16px;
    font-size: 13px;
    color: var(--text-2);
    border-radius: 14px;
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
.empty,
.loading {
  text-align: center;
  padding: 60px 0;
  color: var(--text-3);
  .history {
    margin-top: 16px;
    h3 {
      font-size: 14px;
      margin-bottom: 8px;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
    }
    .tag {
      padding: 4px 12px;
      background: var(--bg-2);
      border-radius: 14px;
      font-size: 13px;
      cursor: pointer;
      &:hover {
        background: var(--brand);
        color: #fff;
      }
    }
  }
}
</style>
