<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import Icon from '@/components/common/Icon.vue';
import VideoPlayer from '@/components/player/VideoPlayer.vue';
import CommentSection from '@/components/video/CommentSection.vue';
import VideoCard from '@/components/video/VideoCard.vue';
import { videoApi } from '@/api';
import { useHistoryStore } from '@/stores/history';
import { useUiStore } from '@/stores/ui';
import type { DanmakuItem, Interaction, VideoDetail } from '@/types';
import { avatarColor, nameInitial, PLACEHOLDER_COVER } from '@/utils';

/**
 * 视频详情 / 播放页：播放器 + 弹幕 + 互动 + UP主 + 简介标签 + 评论 + 相关推荐。
 * 主链路：首页卡片点击 -> 本页自动/手动播放 -> 记录历史 -> 返回首页/继续点相关视频。
 */
const route = useRoute();
const router = useRouter();
const history = useHistoryStore();
const ui = useUiStore();

const bvid = computed(() => String(route.params.bvid ?? ''));
const detail = ref<VideoDetail | null>(null);
const danmaku = ref<DanmakuItem[]>([]);
const playUrl = ref('');
const interaction = ref<Interaction>({ liked: false, coined: false, faved: false, followed: false });
const loading = ref(true);
const error = ref('');
const followed = ref(false);
const actionHint = ref('');
const danmakuCount = ref(0);

const likeCount = computed(() => (detail.value?.video.like ?? 0) + (interaction.value.liked ? 1 : 0));
const coinCount = computed(() => (detail.value?.video.coin ?? 0) + (interaction.value.coined ? 1 : 0));
const favCount = computed(() => (detail.value?.video.favorite ?? 0) + (interaction.value.faved ? 1 : 0));

function formatCount(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}亿`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}万`;
  return String(n);
}

async function load(bvidValue: string) {
  if (!bvidValue) return;
  loading.value = true;
  error.value = '';
  try {
    const data = await videoApi.detail(bvidValue);
    detail.value = data;
    interaction.value = data.interaction;
    followed.value = data.interaction.followed;
    danmakuCount.value = data.danmakuCount;
    document.title = `${data.video.title} - 哔哩哔哩`;

    const [play, dm] = await Promise.all([
      videoApi.play(bvidValue),
      videoApi.danmaku(bvidValue),
    ]);
    playUrl.value = play.url;
    danmaku.value = dm;
  } catch (err) {
    error.value = err instanceof Error ? err.message : '视频加载失败';
  } finally {
    loading.value = false;
  }
}

onMounted(() => load(bvid.value));
watch(bvid, (v) => void load(v));

async function toggle(field: 'liked' | 'coined' | 'faved') {
  const names = { liked: '点赞', coined: '投币', faved: '收藏' } as const;
  try {
    const data = await videoApi.toggle(bvid.value, field);
    interaction.value = data;
    actionHint.value = `${names[field]}${data[field] ? '成功' : '已取消'}`;
  } catch (err) {
    ui.error(err instanceof Error ? err.message : `${names[field]}失败`);
  } finally {
    setTimeout(() => (actionHint.value = ''), 1600);
  }
}

async function toggleFollow() {
  try {
    const data = await videoApi.toggle(bvid.value, 'followed');
    followed.value = data.followed;
    actionHint.value = data.followed ? '已关注 UP 主' : '已取消关注';
  } catch (err) {
    ui.error(err instanceof Error ? err.message : '关注失败');
  } finally {
    setTimeout(() => (actionHint.value = ''), 1600);
  }
}

function onProgress(payload: { currentTime: number; duration: number }) {
  if (!payload.duration) return;
  // store 内部已吞掉异常，进度上报失败不影响播放
  void history.record(bvid.value, payload.currentTime / payload.duration);
}

/** 弹幕绑定发送时的播放进度，刷新后仍在同一时点出现 */
async function onSendDanmaku(payload: { text: string; timeMs: number }) {
  try {
    const res = await videoApi.sendDanmaku(bvid.value, payload.text, payload.timeMs);
    danmaku.value = [...danmaku.value, res].sort((a, b) => a.time - b.time);
    danmakuCount.value += 1;
  } catch (err) {
    ui.error(err instanceof Error ? err.message : '弹幕发送失败');
  }
}

function copyLink() {
  const url = window.location.href;
  const done = () => {
    actionHint.value = '视频链接已复制';
    setTimeout(() => (actionHint.value = ''), 1600);
  };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(url).then(done).catch(() => ui.notify(`视频链接：${url}`));
  } else {
    ui.notify(`视频链接：${url}`);
  }
}
</script>

<template>
  <div class="detail bili-container">
    <div class="detail__crumb">
      <RouterLink to="/" class="detail__back"><Icon name="i-left" :size="16" />返回首页</RouterLink>
      <span v-if="detail" class="detail__crumb-cat">
        <RouterLink :to="{ name: 'category', params: { slug: detail.video.categorySlug } }">
          {{ detail.video.tname }}
        </RouterLink>
        <span class="detail__crumb-sep">/</span>
        <span class="ellipsis">{{ detail.video.title }}</span>
      </span>
    </div>

    <div v-if="loading" class="detail__loading">
      <div class="detail__loading-player"></div>
      <p>正在加载视频...</p>
    </div>

    <div v-else-if="error" class="detail__error">
      <p class="detail__error-title">{{ error }}</p>
      <RouterLink to="/" class="btn-primary detail__error-btn">返回首页</RouterLink>
    </div>

    <div v-else-if="detail" class="detail__layout">
      <!-- 主列 -->
      <div class="detail__main">
        <VideoPlayer
          :src="playUrl"
          :poster="detail.video.cover"
          :title="detail.video.title"
          :danmaku="danmaku"
          @progress="onProgress"
          @send-danmaku="onSendDanmaku"
        />

        <h1 class="detail__title">{{ detail.video.title }}</h1>

        <div class="detail__stats">
          <span><Icon name="i-play" :size="15" />{{ detail.video.playText }} 播放</span>
          <span><Icon name="i-danmaku" :size="15" />{{ formatCount(danmakuCount) }} 弹幕</span>
          <span><Icon name="i-clock" :size="15" />{{ detail.video.pubdateText }}</span>
          <span class="detail__bvid">BV{{ bvid.replace(/^BV/, '') }}</span>
        </div>

        <!-- 互动条 -->
        <div class="actions">
          <button class="actions__item" :class="{ 'is-active': interaction.liked }" @click="toggle('liked')">
            <Icon name="i-like" :size="26" />
            <span>{{ formatCount(likeCount) }}</span>
            <em>点赞</em>
          </button>
          <button class="actions__item" :class="{ 'is-active': interaction.coined }" @click="toggle('coined')">
            <Icon name="i-coin" :size="26" />
            <span>{{ formatCount(coinCount) }}</span>
            <em>投币</em>
          </button>
          <button class="actions__item" :class="{ 'is-active': interaction.faved }" @click="toggle('faved')">
            <Icon name="i-favorite" :size="26" />
            <span>{{ formatCount(favCount) }}</span>
            <em>收藏</em>
          </button>
          <button class="actions__item" @click="copyLink">
            <Icon name="i-share" :size="26" />
            <span>{{ detail.video.share }}</span>
            <em>分享</em>
          </button>
          <Transition name="fade">
            <span v-if="actionHint" class="actions__hint">{{ actionHint }}</span>
          </Transition>
        </div>

        <!-- UP 主 + 简介 -->
        <section class="info">
          <div class="info__owner">
            <img
              v-if="detail.owner.avatar"
              class="info__avatar"
              :src="detail.owner.avatar"
              alt=""
            />
            <span
              v-else
              class="info__avatar info__avatar--text"
              :style="{ background: avatarColor(detail.owner.name) }"
              >{{ nameInitial(detail.owner.name) }}</span
            >
            <div class="info__owner-body">
              <div class="info__owner-name">{{ detail.owner.name }}</div>
              <div class="info__owner-meta">
                {{ formatCount(detail.owner.fans) }} 粉丝 · {{ detail.owner.videos }} 个投稿
              </div>
            </div>
            <button class="info__follow" :class="{ 'is-followed': followed }" @click="toggleFollow">
              {{ followed ? '已关注' : '+ 关注' }}
            </button>
          </div>

          <div class="info__desc">
            <p class="info__desc-title">视频简介</p>
            <p class="info__desc-text">{{ detail.video.description }}</p>
            <div class="info__tags">
              <button
                v-for="tag in detail.tags"
                :key="tag"
                class="info__tag"
                @click="router.push({ name: 'search', query: { keyword: tag } })"
              >
                {{ tag }}
              </button>
            </div>
          </div>
        </section>

        <CommentSection :bvid="bvid" :reply-count="detail.video.reply" />
      </div>

      <!-- 侧栏 -->
      <aside class="detail__side">
        <section class="side-card">
          <header class="side-card__head">
            <Icon name="i-user" :size="16" />
            <h3>UP主</h3>
          </header>
          <div class="side-card__owner">
            <img v-if="detail.owner.avatar" class="side-card__avatar" :src="detail.owner.avatar" alt="" />
            <span
              v-else
              class="side-card__avatar side-card__avatar--text"
              :style="{ background: avatarColor(detail.owner.name) }"
              >{{ nameInitial(detail.owner.name) }}</span
            >
            <div class="side-card__owner-info">
              <b>{{ detail.owner.name }}</b>
              <em>{{ formatCount(detail.owner.fans) }} 粉丝</em>
            </div>
            <button class="side-card__follow" :class="{ 'is-followed': followed }" @click="toggleFollow">
              {{ followed ? '已关注' : '关注' }}
            </button>
          </div>
          <p class="side-card__sign">{{ detail.owner.sign }}</p>
        </section>

        <section class="side-card">
          <header class="side-card__head">
            <Icon name="i-fire" :size="16" class="side-card__fire" />
            <h3>相关推荐</h3>
          </header>
          <div class="side-card__list">
            <VideoCard v-for="item in detail.related" :key="item.bvid" :video="item" variant="mini" />
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.detail {
  padding-bottom: 40px;
}
.detail__crumb {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0 10px;
  font-size: 13px;
  color: var(--text-3);
}
.detail__back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-2);
  padding: 4px 10px;
  border-radius: var(--radius);
  background: var(--bg-gray);
  transition: all 0.18s;
  flex: none;
}
.detail__back:hover {
  color: var(--bili-pink);
  background: var(--bili-pink-light);
}
.detail__crumb-cat {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.detail__crumb-cat a {
  color: var(--bili-pink);
}
.detail__crumb-sep {
  color: var(--text-4);
}

.detail__loading,
.detail__error {
  padding: 80px 0;
  text-align: center;
  color: var(--text-3);
}
.detail__loading-player {
  width: 100%;
  max-width: 900px;
  aspect-ratio: 16 / 9;
  margin: 0 auto 16px;
  border-radius: var(--radius);
  background: linear-gradient(90deg, #f1f2f3 25%, #e8eaec 37%, #f1f2f3 63%);
  background-size: 400% 100%;
  animation: shimmer 1.3s ease infinite;
}
@keyframes shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
.detail__error-title {
  font-size: 16px;
  color: var(--text-2);
  margin-bottom: 16px;
}
.detail__error-btn {
  display: inline-block;
  padding: 8px 20px;
  font-size: 14px;
}

.detail__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 350px;
  gap: 30px;
  margin-top: 8px;
}
.detail__main {
  min-width: 0;
}

.detail__title {
  margin-top: 16px;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  word-break: break-word;
}
.detail__stats {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 10px;
  font-size: 13px;
  color: var(--text-3);
}
.detail__stats span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.detail__bvid {
  margin-left: auto;
  color: var(--text-4);
}

.actions {
  position: relative;
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 14px 0;
  margin-top: 10px;
  border-top: 1px solid var(--line-light);
  border-bottom: 1px solid var(--line-light);
}
.actions__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: var(--text-2);
  font-size: 13px;
  transition: color 0.18s, transform 0.18s;
}
.actions__item em {
  font-style: normal;
  font-size: 12px;
  color: var(--text-3);
}
.actions__item:hover {
  color: var(--bili-pink);
  transform: translateY(-2px);
}
.actions__item.is-active {
  color: var(--bili-pink);
}
.actions__item.is-active em {
  color: var(--bili-pink);
}
.actions__hint {
  position: absolute;
  right: 0;
  top: 12px;
  padding: 4px 10px;
  border-radius: var(--radius);
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  font-size: 12px;
}

.info {
  padding: 16px 0;
  border-bottom: 1px solid var(--line-light);
}
.info__owner {
  display: flex;
  align-items: center;
  gap: 12px;
}
.info__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex: none;
}
.info__avatar--text {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
}
.info__owner-body {
  flex: 1;
  min-width: 0;
}
.info__owner-name {
  font-size: 15px;
  font-weight: 600;
}
.info__owner-meta {
  margin-top: 2px;
  font-size: 12px;
  color: var(--text-3);
}
.info__follow,
.side-card__follow {
  padding: 6px 18px;
  border-radius: var(--radius);
  background: var(--bili-pink);
  color: #fff;
  font-size: 13px;
  transition: all 0.2s;
  flex: none;
}
.info__follow:hover,
.side-card__follow:hover {
  background: var(--bili-pink-hover);
}
.info__follow.is-followed,
.side-card__follow.is-followed {
  background: var(--bg-gray-deep);
  color: var(--text-2);
}
.info__desc {
  margin-top: 16px;
  padding: 14px;
  border-radius: var(--radius);
  background: var(--bg-gray);
}
.info__desc-title {
  font-size: 13px;
  color: var(--text-3);
  margin-bottom: 6px;
}
.info__desc-text {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-1);
  word-break: break-word;
}
.info__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.info__tag {
  padding: 3px 10px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid var(--line);
  color: var(--text-2);
  font-size: 12px;
  transition: all 0.16s;
}
.info__tag:hover {
  border-color: var(--bili-pink);
  color: var(--bili-pink);
}

.detail__side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.side-card {
  border: 1px solid var(--line-light);
  border-radius: var(--radius-lg);
  padding: 14px;
}
.side-card__head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line-light);
}
.side-card__head h3 {
  font-size: 14px;
  font-weight: 600;
}
.side-card__fire {
  color: #fe2d46;
}
.side-card__owner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0 8px;
}
.side-card__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  flex: none;
}
.side-card__avatar--text {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.side-card__owner-info {
  flex: 1;
  min-width: 0;
}
.side-card__owner-info b {
  display: block;
  font-size: 14px;
}
.side-card__owner-info em {
  font-style: normal;
  font-size: 12px;
  color: var(--text-3);
}
.side-card__follow {
  padding: 4px 12px;
  font-size: 12px;
}
.side-card__sign {
  font-size: 12px;
  color: var(--text-3);
  line-height: 1.6;
}
.side-card__list {
  padding-top: 6px;
  max-height: 720px;
  overflow-y: auto;
}

@media (max-width: 1200px) {
  .detail__layout {
    grid-template-columns: 1fr;
  }
}
</style>
