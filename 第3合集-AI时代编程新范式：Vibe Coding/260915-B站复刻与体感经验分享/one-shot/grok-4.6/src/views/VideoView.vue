<template>
  <main class="watch" v-if="video">
    <div class="main">
      <BiliPlayer :src="video.src" :poster="video.cover" :danmaku-list="video.danmakuList || []" />
      <h1>{{ video.title }}</h1>
      <div class="sub">
        <span>{{ formatCount(video.views) }} 播放</span>
        <span>· {{ formatCount(video.danmaku) }} 弹幕</span>
        <span>· {{ formatDate(video.pubdate) }}</span>
        <span class="copy">{{ video.copyright }}</span>
      </div>
      <div class="ops">
        <button :class="{ on: liked }" type="button" @click="act('like')">👍 {{ formatCount(video.likes) }}</button>
        <button :class="{ on: coined }" type="button" @click="act('coin')">🪙 {{ formatCount(video.coins) }}</button>
        <button :class="{ on: faved }" type="button" @click="act('favorite')">⭐ {{ formatCount(video.favorites) }}</button>
        <button type="button" @click="act('share')">↗ 分享 {{ formatCount(video.shares) }}</button>
        <button type="button" @click="user.toggleWatchLater(video)">
          {{ user.isWatchLater(video.bvid) ? '已加稍后再看' : '稍后再看' }}
        </button>
      </div>
      <div class="tags">
        <router-link v-for="t in video.tags" :key="t" :to="{ name: 'search', query: { q: t } }">{{ t }}</router-link>
      </div>
      <section class="up">
        <img :src="video.owner.avatar" :alt="video.owner.name" />
        <div>
          <strong>{{ video.owner.name }}</strong>
          <p>{{ formatCount(video.owner.fans) }} 粉丝　{{ video.owner.sign }}</p>
        </div>
        <button class="follow" :class="{ on: followed }" type="button" @click="user.follow(video.owner.mid)">
          {{ followed ? '已关注' : '+ 关注' }}
        </button>
      </section>
      <section class="desc">
        <p>{{ openDesc ? video.desc : video.desc.slice(0, 72) + (video.desc.length > 72 ? '...' : '') }}</p>
        <button type="button" @click="openDesc = !openDesc">{{ openDesc ? '收起' : '展开更多' }}</button>
      </section>
      <section class="comments">
        <h2>评论 {{ comments.length }}</h2>
        <article v-for="c in comments" :key="c.id" class="cmt">
          <img :src="c.avatar" alt="" />
          <div>
            <header><b>{{ c.user }}</b> <span>{{ c.ctime }} · {{ c.location }}</span></header>
            <p>{{ c.content }}</p>
            <small>点赞 {{ formatCount(c.likes) }}</small>
            <div v-if="c.replies?.length" class="replies">
              <p v-for="r in c.replies" :key="r.id"><b>{{ r.user }}</b>：{{ r.content }}</p>
            </div>
          </div>
        </article>
      </section>
    </div>
    <aside>
      <h3>接下来播放</h3>
      <router-link v-for="r in related" :key="r.bvid" class="rel" :to="'/video/' + r.bvid">
        <img :src="r.cover" :alt="r.title" />
        <div>
          <p>{{ r.title }}</p>
          <span>{{ r.owner?.name }}</span>
          <span>{{ formatCount(r.views) }} 播放</span>
        </div>
      </router-link>
    </aside>
  </main>
  <p v-else class="page-wrap loading">加载中...</p>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BiliPlayer from '../components/player/BiliPlayer.vue'
import { fetchComments, fetchRelated, fetchVideo, postStat } from '../api/client'
import { formatCount, formatDate } from '../utils/format'
import { useUserStore } from '../stores/user'

const route = useRoute()
const user = useUserStore()
const video = ref(null)
const related = ref([])
const comments = ref([])
const openDesc = ref(false)

const liked = computed(() => user.likes.includes(video.value?.bvid))
const coined = computed(() => user.coins.includes(video.value?.bvid))
const faved = computed(() => user.favorites.includes(video.value?.bvid))
const followed = computed(() => user.following.includes(video.value?.owner?.mid))

async function load() {
  video.value = null
  const data = await fetchVideo(route.params.bvid)
  video.value = data.video
  user.pushHistory(data.video)
  const [rel, cms] = await Promise.all([
    fetchRelated(route.params.bvid),
    fetchComments(route.params.bvid)
  ])
  related.value = rel.list
  comments.value = cms.list
}

async function act(type) {
  const map = { like: 'likes', coin: 'coins', favorite: 'favorites' }
  if (map[type]) {
    const on = user.toggle(map[type], video.value.bvid)
    if (on) {
      const stats = await postStat(video.value.bvid, type)
      Object.assign(video.value, stats)
      user.toast(type === 'like' ? '点赞成功' : type === 'coin' ? '投币成功' : '已收藏')
    } else {
      user.toast('已取消')
    }
  } else {
    await postStat(video.value.bvid, 'share')
    user.toast('链接已模拟分享')
  }
}

watch(() => route.params.bvid, load, { immediate: true })
</script>

<style scoped>
.watch {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 350px;
  gap: 24px;
  padding: 18px 60px 48px;
  background: #fff;
  min-height: calc(100vh - var(--header-h));
}
h1 { font-size: 22px; margin: 16px 0 8px; line-height: 1.4; }
.sub { color: var(--text-3); font-size: 13px; display: flex; gap: 8px; }
.copy { margin-left: auto; }
.ops { display: flex; gap: 10px; margin: 16px 0; flex-wrap: wrap; }
.ops button {
  border: 0;
  background: #f1f2f3;
  border-radius: 18px;
  padding: 8px 14px;
  color: var(--text-2);
}
.ops .on { color: var(--pink); background: #fff0f4; }
.tags { display: flex; gap: 8px; flex-wrap: wrap; }
.tags a {
  background: #f1f2f3;
  border-radius: 14px;
  padding: 4px 10px;
  font-size: 13px;
  color: var(--text-2);
}
.tags a:hover { color: var(--pink); }
.up {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  padding: 12px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.up img { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
.up p { margin: 4px 0 0; color: var(--text-3); font-size: 13px; }
.follow {
  margin-left: auto;
  border: 0;
  background: var(--pink);
  color: #fff;
  border-radius: 8px;
  padding: 8px 18px;
}
.follow.on { background: #e3e5e7; color: var(--text-2); }
.desc p { white-space: pre-wrap; color: var(--text-2); font-size: 14px; }
.desc button { border: 0; background: none; color: var(--blue); }
.comments h2 { font-size: 18px; }
.cmt { display: flex; gap: 10px; margin: 16px 0; }
.cmt img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.cmt header { display: flex; gap: 8px; align-items: baseline; }
.cmt header span, .cmt small { color: var(--text-3); font-size: 12px; }
.cmt p { margin: 6px 0; }
.replies { background: #f6f7f8; border-radius: 6px; padding: 8px 10px; font-size: 13px; }
aside h3 { margin: 0 0 12px; font-size: 15px; }
.rel {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 10px;
  margin-bottom: 12px;
}
.rel img { width: 140px; height: 88px; object-fit: cover; border-radius: 6px; }
.rel p {
  margin: 0 0 6px;
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.rel span { display: block; color: var(--text-3); font-size: 12px; }
.rel:hover p { color: var(--pink); }
.loading { padding-top: 40px; color: var(--text-3); }
</style>
