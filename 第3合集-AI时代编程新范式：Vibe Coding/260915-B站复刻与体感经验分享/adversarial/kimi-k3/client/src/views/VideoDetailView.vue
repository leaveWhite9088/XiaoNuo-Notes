<template>
  <div class="detail container" v-if="video">
    <div class="detail-main">
      <!-- 播放器 -->
      <div class="player-wrap">
        <video :src="video.videoUrl" :poster="video.cover" controls preload="metadata"></video>
      </div>

      <!-- 标题 -->
      <h1 class="v-title">{{ video.title }}</h1>

      <!-- 数据行 -->
      <div class="v-stats">
        <span>
          <svg viewBox="0 0 24 24" width="15" height="15"><path d="M4 5 h16 v11 h-16 z" fill="none" stroke="currentColor" stroke-width="1.8" rx="2"/><path d="M10 8.5 l5 3 -5 3 z" fill="currentColor"/></svg>
          {{ video.playCount }}万播放
        </span>
        <span>
          <svg viewBox="0 0 24 24" width="15" height="15"><path d="M4 5 h16 v10 h-11 l-4 3 v-3 h-1 z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
          {{ video.danmakuCount }}万弹幕
        </span>
        <span>发布于 {{ video.pubDate }}</span>
        <span class="v-cat">{{ video.category }}</span>
      </div>

      <!-- 互动按钮组 -->
      <div class="v-actions">
        <button class="action-btn" :class="{ active: liked }" @click="onLike">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M7 22 V10 M7 10 L12 2 q2 0 1.6 2.4 L12.8 9 H19 a2 2 0 0 1 2 2.4 l-1.5 8 A2 2 0 0 1 17.5 21 H7"
              :fill="liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
          </svg>
          点赞 {{ likeCount }}
        </button>
        <button class="action-btn" :class="{ active: coined }" @click="coined = !coined">
          <svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="9" :fill="coined ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.7"/><text x="12" y="16" text-anchor="middle" font-size="10" :fill="coined ? '#fff' : 'currentColor'">币</text></svg>
          投币
        </button>
        <button class="action-btn" :class="{ active: faved }" @click="faved = !faved">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 3 l2.7 5.6 6.1.8 -4.5 4.2 1.1 6 -5.4 -2.9 -5.4 2.9 1.1 -6 -4.5 -4.2 6.1 -.8 z" :fill="faved ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
          收藏
        </button>
        <button class="action-btn" @click="onShare">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M14 5 l7 7 -7 7 v-4 c-6 0 -9 2 -11 5 0 -7 4 -11 11 -11 z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
          分享
        </button>
      </div>

      <!-- UP 主信息卡 -->
      <div class="up-card">
        <img class="up-avatar" :src="video.upAvatar" :alt="video.upName" />
        <div class="up-info">
          <div class="up-name">{{ video.upName }}</div>
          <div class="up-fans">{{ video.upFans }}万粉丝</div>
        </div>
        <button class="follow-btn" :class="{ followed }" @click="onFollow">
          {{ followed ? '已关注' : '+ 关注' }}
        </button>
      </div>

      <!-- 简介 -->
      <div class="v-desc">
        <p>{{ video.desc }}</p>
        <div class="v-tags">
          <span v-for="t in video.tags" :key="t" class="tag" @click="goSearch(t)">{{ t }}</span>
        </div>
      </div>

      <!-- 评论区 -->
      <div class="comments">
        <h2 class="comment-title">评论 <span class="comment-count">{{ comments.length }}</span></h2>
        <div class="comment-input-row">
          <img class="c-avatar" src="https://randomuser.me/api/portraits/women/33.jpg" alt="我" />
          <div class="input-box">
            <textarea
              v-model="draft"
              placeholder="发一条友善的评论吧～"
              rows="2"
              @keyup.ctrl.enter="submitComment"
            ></textarea>
            <button class="submit-btn" :disabled="!draft.trim()" @click="submitComment">发布</button>
          </div>
        </div>
        <CommentItem v-for="c in comments" :key="c.id" :comment="c" />
      </div>
    </div>

    <!-- 右列：相关推荐 -->
    <aside class="detail-side">
      <h2 class="side-title">接下来播放</h2>
      <router-link
        v-for="r in related"
        :key="r.id"
        :to="`/video/${r.id}`"
        class="related-item"
      >
        <div class="r-cover">
          <img :src="r.cover" :alt="r.title" loading="lazy" />
          <span class="r-duration">{{ r.duration }}</span>
        </div>
        <div class="r-info">
          <div class="r-title text-ellipsis-2">{{ r.title }}</div>
          <div class="r-up">{{ r.upName }}</div>
          <div class="r-stats">{{ r.playCount }}万播放 · {{ r.danmakuCount }}万弹幕</div>
        </div>
      </router-link>
    </aside>
  </div>

  <div v-else-if="notFound" class="state-box container">
    <p>视频走丢了 (´；ω；`)</p>
    <router-link to="/" class="back-link">返回首页</router-link>
  </div>
  <div v-else class="state-box container">加载中…</div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CommentItem from '../components/CommentItem.vue';
import { fetchVideoDetail } from '../api';
import { useInteractStore } from '../stores/interact';

const route = useRoute();
const router = useRouter();
const store = useInteractStore();

const video = ref(null);
const related = ref([]);
const comments = ref([]);
const notFound = ref(false);
const liked = ref(false);
const likeCount = ref(0);
const coined = ref(false);
const faved = ref(false);
const followed = ref(false);
const draft = ref('');

async function load(id) {
  video.value = null;
  notFound.value = false;
  try {
    const data = await fetchVideoDetail(id);
    video.value = data.video;
    related.value = data.related;
    comments.value = data.video.comments.slice();
    liked.value = store.isLiked(id);
    likeCount.value = 1024 + ((id.length * 137) % 5000);
    followed.value = store.isFollowed(data.video.upName);
  } catch {
    notFound.value = true;
  }
}

function onLike() {
  store.toggleLike(video.value.id);
  liked.value = store.isLiked(video.value.id);
  likeCount.value += liked.value ? 1 : -1;
}

function onFollow() {
  store.toggleFollow(video.value.upName);
  followed.value = store.isFollowed(video.value.upName);
}

function onShare() {
  const url = window.location.href;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).catch(() => {});
  }
  alert('链接已复制，快分享给小伙伴吧！');
}

function goSearch(tag) {
  router.push({ path: '/search', query: { keyword: tag } });
}

function submitComment() {
  const content = draft.value.trim();
  if (!content) return;
  comments.value.unshift({
    id: `local-${Date.now()}`,
    nickname: '我',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    time: '刚刚',
    content,
    likes: 0,
  });
  draft.value = '';
}

watch(
  () => route.params.id,
  (id) => {
    if (id) load(id);
  },
  { immediate: true }
);
</script>

<style scoped>
.detail {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 24px;
  padding-top: 20px;
  padding-bottom: 40px;
}

.detail-main {
  min-width: 0;
  background: #fff;
  border-radius: var(--radius-card);
  padding: 18px 20px 24px;
}

.player-wrap {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 6px;
  overflow: hidden;
}

.player-wrap video {
  width: 100%;
  height: 100%;
}

.v-title {
  margin-top: 14px;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.v-stats {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 10px;
  font-size: 13px;
  color: var(--text-light);
}

.v-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.v-cat {
  background: var(--bili-pink-light);
  color: var(--bili-pink);
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
}

.v-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-gray);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border-radius: 20px;
  border: 1px solid var(--border-gray);
  color: var(--text-sub);
  font-size: 14px;
  transition: all 0.2s;
}

.action-btn:hover {
  color: var(--bili-pink);
  border-color: var(--bili-pink);
}

.action-btn.active {
  background: var(--bili-pink);
  border-color: var(--bili-pink);
  color: #fff;
}

.up-card {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 16px;
  padding: 14px 16px;
  background: var(--bg-gray);
  border-radius: var(--radius-card);
}

.up-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.up-info {
  flex: 1;
}

.up-name {
  font-size: 15px;
  font-weight: 600;
}

.up-fans {
  margin-top: 3px;
  font-size: 12px;
  color: var(--text-light);
}

.follow-btn {
  padding: 8px 26px;
  border-radius: 6px;
  background: var(--bili-pink);
  color: #fff;
  font-size: 14px;
  transition: all 0.2s;
}

.follow-btn:hover {
  background: var(--bili-pink-dark);
}

.follow-btn.followed {
  background: #e3e5e7;
  color: var(--text-sub);
}

.v-desc {
  margin-top: 16px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-sub);
}

.v-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.tag {
  padding: 4px 12px;
  background: var(--bg-gray);
  border-radius: 12px;
  font-size: 12px;
  color: var(--text-sub);
  cursor: pointer;
  transition: all 0.2s;
}

.tag:hover {
  background: var(--bili-pink-light);
  color: var(--bili-pink);
}

.comments {
  margin-top: 24px;
}

.comment-title {
  font-size: 17px;
  font-weight: 600;
}

.comment-count {
  color: var(--text-light);
  font-size: 13px;
  font-weight: 400;
  margin-left: 4px;
}

.comment-input-row {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.c-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.input-box {
  flex: 1;
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.input-box textarea {
  flex: 1;
  border: 1px solid var(--border-gray);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}

.input-box textarea:focus {
  border-color: var(--bili-pink);
}

.submit-btn {
  padding: 9px 24px;
  border-radius: 8px;
  background: var(--bili-pink);
  color: #fff;
  font-size: 14px;
}

.submit-btn:disabled {
  background: #f9b8cb;
  cursor: not-allowed;
}

/* 右列 */
.detail-side {
  min-width: 0;
}

.side-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 14px;
}

.related-item {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
  border-radius: 6px;
}

.r-cover {
  position: relative;
  width: 150px;
  aspect-ratio: 16 / 10;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: #e8e8e8;
}

.r-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.related-item:hover .r-cover img {
  transform: scale(1.06);
}

.r-duration {
  position: absolute;
  right: 5px;
  bottom: 5px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 11px;
  padding: 0 5px;
  border-radius: 3px;
}

.r-info {
  min-width: 0;
}

.r-title {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  transition: color 0.2s;
}

.related-item:hover .r-title {
  color: var(--bili-pink);
}

.r-up {
  margin-top: 5px;
  font-size: 12px;
  color: var(--text-light);
}

.r-stats {
  margin-top: 3px;
  font-size: 12px;
  color: var(--text-light);
}

.state-box {
  padding: 80px 24px;
  text-align: center;
  color: var(--text-light);
  font-size: 15px;
}

.back-link {
  display: inline-block;
  margin-top: 16px;
  color: var(--bili-pink);
}

@media (max-width: 1000px) {
  .detail {
    grid-template-columns: 1fr;
  }
}
</style>
