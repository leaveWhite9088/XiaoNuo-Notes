<template>
  <div class="video-detail">
    <div class="container">
      <div v-if="loading" class="loading">视频加载中…</div>
      <template v-else-if="data">
        <div class="breadcrumb">
          <a @click.prevent="goHome" class="back-link">‹ 返回首页</a>
          <span class="sep">/</span>
          <router-link :to="`/c/${data.video.category}`">{{ data.video.categoryName }}</router-link>
          <span class="sep">/</span>
          <span class="current ellipsis">av{{ data.video.id }}</span>
        </div>

        <div class="layout">
          <div class="layout-main">
            <div class="player">
              <video
                ref="videoEl"
                :src="data.video.src"
                :poster="data.video.cover"
                controls
                playsinline
                preload="metadata"
                crossorigin="anonymous"
                class="player-video"
              />
              <div class="player-bar">
                <button class="bar-btn" @click="togglePlay">{{ playing ? '⏸ 暂停' : '▶ 播放' }}</button>
                <span class="bar-time">{{ currentTime }} / {{ duration }}</span>
                <button class="bar-btn" @click="toggleMute">{{ muted ? '🔇' : '🔊' }}</button>
                <span class="bar-vol">{{ Math.round(volume * 100) }}%</span>
                <button class="bar-btn" @click="toggleFull">⛶ 全屏</button>
              </div>
            </div>

            <h1 class="video-title">{{ data.video.title }}</h1>

            <div class="action-row">
              <div class="up-info" @click="goUp">
                <img :src="data.up.avatar" :alt="data.up.name" class="up-avatar" />
                <div class="up-text">
                  <div class="up-name">
                    {{ data.up.name }}
                    <span v-if="data.up.verified" class="verified" title="官方认证">✓</span>
                  </div>
                  <div class="up-followers">{{ formatCount(data.up.followerCount) }}粉丝 · {{ data.up.sign }}</div>
                </div>
                <button class="follow-btn" @click.stop="follow = !follow">
                  {{ follow ? '已关注' : '+ 关注' }}
                </button>
              </div>
              <div class="action-buttons">
                <button class="action-btn" :class="{ active: liked }" @click="liked = !liked">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M2 10h4v12H2zm6 0h2.34l4.97-9L13 0H8L4 5.34V10h4z"/></svg>
                  <span class="num">{{ formatCount((data.video.likeCount || 0) + (liked ? 1 : 0)) }}</span>
                  <span class="label">点赞</span>
                </button>
                <button class="action-btn" :class="{ active: coined }" @click="coined = !coined">
                  <span class="icon">🪙</span>
                  <span class="num">{{ formatCount((data.video.coinCount || 0) + (coined ? 1 : 0)) }}</span>
                  <span class="label">投币</span>
                </button>
                <button class="action-btn" :class="{ active: faved }" @click="faved = !faved">
                  <span class="icon">⭐</span>
                  <span class="num">{{ formatCount((data.video.favoriteCount || 0) + (faved ? 1 : 0)) }}</span>
                  <span class="label">收藏</span>
                </button>
                <button class="action-btn">
                  <span class="icon">↗</span>
                  <span class="num">{{ formatCount(data.video.shareCount || 0) }}</span>
                  <span class="label">分享</span>
                </button>
                <button class="action-btn" :class="{ active: tripleClicked }" @click="oneClickTriple">
                  <span class="icon">⚡</span>
                  <span class="num">{{ tripleClicked ? '已三连' : '一键三连' }}</span>
                  <span class="label">三连</span>
                </button>
              </div>
            </div>

            <div class="description">
              <div class="desc-meta">
                <span>{{ formatCount(data.video.playCount) }}播放</span>
                <span>·</span>
                <span>{{ formatCount(data.video.danmakuCount) }}弹幕</span>
                <span>·</span>
                <span>{{ data.video.publishLabel }}</span>
                <span>·</span>
                <span>{{ data.video.categoryName }}</span>
              </div>
              <p class="desc-text">{{ data.video.description }}</p>
            </div>

            <div class="comments">
              <h3>热门评论 <span class="cmt-count">({{ comments.length }})</span></h3>
              <div class="comment-input-row">
                <input class="comment-input" v-model="newComment" placeholder="发条友善的评论吧～" @keydown.enter="submitComment" />
                <button class="btn btn-primary" :disabled="!newComment.trim()" @click="submitComment">发布</button>
              </div>
              <ul class="comment-list">
                <li v-for="(c, i) in comments" :key="i" class="comment-item">
                  <img :src="c.avatar" :alt="c.user" class="cmt-avatar" />
                  <div class="cmt-body">
                    <div class="cmt-meta">
                      <span class="cmt-user">{{ c.user }}</span>
                      <span class="cmt-time">{{ c.time }}</span>
                    </div>
                    <p class="cmt-text">{{ c.text }}</p>
                    <div class="cmt-actions">
                      <span class="cmt-action" :class="{ liked: c.liked }" @click="toggleCmtLike(i)">👍 {{ c.likes }}</span>
                      <span class="cmt-action">回复</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div class="layout-side">
            <h3 class="side-title">相关推荐</h3>
            <ul class="related-list">
              <li v-for="r in data.related" :key="r.id" class="related-item" @click="goVideo(r.id)">
                <div class="related-cover">
                  <img :src="r.cover" :alt="r.title" />
                  <span class="related-duration">{{ r.durationLabel }}</span>
                </div>
                <div class="related-info">
                  <div class="related-title ellipsis-2">{{ r.title }}</div>
                  <div class="related-meta">
                    <span v-if="r.up">{{ r.up.name }}</span>
                    <span>·</span>
                    <span>{{ r.playCountLabel }}播放</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </template>
      <div v-else class="not-found">视频不存在或已被删除。<router-link to="/">返回首页</router-link></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '@/api';
import { formatCount } from '@/utils/format';

const props = defineProps({ id: { type: String, required: true } });
const route = useRoute();
const router = useRouter();

const data = ref(null);
const loading = ref(true);
const videoEl = ref(null);
const playing = ref(false);
const muted = ref(false);
const volume = ref(1);
const currentTime = ref('0:00');
const duration = ref('0:00');

const liked = ref(false);
const coined = ref(false);
const faved = ref(false);
const tripleClicked = ref(false);
const follow = ref(false);

const newComment = ref('');
const comments = ref([
  { user: '卷王本王', avatar: 'https://picsum.photos/seed/cu1/64/64', text: '前方高能！', time: '2 小时前', likes: 1284, liked: false },
  { user: '我推的UP永不塌房', avatar: 'https://picsum.photos/seed/cu2/64/64', text: 'UP 主太用心了，每一个镜头都有故事。', time: '1 小时前', likes: 642, liked: false },
  { user: '深夜追剧党', avatar: 'https://picsum.photos/seed/cu3/64/64', text: '三连了，希望 UP 主继续更新。', time: '45 分钟前', likes: 312, liked: false },
  { user: '永远的新人', avatar: 'https://picsum.photos/seed/cu4/64/64', text: '看完了，还想看第二遍。', time: '30 分钟前', likes: 128, liked: false },
  { user: '键盘评论家', avatar: 'https://picsum.photos/seed/cu5/64/64', text: '建议加个倍速，现在的节奏稍微有点慢。', time: '20 分钟前', likes: 88, liked: false },
]);

function fmt(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function togglePlay() {
  const v = videoEl.value;
  if (!v) return;
  if (v.paused) v.play(); else v.pause();
}
function toggleMute() {
  const v = videoEl.value;
  if (!v) return;
  v.muted = !v.muted;
  muted.value = v.muted;
}
function toggleFull() {
  const v = videoEl.value;
  if (!v) return;
  if (v.requestFullscreen) v.requestFullscreen();
}
function oneClickTriple() {
  tripleClicked.value = true;
  liked.value = coined.value = faved.value = true;
}

function submitComment() {
  if (!newComment.value.trim()) return;
  comments.value.unshift({
    user: '我',
    avatar: 'https://picsum.photos/seed/cu-self/64/64',
    text: newComment.value.trim(),
    time: '刚刚',
    likes: 0,
    liked: false,
  });
  newComment.value = '';
}
function toggleCmtLike(i) {
  const c = comments.value[i];
  c.liked = !c.liked;
  c.likes += c.liked ? 1 : -1;
}

function goUp() {
  if (data.value?.up) router.push({ name: 'home', query: { q: data.value.up.name } });
}
function goHome() {
  router.push({ name: 'home' });
}
function goVideo(id) {
  router.push({ name: 'video', params: { id } });
}

async function load() {
  loading.value = true;
  data.value = null;
  try {
    data.value = await api.video(props.id);
  } catch (e) {
    console.error('[video detail] error', e);
  } finally {
    loading.value = false;
    nextTick(bindPlayer);
  }
}

function bindPlayer() {
  const v = videoEl.value;
  if (!v) return;
  v.addEventListener('play', () => { playing.value = true; });
  v.addEventListener('pause', () => { playing.value = false; });
  v.addEventListener('timeupdate', () => { currentTime.value = fmt(v.currentTime); });
  v.addEventListener('loadedmetadata', () => { duration.value = fmt(v.duration); });
  v.addEventListener('volumechange', () => { volume.value = v.volume; muted.value = v.muted; });
}

watch(() => props.id, load);
onMounted(load);
onBeforeUnmount(() => {
  if (videoEl.value) {
    try { videoEl.value.pause(); } catch (_) {}
  }
});
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.video-detail { padding-bottom: 32px; }
.breadcrumb {
  margin: 16px 0;
  font-size: 12px;
  color: $bili-text-3;
  display: flex;
  align-items: center;
  a { color: $bili-text-2; cursor: pointer; &:hover { color: $bili-pink; } }
  .back-link { color: $bili-pink !important; font-weight: 500; }
  .sep { margin: 0 6px; }
  .current { color: $bili-text; }
}
.layout {
  display: grid;
  grid-template-columns: 1fr $sidebar-width;
  gap: 24px;
  @media (max-width: 1100px) { grid-template-columns: 1fr; }
  @media (max-width: 720px) { gap: 12px; }
}
.layout-main { min-width: 0; }
.player {
  position: relative;
  background: #000;
  border-radius: $radius-card;
  overflow: hidden;
  aspect-ratio: 16 / 9;
}
.player-video { width: 100%; height: 100%; display: block; }
.player-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  font-size: 12px;
}
.bar-btn {
  background: transparent;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  &:hover { background: rgba(255, 255, 255, 0.15); }
}
.bar-time { flex: 1; text-align: center; }
.bar-vol { font-size: 11px; opacity: 0.85; }

.video-title {
  margin: 20px 0 12px;
  font-size: 22px;
  font-weight: 500;
  line-height: 1.4;
  color: $bili-text;
}

.action-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid $bili-border;
}
.up-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.up-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
.up-text { flex: 1; }
.up-name {
  font-size: 16px;
  font-weight: 500;
  color: $bili-text;
  display: flex;
  align-items: center;
  gap: 4px;
  .verified {
    display: inline-block;
    width: 14px;
    height: 14px;
    line-height: 14px;
    text-align: center;
    font-size: 10px;
    color: #fff;
    background: $bili-pink;
    border-radius: 50%;
  }
}
.up-followers { font-size: 12px; color: $bili-text-3; }
.follow-btn {
  height: 32px;
  padding: 0 16px;
  border-radius: 16px;
  background: $bili-pink;
  color: #fff;
  font-size: 13px;
  &:hover { background: $bili-pink-soft; }
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 14px;
  background: $bili-tag-bg;
  border-radius: 19px;
  font-size: 13px;
  color: $bili-text-2;
  transition: all 0.2s;
  &:hover { background: #e9eaec; color: $bili-pink; }
  &.active { background: rgba(251, 114, 153, 0.1); color: $bili-pink; }
  .icon { font-size: 16px; }
  .label { color: inherit; opacity: 0.85; }
  .num { font-weight: 500; }
}

.description {
  padding: 16px;
  background: $bili-tag-bg;
  border-radius: $radius-card;
  margin: 16px 0;
  font-size: 13px;
  color: $bili-text-2;
  line-height: 1.6;
}
.desc-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
  color: $bili-text-3;
  margin-bottom: 8px;
}
.desc-text { color: $bili-text; }

.comments {
  margin-top: 24px;
  h3 {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 12px;
    .cmt-count { font-size: 12px; color: $bili-text-3; }
  }
}
.comment-input-row { display: flex; gap: 8px; margin-bottom: 16px; }
.comment-input {
  flex: 1;
  height: 36px;
  padding: 0 12px;
  background: $bili-tag-bg;
  border-radius: 18px;
  font-size: 13px;
  &:focus { background: #fff; box-shadow: inset 0 0 0 1px $bili-pink; }
}
.comment-list { display: flex; flex-direction: column; gap: 16px; }
.comment-item { display: flex; gap: 12px; }
.cmt-avatar { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; }
.cmt-body { flex: 1; }
.cmt-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: $bili-text-3;
  .cmt-user { color: $bili-text-2; }
}
.cmt-text { margin: 4px 0 4px; font-size: 14px; color: $bili-text; }
.cmt-actions {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: $bili-text-3;
  .cmt-action { cursor: pointer; &:hover { color: $bili-pink; } &.liked { color: $bili-pink; } }
}

.side-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
}
.related-list { display: flex; flex-direction: column; gap: 14px; }
.related-item { display: flex; gap: 10px; cursor: pointer; &:hover .related-title { color: $bili-pink; } }
.related-cover {
  position: relative;
  width: 168px;
  height: 96px;
  border-radius: $radius-card;
  overflow: hidden;
  flex-shrink: 0;
  img { width: 100%; height: 100%; object-fit: cover; }
}
.related-duration {
  position: absolute;
  bottom: 4px; right: 4px;
  padding: 0 4px;
  height: 16px;
  line-height: 16px;
  font-size: 10px;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 2px;
}
.related-info { flex: 1; min-width: 0; }
.related-title { font-size: 13px; line-height: 1.4; color: $bili-text; transition: color 0.2s; }
.related-meta { font-size: 11px; color: $bili-text-3; margin-top: 6px; display: flex; gap: 4px; }

.loading, .not-found {
  text-align: center;
  padding: 80px 0;
  color: $bili-text-3;
}
.not-found a { color: $bili-pink; }
</style>
