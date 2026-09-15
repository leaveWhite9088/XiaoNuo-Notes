<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { api, formatViews, formatDuration, formatPubdate, type Video, type Comment, type Up } from '@/api'
import VideoCard from '@/components/VideoCard.vue'
import { useUIStore } from '@/stores/ui'

const route = useRoute()
const router = useRouter()
const ui = useUIStore()

const loading = ref(true)
const error = ref<string | null>(null)
const video = ref<Video | null>(null)
const related = ref<Video[]>([])
const comments = ref<Comment[]>([])

async function load(bvid: string) {
  loading.value = true
  error.value = null
  video.value = null
  related.value = []
  comments.value = []
  try {
    const r = await api.video(bvid)
    video.value = r.data.video
    related.value = r.data.related
    comments.value = r.data.comments
  } catch (e: any) {
    error.value = e?.message ?? '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => load(String(route.params.bvid)))
watch(() => route.params.bvid, (v) => v && load(String(v)))

const actionLike = ref(0)
const actionCoin = ref(0)
const actionFav = ref(0)
function toggleLike() {
  actionLike.value = actionLike.value ? 0 : 1
}
function toggleCoin() {
  actionCoin.value = actionCoin.value ? 0 : 1
}
function toggleFav() {
  actionFav.value = actionFav.value ? 0 : 1
}
function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

const formattedDesc = computed(() => (video.value?.description ?? '').split('\n'))

// B 站会用一个公开测试视频作为视频源
const SAMPLE_VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4'
const sampleVideos = [
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://media.w3.org/2010/05/bunny/movie.mp4',
]
</script>

<template>
  <div class="video-view">
    <div class="container">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
        返回
      </button>

      <div v-if="loading" class="state">加载中…</div>
      <div v-else-if="error" class="state error">{{ error }}</div>

      <div v-else-if="video" class="layout">
        <div class="col-main">
          <!-- 播放器 -->
          <div class="player">
            <video
              :src="SAMPLE_VIDEO"
              :poster="video.cover"
              controls
              autoplay
              muted
              playsinline
              class="video-el"
            ></video>
            <div class="player-tip">提示：演示用播放器 · 实际视频源：W3C 公共测试 mp4</div>
          </div>

          <!-- 标题 + 数据 -->
          <h1 class="title">{{ video.title }}</h1>
          <div class="data-row">
            <div class="data-left">
              <span class="data-item">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M12 5C7 5 2.7 8.1 1 12c1.7 3.9 6 7 11 7s9.3-3.1 11-7c-1.7-3.9-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                </svg>
                {{ formatViews(video.views) }}播放
              </span>
              <span class="data-item">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                </svg>
                {{ formatViews(video.danmaku) }}弹幕
              </span>
              <span class="data-item">{{ formatPubdate(video.pubdate) }}</span>
              <span class="data-item">{{ video.typename }} · {{ formatDuration(video.duration) }}</span>
            </div>
          </div>

          <!-- 操作栏 -->
          <div class="actions">
            <button class="action" :class="{ active: actionLike }" @click="toggleLike">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
              </svg>
              <span>{{ formatViews(video.likes + (actionLike ? 1 : 0)) }}</span>
              <em>点赞</em>
            </button>
            <button class="action" :class="{ active: actionCoin }" @click="toggleCoin">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.91-1.51 2.9-3.12 3.19z" />
              </svg>
              <span>{{ formatViews(video.coins + (actionCoin ? 1 : 0)) }}</span>
              <em>投币</em>
            </button>
            <button class="action" :class="{ active: actionFav }" @click="toggleFav">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
              </svg>
              <span>{{ formatViews(video.favorites + (actionFav ? 1 : 0)) }}</span>
              <em>收藏</em>
            </button>
            <button class="action" :class="{ active: ui.isInWatchLater(video.bvid) }" @click="ui.toggleWatchLater(video.bvid)">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 8v4l3 3 .7-.7-2.7-2.7V8H12zm0-5a9 9 0 1 0 9 9 9 9 0 0 0-9-9zm0 16.5a7.5 7.5 0 1 1 7.5-7.5 7.5 7.5 0 0 1-7.5 7.5z" />
              </svg>
              <span>{{ ui.isInWatchLater(video.bvid) ? '已加入' : '稍后再看' }}</span>
            </button>
            <button class="action">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.15c-.05.21-.08.43-.08.66 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
              </svg>
              <em>分享</em>
            </button>
          </div>

          <!-- 描述 -->
          <div class="desc">
            <div class="up-row">
              <img :src="video.up.avatar" :alt="video.up.name" class="up-avatar" />
              <div class="up-info">
                <div class="up-name">
                  {{ video.up.name }}
                  <span v-if="video.up.isVerified" class="verified">✓</span>
                </div>
                <div class="up-fans">{{ formatViews(video.up.fans) }}粉丝</div>
              </div>
              <button class="btn-brand follow">+ 关注</button>
            </div>
            <div class="desc-body">
              <p v-for="(line, i) in formattedDesc" :key="i">{{ line }}</p>
            </div>
            <div class="tags">
              <span v-for="t in video.tags" :key="t" class="tag">#{{ t }}</span>
            </div>
          </div>

          <!-- 评论 -->
          <div class="comment-section">
            <h3 class="cmt-title">评论 <span class="cmt-count">{{ comments.length }}</span></h3>
            <div class="cmt-input">
              <input type="text" placeholder="说点什么吧…" />
              <button class="btn-brand">发送</button>
            </div>
            <ul class="cmt-list">
              <li v-for="c in comments" :key="c.rpid" class="cmt-item">
                <img :src="c.avatar" :alt="c.uname" />
                <div class="cmt-content">
                  <div class="cmt-name">{{ c.uname }}</div>
                  <div class="cmt-msg">{{ c.message }}</div>
                  <div class="cmt-meta">
                    <span>{{ formatPubdate(c.ctime) }}</span>
                    <span class="cmt-like">👍 {{ c.like }}</span>
                    <span class="cmt-reply">回复</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- 右侧推荐 -->
        <aside class="col-side">
          <h3 class="related-title">相关推荐</h3>
          <div class="related-list">
            <VideoCard v-for="v in related.slice(0, 10)" :key="v.bvid" :video="v" size="small" :show-up="false" />
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.video-view {
  padding: 16px 0 32px;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: var(--radius);
  color: var(--text-2);
  font-size: 13px;
  margin-bottom: 16px;
  transition: background 0.15s, color 0.15s;
  &:hover {
    background: var(--bg-2);
    color: var(--brand);
  }
}
.state {
  text-align: center;
  padding: 80px 0;
  color: var(--text-3);
  &.error {
    color: #d65481;
  }
}
.layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
}
.player {
  position: relative;
  background: #000;
  border-radius: var(--radius-lg);
  overflow: hidden;
  aspect-ratio: 16 / 9;
  .video-el {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .player-tip {
    position: absolute;
    top: 12px;
    left: 12px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    pointer-events: none;
  }
}
.title {
  font-size: 20px;
  font-weight: 600;
  margin: 16px 0 8px;
}
.data-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-3);
  .data-left {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .data-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}
.actions {
  display: flex;
  gap: 12px;
  margin: 16px 0;
  flex-wrap: wrap;
  .action {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: var(--bg-2);
    border-radius: 20px;
    color: var(--text);
    font-size: 13px;
    transition: background 0.15s, color 0.15s;
    span {
      font-weight: 500;
    }
    em {
      font-style: normal;
      color: var(--text-2);
    }
    &:hover {
      background: var(--bg-3);
    }
    &.active {
      background: var(--brand);
      color: #fff;
      em {
        color: rgba(255, 255, 255, 0.85);
      }
    }
  }
}
.desc {
  background: var(--bg-2);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin: 16px 0;
  .up-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    .up-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }
    .up-info {
      flex: 1;
      .up-name {
        font-size: 15px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 4px;
        .verified {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
          background: var(--brand);
          color: #fff;
          border-radius: 50%;
          font-size: 10px;
        }
      }
      .up-fans {
        font-size: 12px;
        color: var(--text-3);
      }
    }
    .follow {
      padding: 6px 16px;
      border-radius: 16px;
    }
  }
  .desc-body {
    font-size: 14px;
    color: var(--text);
    line-height: 1.7;
    p {
      margin: 0 0 4px;
    }
  }
  .tags {
    margin-top: 8px;
    .tag {
      display: inline-block;
      color: var(--blue-link);
      font-size: 12px;
      margin-right: 12px;
    }
  }
}
.comment-section {
  margin-top: 24px;
  .cmt-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    .cmt-count {
      font-size: 13px;
      color: var(--text-3);
      font-weight: 400;
      margin-left: 6px;
    }
  }
  .cmt-input {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    input {
      flex: 1;
      height: 38px;
      padding: 0 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.15s;
      &:focus {
        border-color: var(--brand);
      }
    }
  }
  .cmt-list {
    .cmt-item {
      display: flex;
      gap: 12px;
      padding: 12px 0;
      border-top: 1px solid var(--border-2);
      img {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .cmt-content {
        flex: 1;
        .cmt-name {
          font-size: 13px;
          color: var(--text-2);
          margin-bottom: 4px;
        }
        .cmt-msg {
          font-size: 14px;
          line-height: 1.5;
        }
        .cmt-meta {
          display: flex;
          gap: 16px;
          margin-top: 4px;
          font-size: 12px;
          color: var(--text-3);
          .cmt-reply {
            cursor: pointer;
            &:hover {
              color: var(--brand);
            }
          }
        }
      }
    }
  }
}
.col-side {
  .related-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 12px;
  }
  .related-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}
@media (max-width: 1100px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .col-side {
    margin-top: 16px;
  }
}
</style>
