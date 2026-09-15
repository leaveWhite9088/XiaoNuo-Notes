<template>
  <main>
    <AppBanner />
    <div class="page-wrap">
      <ChannelBar v-model="channel" :channels="channels" :extra="extra" />
      <section class="feed">
        <HomeCarousel v-if="channel === 'recommend' && page === 1" :slides="slides" />
        <VideoCard v-for="v in list" :key="v.bvid + '-' + seed" :video="v" />
      </section>
      <div ref="sentinel" class="more">
        <span v-if="loading">加载中...</span>
        <span v-else-if="!hasMore">已经到底啦</span>
      </div>
    </div>
    <SideToolbar refresh @refresh="refresh" />
  </main>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBanner from '../components/layout/AppBanner.vue'
import ChannelBar from '../components/layout/ChannelBar.vue'
import SideToolbar from '../components/layout/SideToolbar.vue'
import HomeCarousel from '../components/video/HomeCarousel.vue'
import VideoCard from '../components/video/VideoCard.vue'
import { fetchCarousel, fetchMeta, fetchVideos } from '../api/client'

const route = useRoute()
const router = useRouter()
const channels = ref([])
const extra = ref([])
const slides = ref([])
const list = ref([])
const channel = ref(route.query.channel || 'recommend')
const page = ref(1)
const hasMore = ref(true)
const loading = ref(false)
const seed = ref(Date.now())
const sentinel = ref(null)
let io = null

watch(
  () => route.query.channel,
  (c) => {
    channel.value = c || 'recommend'
  }
)
watch(channel, (c) => {
  if ((route.query.channel || 'recommend') !== c) {
    router.replace({ query: { ...route.query, channel: c === 'recommend' ? undefined : c } })
  }
  reset()
})

async function load(resetList = false) {
  if (loading.value) return
  loading.value = true
  const data = await fetchVideos({
    channel: channel.value,
    page: page.value,
    pageSize: 12,
    seed: seed.value
  })
  list.value = resetList ? data.list : list.value.concat(data.list)
  hasMore.value = data.hasMore
  loading.value = false
}

function reset() {
  page.value = 1
  hasMore.value = true
  load(true)
}

function refresh() {
  seed.value = Date.now()
  window.scrollTo({ top: 0, behavior: 'smooth' })
  reset()
}

onMounted(async () => {
  const meta = await fetchMeta()
  channels.value = meta.channels
  extra.value = meta.extraLinks
  const car = await fetchCarousel()
  slides.value = car.list
  await load(true)
  io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore.value && !loading.value) {
      page.value += 1
      load()
    }
  })
  await nextTick()
  if (sentinel.value) io.observe(sentinel.value)
})
onUnmounted(() => io && io.disconnect())
</script>

<style scoped>
.feed {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 18px 12px;
  margin-top: 12px;
}
.more {
  text-align: center;
  padding: 28px 0 8px;
  color: var(--text-3);
  font-size: 13px;
}
@media (max-width: 1600px) {
  .feed { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
</style>
