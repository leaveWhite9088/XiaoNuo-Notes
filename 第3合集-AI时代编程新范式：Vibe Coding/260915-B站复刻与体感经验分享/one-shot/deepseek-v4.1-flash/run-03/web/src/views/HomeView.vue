<template>
  <section class="home layout">
    <FilterBar
      :categories="categories"
      :active="store.activeCategory"
      :sort="store.activeSort"
      @change="onFilterChange"
    />

    <div class="home__feed">
      <div class="home__grid">
        <!-- 轮播占 2 列 × 2 行，与真实 B站 首屏一致 -->
        <div class="home__carousel-cell">
          <BannerCarousel :banners="store.banners" />
          <RankPanel :items="store.ranking" :title="rankTitle" @refresh="reloadHome" />
        </div>

        <VideoCard v-for="video in visibleVideos" :key="video.bvid" :video="video" />
      </div>

      <div ref="sentinel" class="home__sentinel" />

      <div class="home__loadmore">
        <span v-if="store.loadingMore">正在加载...</span>
        <button v-else-if="store.feed.hasMore" class="btn-ghost" @click="store.loadMore()">
          加载更多
        </button>
        <span v-else>已经到底啦 ~ (゜-゜)</span>
      </div>
    </div>

    <!-- 侧栏辅助区：UP主 / 热搜 / 热门评论 -->
    <section class="home__extra">
      <div class="extra-card">
        <p class="extra-card__title"><SvgIcon name="fire" :size="15" filled /> 热搜榜</p>
        <ul class="hot-list">
          <li
            v-for="(hot, index) in store.hotSearches"
            :key="hot.keyword"
            class="hot-row"
            @click="searchKeyword(hot.keyword)"
          >
            <span class="hot-row__no" :class="{ 'is-top': index < 3 }">{{ index + 1 }}</span>
            <span class="hot-row__text">{{ hot.keyword }}</span>
            <SvgIcon v-if="hot.tag" name="fire" :size="12" class="hot-row__fire" />
          </li>
        </ul>
      </div>

      <div class="extra-card">
        <p class="extra-card__title"><SvgIcon name="play" :size="15" filled /> 正在热播</p>
        <ul class="trending-list">
          <li
            v-for="video in store.trending"
            :key="video.bvid"
            class="trending-row"
            @click="goVideo(video.bvid)"
          >
            <img :src="thumb(video.cover)" :alt="video.title" referrerpolicy="no-referrer" />
            <div class="trending-row__info">
              <p class="trending-row__title text-clamp-2">{{ video.title }}</p>
              <span class="trending-row__meta">{{ video.owner.name }} · {{ video.stats.viewText }}</span>
            </div>
          </li>
        </ul>
      </div>

      <div class="extra-card">
        <p class="extra-card__title"><SvgIcon name="message" :size="15" /> 热门评论</p>
        <ul class="comment-list">
          <li v-for="comment in store.hotComments" :key="comment.id" class="comment-row">
            <p class="comment-row__text text-clamp-2">{{ comment.content }}</p>
            <span class="comment-row__meta">
              {{ comment.user.name }} · {{ comment.likeText }} 赞
            </span>
          </li>
        </ul>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import FilterBar from '@/components/home/FilterBar.vue';
import BannerCarousel from '@/components/home/BannerCarousel.vue';
import RankPanel from '@/components/home/RankPanel.vue';
import VideoCard from '@/components/home/VideoCard.vue';
import SvgIcon from '@/components/common/SvgIcon.vue';
import { useHomeStore } from '@/stores/home.js';
import { videoApi } from '@/api/http.js';

/**
 * 首页：筛选条 + 5 列信息流（轮播占 2×2）+ 右侧辅助区。
 */
const store = useHomeStore();
const router = useRouter();
const sentinel = ref(null);
const historyMap = ref({});
let observer = null;

const visibleVideos = computed(() => store.feed.list || []);
const rankTitle = computed(() =>
  store.rankCategory ? `${store.rankCategory.name}排行` : '热门排行',
);
const categories = computed(() => store.categories);

async function onFilterChange({ category, sort }) {
  if (category !== undefined && category !== store.activeCategory) {
    store.activeCategory = category;
  }
  await store.applyFilter({ category, sort });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goVideo(bvid) {
  router.push({ name: 'video', params: { bvid } });
}

function searchKeyword(keyword) {
  router.push({ name: 'search', query: { keyword } });
}

/** 侧栏小图按需裁剪，减少体积并规避原始大图加载失败 */
function thumb(url = '') {
  return url.includes('@') ? url : `${url}@240w_135h_1c`;
}

function reloadHome() {
  store.fetchHome();
}

async function loadHistory() {
  try {
    const rows = await videoApi.history(50);
    historyMap.value = Object.fromEntries(
      (rows || []).map((row) => [row.bvid, row.progressPercent]),
    );
  } catch {
    historyMap.value = {};
  }
}

function setupObserver() {
  if (!('IntersectionObserver' in window)) return;
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) store.loadMore();
    },
    { rootMargin: '300px' },
  );
  if (sentinel.value) observer.observe(sentinel.value);
}

watch(
  () => store.feed.list.length,
  () => historyMap.value,
);

onMounted(async () => {
  if (!store.feed.list.length) await store.fetchHome();
  await loadHistory();
  setupObserver();
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.home {
  padding-top: 20px;

  &__feed {
    width: 100%;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: $grid-gap;
    align-items: start;
  }

  &__carousel-cell {
    grid-column: span 2;
    grid-row: span 2;
  }

  &__sentinel {
    height: 1px;
  }

  &__loadmore {
    display: flex;
    justify-content: center;
    padding: 28px 0 10px;
    font-size: 13px;
    color: $text-3;
  }

  &__extra {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-top: 28px;
  }
}

.extra-card {
  padding: 16px;
  background: #fff;
  border-radius: $radius-lg;

  &__title {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 12px;
    font-size: 15px;
    font-weight: 600;
    color: $text-1;

    :deep(.svg-icon) {
      color: $brand-pink;
    }
  }
}

.hot-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hot-row {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  padding: 0 6px;
  border-radius: $radius-md;
  cursor: pointer;
  font-size: 13px;
  color: $text-2;

  &:hover {
    background: $bg-card;
    color: $brand-blue;
  }

  &__no {
    width: 16px;
    text-align: center;
    font-size: 12px;
    font-weight: 700;
    font-style: italic;
    color: $text-3;

    &.is-top {
      color: $brand-pink;
    }
  }

  &__text {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__fire {
    color: #ff8f1f;
  }
}

.trending-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.trending-row {
  display: flex;
  gap: 10px;
  cursor: pointer;

  img {
    width: 96px;
    height: 54px;
    flex: none;
    border-radius: $radius-md;
    object-fit: cover;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 13px;
    line-height: 18px;
    color: $text-1;

    &:hover {
      color: $brand-blue;
    }
  }

  &__meta {
    font-size: 12px;
    color: $text-3;
  }
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-row {
  padding-bottom: 10px;
  border-bottom: 1px dashed $border-line;

  &:last-child {
    border-bottom: none;
  }

  &__text {
    font-size: 13px;
    line-height: 19px;
    color: $text-1;

    &::before {
      content: '“';
      color: $brand-pink;
    }

    &::after {
      content: '”';
      color: $brand-pink;
    }
  }

  &__meta {
    font-size: 12px;
    color: $text-3;
  }
}

@media (max-width: 1400px) {
  .home__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .home__extra {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1080px) {
  .home__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .home__extra {
    grid-template-columns: 1fr;
  }
}
</style>
