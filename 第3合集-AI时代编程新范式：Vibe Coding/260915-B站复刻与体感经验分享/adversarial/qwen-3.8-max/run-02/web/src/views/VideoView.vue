<script setup>
import { ref, watch, computed, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../api.js';
import { toast } from '../toast.js';
import { formatCount, timeAgo } from '../utils.js';
import VideoCard from '../components/VideoCard.vue';

const route = useRoute();
const router = useRouter();

const DEFAULT_TITLE = '哔哩哔哩 (゜-゜)つロ 干杯~';

const video = ref(null);
const related = ref([]);
const loading = ref(true);
const notFound = ref(false); // 业务 404
const error = ref(null);     // 网络/服务错误（与 404 区分，P3-2）

// 本地交互状态（点赞/投币/收藏/关注，仅前端记录）
const liked = ref(false);
const coined = ref(false);
const favored = ref(false);
const followed = ref(false);

const likeCount = computed(() => (video.value ? video.value.stat.like + (liked.value ? 1 : 0) : 0));
const coinCount = computed(() => (video.value ? video.value.stat.coin + (coined.value ? 1 : 0) : 0));
const favCount = computed(() => (video.value ? video.value.stat.favorite + (favored.value ? 1 : 0) : 0));

async function load(id) {
  loading.value = true;
  notFound.value = false;
  error.value = null;
  liked.value = coined.value = favored.value = followed.value = false;
  try {
    const data = await api.getVideo(id);
    video.value = data.video;
    related.value = data.related;
    document.title = `${data.video.title}_哔哩哔哩_bilibili`;
  } catch (e) {
    if (e.status === 404) notFound.value = true;
    else error.value = e; // 网络异常 / 服务不可用
  } finally {
    loading.value = false;
  }
}

watch(() => route.params.id, (id) => id && load(id), { immediate: true });

// P3-6：离开详情页恢复默认标题
onBeforeUnmount(() => {
  document.title = DEFAULT_TITLE;
});

const goHome = () => router.push('/');
const openVideo = (v) => router.push(`/video/${v.id}`);
// P3-5：点击 UP 主名 = 按 UP 主搜索（真实可用行为）
const searchByUp = () => {
  if (video.value) router.push({ path: '/', query: { keyword: video.value.owner.name } });
};
const onLater = () => toast('「稍后再看」V0 暂未开放');
</script>

<template>
  <main class="video-page">
    <div class="container">
      <!-- 返回 -->
      <div class="topbar">
        <button class="back-btn" @click="goHome" title="返回首页">
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M10.8 4.8L9.4 3.4 1 12l8.4 8.6 1.4-1.4L4.7 13H23v-2H4.7l6.1-6.2z" fill="currentColor"/></svg>
          返回首页
        </button>
        <span v-if="video" class="crumb">
          <router-link to="/">首页</router-link>
          <i>›</i>
          <span>{{ video.channel }}</span>
          <i>›</i>
          <span class="cur">视频详情</span>
        </span>
      </div>

      <div v-if="loading" class="state">加载中…</div>

      <!-- P3-2：网络/服务错误态，可重试 -->
      <div v-else-if="error" class="state">
        加载失败：后端服务不可用或网络异常
        <button class="retry-btn" @click="load(route.params.id)">重试</button>
      </div>

      <!-- 业务 404 -->
      <div v-else-if="notFound" class="state">
        视频不存在或已被移除
        <button class="retry-btn" @click="goHome">返回首页</button>
      </div>

      <div v-else class="layout">
        <!-- 左：播放器 + 信息 -->
        <div class="main-col">
          <div class="player-wrap">
            <!-- P3-8：muted 自动播放，符合浏览器自动播放策略 -->
            <video
              :key="video.id"
              class="player"
              :poster="video.cover"
              controls
              autoplay
              muted
              preload="metadata"
            >
              <source :src="video.src" type="video/mp4" />
              当前浏览器不支持 video 播放
            </video>
            <div class="player-badge">正在播放：本地样例视频流（默认静音，可点击取消静音）</div>
          </div>

          <h1 class="video-title">{{ video.title }}</h1>

          <div class="video-meta">
            <span class="meta-item">
              <svg viewBox="0 0 24 24" width="14" height="14"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
              {{ formatCount(video.stat.view) }}
            </span>
            <span class="meta-item">
              <svg viewBox="0 0 24 24" width="14" height="14"><path d="M4 4h16v12H5.2L4 17.2V4zm2 2v6.8l.8-.8H18V6H6z" fill="currentColor"/></svg>
              {{ formatCount(video.stat.danmaku) }}
            </span>
            <span class="meta-item">{{ timeAgo(video.pubdate) }}</span>
            <span class="meta-tag">{{ video.category }}</span>
            <div class="actions">
              <button class="act" :class="{ on: liked }" @click="liked = !liked" title="点赞（V0 仅本地状态）">
                <svg viewBox="0 0 24 24" width="16" height="16"><path d="M2 21h4V9H2v12zm20-11c0-1.1-.9-2-2-2h-6.3l1-4.6c.1-.5-.1-1-.4-1.4L13.3 1 7.6 6.7C7.2 7 7 7.5 7 8v11c0 1.1.9 2 2 2h9c.8 0 1.5-.5 1.8-1.2l3-7c.1-.3.2-.6.2-.8v-2z" fill="currentColor"/></svg>
                {{ formatCount(likeCount) }}
              </button>
              <button class="act" :class="{ on: coined }" @click="coined = !coined" title="投币（V0 仅本地状态）">
                <svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="16" font-size="10" text-anchor="middle" fill="currentColor">币</text></svg>
                {{ formatCount(coinCount) }}
              </button>
              <button class="act" :class="{ on: favored }" @click="favored = !favored" title="收藏（V0 仅本地状态）">
                <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 17.3L5.8 21l1.7-7L2 9.2l7.2-.6L12 2l2.8 6.6 7.2.6-5.5 4.8 1.7 7z" fill="currentColor"/></svg>
                {{ formatCount(favCount) }}
              </button>
              <button class="act" title="转发（V0 暂未开放）" @click="toast('「转发」V0 暂未开放')">
                <svg viewBox="0 0 24 24" width="16" height="16"><path d="M14 9V5l8 7-8 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z" fill="currentColor"/></svg>
                {{ formatCount(video.stat.share) }}
              </button>
            </div>
          </div>

          <!-- UP 主卡片 -->
          <div class="up-card">
            <img class="up-face" :src="video.owner.face" :alt="video.owner.name" />
            <div class="up-info">
              <div class="up-name" title="点击搜索该 UP 主" @click="searchByUp">{{ video.owner.name }}</div>
              <div class="up-desc">{{ video.desc === '-' ? '这个人很懒，什么都没写~' : video.desc }}</div>
            </div>
            <button class="follow-btn" :class="{ on: followed }" @click="followed = !followed" title="关注（V0 仅本地状态）">
              {{ followed ? '已关注' : '+ 关注' }}
            </button>
          </div>
        </div>

        <!-- 右：相关推荐 -->
        <aside class="side-col">
          <h2 class="side-title">相关推荐</h2>
          <div class="related-list">
            <VideoCard
              v-for="r in related"
              :key="r.id"
              :video="r"
              horizontal
              @click="openVideo"
              @later="onLater"
            />
          </div>
        </aside>
      </div>
    </div>
  </main>
</template>

<style scoped>
.video-page {
  flex: 1;
  margin-top: var(--header-h);
  padding-bottom: 40px;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 14px 0 10px;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--text-sub);
  font-size: 13px;
  transition: all 0.15s;
}
.back-btn:hover {
  color: var(--bili-pink);
  border-color: var(--bili-pink);
  background: #fff0f5;
}
.crumb {
  font-size: 13px;
  color: var(--text-light);
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.crumb a:hover {
  color: var(--bili-pink);
}
.crumb .cur {
  color: var(--text-sub);
}

.state {
  padding: 80px 0;
  text-align: center;
  color: var(--text-light);
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}
.retry-btn {
  padding: 8px 30px;
  font-size: 14px;
  color: var(--bili-pink);
  background: #fff;
  border: 1px solid var(--bili-pink);
  border-radius: 8px;
}
.retry-btn:hover {
  background: var(--bili-pink);
  color: #fff;
}

.layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}
.main-col {
  flex: 1;
  min-width: 0;
}
.side-col {
  width: 380px;
  flex-shrink: 0;
}

/* 播放器 */
.player-wrap {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
  aspect-ratio: 16 / 9;
}
.player {
  width: 100%;
  height: 100%;
  display: block;
  background: #000;
}
.player-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 5;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  pointer-events: none;
}

.video-title {
  font-size: 20px;
  line-height: 1.45;
  margin: 16px 0 10px;
  font-weight: 600;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--text-light);
  font-size: 13px;
  flex-wrap: wrap;
}
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.meta-tag {
  color: var(--bili-blue);
  background: #e8f6fd;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
}
.actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
.act {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid var(--border);
  color: var(--text-sub);
  font-size: 13px;
  transition: all 0.15s;
}
.act:hover {
  color: var(--bili-pink);
  border-color: var(--bili-pink);
}
.act.on {
  color: #fff;
  background: var(--bili-pink);
  border-color: var(--bili-pink);
}

/* UP 卡片 */
.up-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 18px;
  margin-top: 18px;
}
.up-face {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid #fff0f5;
}
.up-info {
  min-width: 0;
}
.up-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
  cursor: pointer;
  width: fit-content;
}
.up-name:hover {
  color: var(--bili-pink);
}
.up-desc {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-light);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.follow-btn {
  margin-left: auto;
  padding: 8px 20px;
  border-radius: 8px;
  background: var(--bili-pink);
  color: #fff;
  font-size: 13px;
  flex-shrink: 0;
  transition: all 0.15s;
}
.follow-btn:hover {
  opacity: 0.85;
}
.follow-btn.on {
  background: #f6f7f8;
  color: var(--text-sub);
  border: 1px solid var(--border);
}

/* 侧栏 */
.side-title {
  font-size: 15px;
  font-weight: 600;
  padding: 4px 6px 12px;
  color: var(--text-main);
}
.related-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--border);
  padding: 8px;
}

@media (max-width: 1000px) {
  .layout {
    flex-direction: column;
  }
  .side-col {
    width: 100%;
  }
}
</style>
