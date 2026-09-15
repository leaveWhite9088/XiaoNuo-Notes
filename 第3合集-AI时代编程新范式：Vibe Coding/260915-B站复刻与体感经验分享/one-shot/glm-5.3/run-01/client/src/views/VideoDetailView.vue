<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../api/index.js';
import VideoPlayer from '../components/VideoPlayer.vue';
import CommentSection from '../components/CommentSection.vue';
import BaseIcon from '../components/BaseIcon.vue';
import { formatCount, formatDate } from '../utils/format.js';
import { useUserStore } from '../stores/user.js';
import { toast } from '../composables/toast';

const route = useRoute();
const router = useRouter();
const user = useUserStore();

const video = ref(null);
const related = ref([]);
const comments = ref([]);
const status = ref('loading'); // loading | ok | missing
const descExpanded = ref(false);

async function load(id) {
  status.value = 'loading';
  descExpanded.value = false;
  window.scrollTo({ top: 0 });
  try {
    const [v, r, c] = await Promise.all([
      api.video(id),
      api.related(id, 12),
      api.comments(id).catch(() => ({ list: [], total: 0 })),
    ]);
    video.value = v;
    related.value = r;
    comments.value = c.list;
    status.value = 'ok';
    document.title = `${v.title}_哔哩哔哩_bilibili`;
  } catch {
    video.value = null;
    status.value = 'missing';
  }
}

onMounted(() => load(route.params.id));
watch(
  () => route.params.id,
  (id) => {
    if (id && route.name === 'video') load(id);
  }
);

const danmakuPool = computed(() => comments.value.slice(0, 40).map((c) => c.content.slice(0, 40)));

// 乐观计数：基础统计 + 本地 toggle 增量
const likeOn = computed(() => video.value && user.has('like', video.value.id));
const coinOn = computed(() => video.value && user.has('coin', video.value.id));
const favOn = computed(() => video.value && user.has('favorite', video.value.id));
const laterOn = computed(() => video.value && user.has('later', video.value.id));
const followOn = computed(() => video.value && user.has('follow', video.value.owner.mid));

function toggleLike() {
  const on = user.toggle('like', video.value.id);
  toast(on ? '点赞成功' : '已取消点赞');
}
function toggleCoin() {
  if (!coinOn.value) {
    user.toggle('coin', video.value.id);
    toast('投了 1 枚硬币');
  } else {
    toast('已经投过硬币啦');
  }
}
function toggleFav() {
  const on = user.toggle('favorite', video.value.id);
  toast(on ? '已加入收藏' : '已取消收藏');
}
function toggleLater() {
  const on = user.toggle('later', video.value.id);
  toast(on ? '已加入稍后再看' : '已从稍再看移除');
}
function toggleFollow() {
  const on = user.toggle('follow', video.value.owner.mid);
  toast(on ? `已关注 ${video.value.owner.name}` : '已取消关注');
}
async function share() {
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    toast('链接已复制，去分享吧');
  } catch {
    toast(url);
  }
}

function goHome() {
  router.push('/');
}
function goRegion() {
  router.push({ path: '/', query: { region: video.value.region } });
}
function goRelated(id) {
  router.push(`/video/${id}`);
}
</script>

<template>
  <div class="detail-wrap">
    <div v-if="status === 'loading'" class="detail-loading">
      <div class="skeleton player"></div>
      <div class="skeleton title"></div>
      <div class="skeleton meta"></div>
    </div>

    <div v-else-if="status === 'missing'" class="detail-missing">
      <p>视频不存在或已被删除 (｡•́︿•̀｡)</p>
      <button class="back-home-btn" @click="goHome">返回首页</button>
    </div>

    <div v-else-if="video" class="detail-layout">
      <!-- 左列：播放器 + 信息 + 评论 -->
      <div class="detail-main">
        <div class="breadcrumb">
          <a class="crumb-link" @click="goHome">首页</a>
          <span class="crumb-sep">/</span>
          <a class="crumb-link" @click="goRegion">{{ video.regionName }}分区</a>
          <span class="crumb-sep">/</span>
          <span class="crumb-now line-clamp-1">视频详情</span>
          <a class="back-link" @click="goHome">← 返回首页</a>
        </div>

        <VideoPlayer :src="video.videoUrl" :poster="video.cover" :danmaku-pool="danmakuPool" />

        <h1 class="video-title">{{ video.title }}</h1>

        <div class="video-meta">
          <span class="meta-item"><BaseIcon name="playCount" :size="14" />{{ formatCount(video.stat.play) }}</span>
          <span class="meta-item"><BaseIcon name="danmaku" :size="14" />{{ formatCount(video.stat.danmaku) }}</span>
          <span class="meta-item"><BaseIcon name="comment" :size="14" />{{ formatCount(video.stat.reply) }}</span>
          <span class="meta-time">{{ formatDate(video.pubdate) }}</span>
        </div>

        <div class="action-bar">
          <button class="action" :class="{ on: likeOn }" @click="toggleLike">
            <BaseIcon name="like" :size="18" />
            <span>{{ formatCount(video.stat.like + (likeOn ? 1 : 0)) }}</span>
          </button>
          <button class="action" :class="{ on: coinOn }" @click="toggleCoin">
            <BaseIcon name="coin" :size="18" />
            <span>{{ formatCount(video.stat.coin + (coinOn ? 1 : 0)) }}</span>
          </button>
          <button class="action" :class="{ on: favOn }" @click="toggleFav">
            <BaseIcon name="star" :size="18" />
            <span>{{ formatCount(video.stat.favorite + (favOn ? 1 : 0)) }}</span>
          </button>
          <button class="action" :class="{ on: laterOn }" @click="toggleLater">
            <BaseIcon name="clock" :size="18" />
            <span>稍后再看</span>
          </button>
          <button class="action" @click="share">
            <BaseIcon name="share" :size="18" />
            <span>{{ formatCount(video.stat.share) }}</span>
          </button>
        </div>

        <div class="up-card">
          <img class="up-face" :src="video.owner.face" alt="" />
          <div class="up-info">
            <div class="up-name">{{ video.owner.name }}</div>
            <div class="up-fans">{{ formatCount(video.owner.fans) }} 粉丝</div>
          </div>
          <button class="follow-btn" :class="{ on: followOn }" @click="toggleFollow">
            {{ followOn ? '已关注' : '+ 关注' }}
          </button>
        </div>

        <div class="desc-card">
          <p class="desc" :class="{ collapsed: !descExpanded }">{{ video.desc }}</p>
          <div v-if="video.desc.length > 80" class="desc-toggle" @click="descExpanded = !descExpanded">
            {{ descExpanded ? '收起' : '展开更多' }}
          </div>
          <div class="tags">
            <span v-for="tag in video.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>

        <CommentSection :video-id="video.id" :key="video.id" />
      </div>

      <!-- 右列：相关推荐 -->
      <aside class="related-panel">
        <div class="related-head">相关推荐</div>
        <div v-for="r in related" :key="r.id" class="related-card" @click="goRelated(r.id)">
          <div class="related-cover-wrap">
            <img class="related-cover" :src="r.cover" :alt="r.title" loading="lazy" />
          </div>
          <div class="related-info">
            <div class="related-title line-clamp-2" :title="r.title">{{ r.title }}</div>
            <div class="related-meta">
              <span class="meta-item"><BaseIcon name="playCount" :size="12" />{{ formatCount(r.stat.play) }}</span>
              <span class="related-up line-clamp-1">{{ r.owner.name }}</span>
            </div>
          </div>
        </div>
        <div v-if="!related.length" class="related-empty">暂无相关推荐</div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.detail-wrap {
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px 24px 0;
}
.detail-loading .player {
  aspect-ratio: 16 / 9;
  border-radius: 10px;
}
.detail-loading .title {
  height: 26px;
  margin: 16px 0 10px;
}
.detail-loading .meta {
  height: 16px;
  width: 40%;
}
.detail-missing {
  padding: 80px 0;
  text-align: center;
  color: var(--text-2);
}
.back-home-btn {
  display: block;
  margin: 16px auto 0;
  color: var(--bili-pink);
  border: 1px solid var(--bili-pink);
  border-radius: 18px;
  padding: 8px 28px;
}
.detail-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.detail-main {
  flex: 1;
  min-width: 0;
}
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-3);
  margin-bottom: 12px;
}
.crumb-link {
  cursor: pointer;
}
.crumb-link:hover {
  color: var(--bili-pink);
}
.crumb-sep {
  color: var(--line);
}
.crumb-now {
  color: var(--text-2);
}
.back-link {
  margin-left: auto;
  color: var(--bili-blue);
  cursor: pointer;
  flex-shrink: 0;
}
.back-link:hover {
  text-decoration: underline;
}
.video-title {
  font-size: 20px;
  font-weight: 600;
  margin: 14px 0 8px;
  line-height: 1.45;
}
.video-meta {
  display: flex;
  align-items: center;
  gap: 18px;
  color: var(--text-3);
  font-size: 13px;
}
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.meta-time {
  margin-left: auto;
}
.action-bar {
  display: flex;
  gap: 8px;
  margin: 16px 0;
  border-bottom: 1px solid var(--bg-page);
  padding-bottom: 14px;
}
.action {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border-radius: 8px;
  padding: 8px 14px;
  color: var(--text-2);
  font-size: 13px;
  box-shadow: var(--shadow-card);
  transition: all 0.15s;
}
.action:hover {
  color: var(--bili-pink);
}
.action.on {
  background: var(--bili-pink-bg);
  color: var(--bili-pink);
}
.up-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--bg-page);
}
.up-face {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}
.up-info {
  flex: 1;
}
.up-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--bili-blue);
}
.up-fans {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 2px;
}
.follow-btn {
  color: var(--bili-pink);
  border: 1px solid var(--bili-pink);
  border-radius: 16px;
  padding: 5px 20px;
  font-size: 13px;
}
.follow-btn:hover {
  background: var(--bili-pink-bg);
}
.follow-btn.on {
  color: #fff;
  background: var(--bili-pink);
  border-color: var(--bili-pink);
}
.desc-card {
  padding: 14px 0 4px;
}
.desc {
  font-size: 14px;
  color: var(--text-2);
  white-space: pre-wrap;
  word-break: break-word;
}
.desc.collapsed {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
.desc-toggle {
  color: var(--bili-blue);
  font-size: 13px;
  cursor: pointer;
  margin: 6px 0;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.tag {
  background: var(--bg-page);
  color: var(--text-2);
  border-radius: 4px;
  padding: 2px 10px;
  font-size: 12px;
  cursor: default;
}
.related-panel {
  width: 380px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  position: sticky;
  top: calc(var(--header-h) + 16px);
  max-height: calc(100vh - var(--header-h) - 32px);
  overflow: auto;
}
.related-head {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}
.related-card {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  border-radius: 8px;
  cursor: pointer;
}
.related-card:hover .related-title {
  color: var(--bili-pink);
}
.related-cover-wrap {
  width: 150px;
  aspect-ratio: 16 / 10;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: #e7e9eb;
}
.related-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.related-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2px 0;
}
.related-title {
  font-size: 13px;
  line-height: 1.4;
}
.related-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  color: var(--text-3);
  font-size: 12px;
}
.related-up {
  color: var(--text-3);
}
.related-empty {
  color: var(--text-3);
  text-align: center;
  padding: 30px 0;
  font-size: 13px;
}
@media (max-width: 1100px) {
  .detail-layout {
    flex-direction: column;
  }
  .related-panel {
    width: 100%;
    position: static;
    max-height: none;
  }
}
</style>
