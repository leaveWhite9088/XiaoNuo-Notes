<template>
  <main class="page-wrap search-page">
    <header>
      <h1>搜索「{{ q }}」</h1>
      <p>{{ total }} 个相关视频</p>
      <div class="filters">
        <button
          v-for="f in filters"
          :key="f.id"
          :class="{ on: channel === f.id }"
          type="button"
          @click="channel = f.id"
        >{{ f.name }}</button>
      </div>
    </header>
    <section class="grid">
      <VideoCard v-for="v in list" :key="v.bvid" :video="v" />
    </section>
    <p v-if="!list.length && !loading" class="empty">没有找到相关视频，换个词试试</p>
  </main>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import VideoCard from '../components/video/VideoCard.vue'
import { fetchVideos } from '../api/client'

const route = useRoute()
const q = ref('')
const list = ref([])
const total = ref(0)
const loading = ref(false)
const channel = ref('recommend')
const filters = [
  { id: 'recommend', name: '综合' },
  { id: 'tech', name: '科技' },
  { id: 'food', name: '美食' },
  { id: 'game', name: '游戏' },
  { id: 'music', name: '音乐' },
  { id: 'life', name: '生活' }
]

async function load() {
  q.value = String(route.query.q || '')
  loading.value = true
  const data = await fetchVideos({
    q: q.value,
    channel: channel.value,
    page: 1,
    pageSize: 24
  })
  list.value = data.list
  total.value = data.total
  loading.value = false
}

watch(() => route.query.q, load, { immediate: true })
watch(channel, load)
</script>

<style scoped>
.search-page { padding-top: 24px; background: var(--bg); min-height: calc(100vh - var(--header-h)); }
h1 { font-size: 20px; margin: 0 0 6px; }
p { color: var(--text-3); margin: 0 0 16px; }
.filters { display: flex; gap: 8px; margin-bottom: 18px; }
.filters button {
  border: 0;
  background: #fff;
  border-radius: 16px;
  padding: 6px 14px;
  color: var(--text-2);
}
.filters .on { background: var(--pink); color: #fff; }
.grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 18px 12px;
}
.empty { padding: 40px 0; text-align: center; }
@media (max-width: 1600px) {
  .grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
</style>
