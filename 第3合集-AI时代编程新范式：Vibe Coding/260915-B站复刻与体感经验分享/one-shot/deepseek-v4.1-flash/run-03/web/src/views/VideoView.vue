<template>
  <div class="video-view">
    <div class="layout">
      <div v-if="loading" class="video-view__loading">
        <div class="skeleton video-view__skeleton-player" />
        <div class="skeleton video-view__skeleton-line" />
      </div>

      <div v-else-if="error" class="video-view__error">
        <p>{{ error }}</p>
        <RouterLink class="btn-primary" to="/">返回首页</RouterLink>
      </div>

      <template v-else>
        <nav class="breadcrumb">
          <RouterLink to="/">首页</RouterLink>
          <SvgIcon name="arrowRight" :size="12" />
          <RouterLink :to="{ name: 'category', params: { slug: detail.video.category?.slug || 'douga' } }">
            {{ detail.video.category?.name || '分区' }}
          </RouterLink>
          <SvgIcon name="arrowRight" :size="12" />
          <span class="breadcrumb__current text-clamp-1">{{ detail.video.title }}</span>
        </nav>

        <div class="video-view__body">
          <div class="video-view__main">
            <VideoPlayer
              ref="playerRef"
              :src="player.streamUrl"
              :poster="detail.video.cover"
              :danmaku-list="detail.danmaku"
              :danmaku-on="player.showDanmaku"
              :qualities="qualityOptions"
              :current-quality="player.quality"
              :quality-label="player.qualityLabel"
              @progress="onProgress"
              @toggle-danmaku="player.showDanmaku = !player.showDanmaku"
              @change-quality="onQualityChange"
              @send-danmaku="onSendDanmaku"
            />

            <div v-if="player.error" class="player-notice">
              <SvgIcon name="eye" :size="18" />
              <div class="player-notice__body">
                <p class="player-notice__title">暂时无法站内播放</p>
                <p class="player-notice__desc">{{ player.error }}</p>
              </div>
              <button class="btn-primary" @click="playFallback">播放推荐视频</button>
            </div>

            <div class="video-view__head">
              <h1 class="video-view__title">{{ detail.video.title }}</h1>
              <p class="video-view__desc">{{ detail.video.description || '视频简介暂无，UP主还没有填写简介~' }}</p>
              <div class="video-view__tags">
                <RouterLink
                  v-for="tag in detail.video.tags"
                  :key="tag"
                  class="tag-chip"
                  :to="{ name: 'search', query: { keyword: tag } }"
                >
                  {{ tag }}
                </RouterLink>
              </div>
            </div>

            <ActionBar :video="detail.video" />

            <CommentSection
              :bvid="detail.video.bvid"
              :initial-comments="detail.comments"
              :total="detail.commentTotal"
            />
          </div>

          <div class="video-view__aside">
            <UpPanel :owner="detail.owner" :videos="detail.ownerVideos" />
            <RelatedPanel :videos="detail.related" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import VideoPlayer from '@/components/video/VideoPlayer.vue';
import ActionBar from '@/components/video/ActionBar.vue';
import CommentSection from '@/components/video/CommentSection.vue';
import UpPanel from '@/components/video/UpPanel.vue';
import RelatedPanel from '@/components/video/RelatedPanel.vue';
import SvgIcon from '@/components/common/SvgIcon.vue';
import { videoApi } from '@/api/http.js';
import { usePlayerStore } from '@/stores/player.js';

/**
 * 视频详情页：播放主链路（真实流播放 + 弹幕 + 评论 + 推荐）。
 */
const route = useRoute();
const router = useRouter();
const player = usePlayerStore();

const detail = ref(null);
const loading = ref(true);
const error = ref('');
const playerRef = ref(null);

const qualityOptions = computed(() => player.playInfo?.qualities || []);

async function load(bvid) {
  loading.value = true;
  error.value = '';
  try {
    detail.value = await videoApi.detail(bvid);
    player.reset();
    player.bvid = bvid;
    player.setDanmaku(detail.value.danmaku || []);
    await player.loadPlayInfo(bvid, player.quality || 64);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

function onProgress(seconds) {
  player.currentTime = seconds;
  player.reportProgress();
}

async function onQualityChange(qn) {
  player.switchQuality(qn);
}

async function onSendDanmaku(payload) {
  try {
    await videoApi.addDanmaku(detail.value.video.bvid, payload);
    detail.value.danmaku = [...(detail.value.danmaku || []), payload];
  } catch {
    /* 弹幕发送失败不阻塞播放 */
  }
}

/** 版权内容不可播时，一键跳到相关推荐里第一个视频 */
function playFallback() {
  const next = (detail.value.related || []).find((v) => v.playable !== false);
  if (next) router.push({ name: 'video', params: { bvid: next.bvid } });
}

watch(
  () => route.params.bvid,
  (bvid) => {
    if (bvid) load(bvid);
  },
);

onMounted(() => load(route.params.bvid));
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.video-view {
  padding: 20px 0 0;

  &__loading {
    padding: 20px 0;
  }

  &__skeleton-player {
    width: 100%;
    aspect-ratio: 16 / 9;
  }

  &__skeleton-line {
    height: 24px;
    margin-top: 20px;
    width: 60%;
  }

  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 80px 0;
    color: $text-2;
  }

  &__body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 20px;
    align-items: start;
  }

  &__main {
    min-width: 0;
  }

  &__aside {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__head {
    padding: 14px 0 4px;
  }

  &__title {
    font-size: 20px;
    font-weight: 600;
    line-height: 28px;
    color: $text-1;
  }

  &__desc {
    margin-top: 8px;
    font-size: 13px;
    line-height: 20px;
    color: $text-2;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
  }
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 13px;
  color: $text-3;

  a:hover {
    color: $brand-blue;
  }

  &__current {
    max-width: 420px;
    color: $text-2;
  }
}

.player-notice {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 12px;
  padding: 14px 16px;
  background: #fff7f9;
  border: 1px solid rgba(251, 114, 153, 0.3);
  border-radius: $radius-lg;
  color: $text-2;

  &__body {
    flex: 1;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: $brand-pink;
  }

  &__desc {
    font-size: 13px;
    color: $text-2;
  }
}

.tag-chip {
  padding: 3px 10px;
  font-size: 12px;
  color: $text-2;
  background: #fff;
  border-radius: 20px;
  transition: all $transition-fast;

  &:hover {
    color: #fff;
    background: $brand-blue;
  }
}

@media (max-width: 1200px) {
  .video-view__body {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
