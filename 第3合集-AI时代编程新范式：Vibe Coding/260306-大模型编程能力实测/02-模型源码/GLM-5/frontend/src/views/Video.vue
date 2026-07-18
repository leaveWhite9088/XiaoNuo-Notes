<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVideoStore, useUserStore } from '@/stores'
import { videoAPI, commentAPI, danmakuAPI, userAPI } from '@/api'
import type { VideoPage, Comment } from '@/types'

const route = useRoute()
const router = useRouter()
const videoStore = useVideoStore()
const userStore = useUserStore()

const loading = ref(true)
const videoInfo = ref<any>(null)
const videoPages = ref<VideoPage[]>([])
const currentCid = ref<number>(0)
const playUrl = ref<string>('')
const relatedVideos = ref<any[]>([])

// 评论
const comments = ref<Comment[]>([])
const commentText = ref('')
const commentPage = ref(1)
const commentTotal = ref(0)
const commentLoading = ref(false)

// 弹幕
const danmakuList = ref<any[]>([])
const danmakuText = ref('')
const showDanmaku = ref(true)

// 播放器引用
const videoRef = ref<HTMLVideoElement | null>(null)
const playerContainer = ref<HTMLDivElement | null>(null)

// 计算属性
const bvid = computed(() => route.params.bvid as string)
const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

const formatCount = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('zh-CN')
}

// 加载视频信息
const loadVideoInfo = async () => {
  loading.value = true
  try {
    // 获取视频信息
    const infoRes = await videoAPI.getInfo(bvid.value) as any
    if (infoRes.success && infoRes.data) {
      videoInfo.value = infoRes.data
    }

    // 获取分P
    const pagesRes = await videoAPI.getPages(bvid.value) as any
    if (pagesRes.success && pagesRes.data) {
      videoPages.value = pagesRes.data
      if (pagesRes.data.length > 0) {
        currentCid.value = pagesRes.data[0].cid
      }
    }

    // 获取播放地址
    if (currentCid.value) {
      await loadPlayUrl()
      await loadDanmaku()
    }

    // 获取相关视频
    const relatedRes = await videoAPI.getRelated(bvid.value) as any
    if (relatedRes.success && relatedRes.data) {
      relatedVideos.value = relatedRes.data
    }

    // 获取评论
    await loadComments()
  } catch (e) {
    console.error('加载视频失败', e)
  } finally {
    loading.value = false
  }
}

// 加载播放地址
const loadPlayUrl = async () => {
  try {
    const res = await videoAPI.getPlayUrl({ bvid: bvid.value, cid: currentCid.value }) as any
    if (res.success && res.data) {
      // 优先使用DASH，否则使用durl
      if (res.data.durl && res.data.durl.length > 0) {
        playUrl.value = res.data.durl[0].url
      } else if (res.data.dash && res.data.dash.video && res.data.dash.video.length > 0) {
        // DASH需要特殊处理，这里简单使用第一个视频流
        playUrl.value = res.data.dash.video[0].baseUrl || res.data.dash.video[0].base_url
      }
    }
  } catch (e) {
    console.error('获取播放地址失败', e)
  }
}

// 加载弹幕
const loadDanmaku = async () => {
  try {
    const res = await danmakuAPI.getList(currentCid.value, bvid.value) as any
    if (res.success && res.data) {
      danmakuList.value = res.data
    }
  } catch (e) {
    console.error('加载弹幕失败', e)
  }
}

// 加载评论
const loadComments = async () => {
  if (!videoInfo.value) return
  commentLoading.value = true
  try {
    const res = await commentAPI.getList(videoInfo.value.aid, commentPage.value) as any
    if (res.success && res.data) {
      comments.value = res.data.comments
      commentTotal.value = res.data.total
    }
  } catch (e) {
    console.error('加载评论失败', e)
  } finally {
    commentLoading.value = false
  }
}

// 切换分P
const switchPage = async (page: VideoPage) => {
  currentCid.value = page.cid
  await loadPlayUrl()
  await loadDanmaku()
}

// 发送评论
const sendComment = async () => {
  if (!commentText.value.trim()) return
  if (!userStore.isLoggedIn) {
    alert('请先登录')
    return
  }

  try {
    const res = await commentAPI.send({
      oid: videoInfo.value.aid,
      message: commentText.value
    }) as any
    if (res.success) {
      commentText.value = ''
      await loadComments()
    } else {
      alert(res.message || '发送失败')
    }
  } catch (e) {
    console.error('发送评论失败', e)
  }
}

// 发送弹幕
const sendDanmaku = async () => {
  if (!danmakuText.value.trim()) return
  if (!userStore.isLoggedIn) {
    alert('请先登录')
    return
  }

  if (!videoRef.value) return
  const currentTime = videoRef.value.currentTime

  try {
    const res = await danmakuAPI.send({
      oid: videoInfo.value.aid,
      message: danmakuText.value,
      time: currentTime
    }) as any
    if (res.success) {
      danmakuText.value = ''
      // 刷新弹幕
      await loadDanmaku()
    } else {
      alert(res.message || '发送失败')
    }
  } catch (e) {
    console.error('发送弹幕失败', e)
  }
}

// 收藏视频
const favoriteVideo = async () => {
  if (!userStore.isLoggedIn) {
    alert('请先登录')
    return
  }

  try {
    const res = await userAPI.favoriteVideo(videoInfo.value.aid) as any
    if (res.success) {
      alert('收藏成功')
    } else {
      alert(res.message || '收藏失败')
    }
  } catch (e) {
    console.error('收藏失败', e)
  }
}

// 跳转到官网
const goToOfficial = () => {
  if (videoInfo.value?.page_url) {
    window.open(videoInfo.value.page_url, '_blank')
  }
}

// 跳转到其他视频
const goToVideo = (video: any) => {
  router.push({ name: 'Video', params: { bvid: video.bvid } })
}

// 监听路由变化
watch(() => route.params.bvid, () => {
  if (route.params.bvid) {
    loadVideoInfo()
  }
})

onMounted(() => {
  loadVideoInfo()
})
</script>

<template>
  <div class="video-page">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
    </div>

    <template v-else-if="videoInfo">
      <div class="video-main">
        <!-- 播放器区域 -->
        <div class="player-section">
          <div ref="playerContainer" class="player-container">
            <video
              ref="videoRef"
              class="video-player"
              :src="playUrl"
              controls
              crossorigin="anonymous"
              preload="auto"
            >
              您的浏览器不支持视频播放
            </video>
          </div>

          <!-- 视频信息 -->
          <div class="video-info">
            <h1 class="video-title">{{ videoInfo.title }}</h1>
            <div class="video-stats">
              <span>{{ formatCount(videoInfo.view_count) }} 播放</span>
              <span>{{ formatCount(videoInfo.danmaku_count) }} 弹幕</span>
              <span>{{ formatDate(videoInfo.pubdate) }}</span>
            </div>

            <!-- 分P -->
            <div v-if="videoPages.length > 1" class="video-pages">
              <span class="pages-label">分P：</span>
              <div class="pages-list">
                <button
                  v-for="page in videoPages"
                  :key="page.cid"
                  :class="['page-btn', { active: page.cid === currentCid }]"
                  @click="switchPage(page)"
                >
                  P{{ page.page }} {{ page.part }}
                </button>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="video-actions">
              <button class="action-btn like">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                </svg>
                {{ formatCount(videoInfo.like_count) }}
              </button>
              <button class="action-btn coin">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <circle cx="12" cy="12" r="10" />
                </svg>
                {{ formatCount(videoInfo.coin_count) }}
              </button>
              <button class="action-btn favorite" @click="favoriteVideo">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                {{ formatCount(videoInfo.favorite_count) }}
              </button>
              <button class="action-btn share">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                </svg>
                分享
              </button>
              <button class="action-btn official" @click="goToOfficial">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
                官网观看
              </button>
            </div>

            <!-- UP主信息 -->
            <div class="owner-info">
              <div class="avatar">
                <img :src="videoInfo.owner.face" :alt="videoInfo.owner.name" />
              </div>
              <div class="owner-detail">
                <span class="owner-name">{{ videoInfo.owner.name }}</span>
                <span class="owner-sign">{{ videoInfo.owner.sign || '这个人很懒，什么都没写' }}</span>
              </div>
            </div>

            <!-- 视频简介 -->
            <div class="video-desc">
              <h3>视频简介</h3>
              <p>{{ videoInfo.description || '暂无简介' }}</p>
              <div v-if="videoInfo.tags.length > 0" class="video-tags">
                <span v-for="tag in videoInfo.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 弹幕/评论区 -->
        <div class="interaction-section">
          <!-- 弹幕输入 -->
          <div class="danmaku-input">
            <input
              v-model="danmakuText"
              type="text"
              placeholder="发送弹幕..."
              maxlength="100"
              @keyup.enter="sendDanmaku"
            />
            <button class="btn btn-primary" @click="sendDanmaku">发送</button>
            <button class="btn btn-secondary" @click="showDanmaku = !showDanmaku">
              {{ showDanmaku ? '隐藏' : '显示' }}弹幕
            </button>
          </div>

          <!-- 评论区 -->
          <div class="comments-section">
            <h3>评论 ({{ commentTotal }})</h3>

            <!-- 发送评论 -->
            <div v-if="userStore.isLoggedIn" class="comment-input">
              <textarea
                v-model="commentText"
                placeholder="发一条友善的评论~"
                maxlength="1000"
              ></textarea>
              <button class="btn btn-primary" @click="sendComment">发表评论</button>
            </div>
            <div v-else class="login-tip">
              <router-link to="/login">登录</router-link> 后参与评论
            </div>

            <!-- 评论列表 -->
            <div v-if="commentLoading" class="loading">
              <div class="loading-spinner"></div>
            </div>
            <div v-else class="comments-list">
              <div v-for="comment in comments" :key="comment.rpid" class="comment-item">
                <div class="avatar avatar-sm">
                  <img :src="comment.member.face" :alt="comment.member.name" />
                </div>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="username">{{ comment.member.name }}</span>
                    <span class="time">{{ formatDate(comment.ctime) }}</span>
                  </div>
                  <p class="comment-text">{{ comment.content }}</p>
                  <div class="comment-actions">
                    <span class="like">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                      </svg>
                      {{ comment.like }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-if="comments.length === 0" class="empty">
                <p>暂无评论</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 侧边栏 - 相关视频 -->
      <div class="sidebar-section">
        <h3>相关推荐</h3>
        <div class="related-list">
          <div
            v-for="video in relatedVideos"
            :key="video.bvid"
            class="related-item"
            @click="goToVideo(video)"
          >
            <div class="cover">
              <img :src="video.cover" :alt="video.title" />
              <span class="duration">{{ formatDuration(video.duration) }}</span>
            </div>
            <div class="info">
              <h4 class="title">{{ video.title }}</h4>
              <span class="author">{{ video.author }}</span>
              <span class="play">{{ formatCount(video.play) }} 播放</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.video-page {
  display: flex;
  gap: var(--spacing-lg);
  max-width: 1400px;
  margin: 0 auto;
}

.video-main {
  flex: 1;
  min-width: 0;
}

.loading {
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl);
}

.player-section {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

.player-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #000;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-info {
  padding: var(--spacing-lg);
}

.video-title {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: var(--spacing-sm);
}

.video-stats {
  display: flex;
  gap: var(--spacing-md);
  font-size: 12px;
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-md);
}

.video-pages {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
}

.pages-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.pages-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.page-btn {
  padding: 4px 12px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.page-btn:hover {
  border-color: var(--bili-pink);
  color: var(--bili-pink);
}

.page-btn.active {
  background-color: var(--bili-pink);
  border-color: var(--bili-pink);
  color: white;
}

.video-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--bg-secondary);
  border: none;
  border-radius: var(--border-radius);
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background-color: var(--bg-hover);
}

.action-btn.like:hover {
  color: var(--bili-pink);
}

.action-btn.coin:hover {
  color: #FFB020;
}

.action-btn.favorite:hover {
  color: var(--bili-pink);
}

.action-btn.official {
  background-color: var(--bili-pink);
  color: white;
}

.owner-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-lg);
}

.owner-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.owner-name {
  font-weight: 500;
  color: var(--text-primary);
}

.owner-sign {
  font-size: 12px;
  color: var(--text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

.video-desc {
  margin-bottom: var(--spacing-lg);
}

.video-desc h3 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: var(--spacing-sm);
}

.video-desc p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  white-space: pre-wrap;
}

.video-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-md);
}

.interaction-section {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.danmaku-input {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.danmaku-input input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
}

.comments-section h3 {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: var(--spacing-md);
}

.comment-input {
  margin-bottom: var(--spacing-lg);
}

.comment-input textarea {
  width: 100%;
  min-height: 80px;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  resize: vertical;
  margin-bottom: var(--spacing-sm);
}

.login-tip {
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.login-tip a {
  color: var(--bili-pink);
}

.comment-item {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--border-color);
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: 4px;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: var(--bili-blue);
}

.time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.comment-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
}

.comment-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xs);
}

.comment-actions .like {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-tertiary);
  cursor: pointer;
}

.sidebar-section {
  width: 360px;
  flex-shrink: 0;
}

.sidebar-section h3 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: var(--spacing-md);
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.related-item {
  display: flex;
  gap: var(--spacing-sm);
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.related-item:hover {
  opacity: 0.8;
}

.related-item .cover {
  position: relative;
  width: 140px;
  flex-shrink: 0;
  aspect-ratio: 16 / 9;
  border-radius: var(--border-radius);
  overflow: hidden;
  background-color: var(--bg-tertiary);
}

.related-item .cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-item .duration {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 11px;
  padding: 1px 4px;
  border-radius: 2px;
}

.related-item .info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.related-item .title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.related-item:hover .title {
  color: var(--bili-pink);
}

.related-item .author,
.related-item .play {
  font-size: 12px;
  color: var(--text-tertiary);
}

.empty {
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--text-tertiary);
}

@media (max-width: 1024px) {
  .video-page {
    flex-direction: column;
  }

  .sidebar-section {
    width: 100%;
  }

  .related-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing-md);
  }

  .related-item {
    flex-direction: column;
  }

  .related-item .cover {
    width: 100%;
  }
}
</style>
