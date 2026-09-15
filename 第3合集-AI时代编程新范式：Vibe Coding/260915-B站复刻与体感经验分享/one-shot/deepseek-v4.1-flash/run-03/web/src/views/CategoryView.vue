<template>
  <div class="category-view">
    <div class="layout">
      <div class="category-hero" :style="heroStyle">
        <div class="category-hero__inner">
          <h1 class="category-hero__name">{{ category?.name || '分区' }}</h1>
          <p class="category-hero__intro">{{ category?.intro || '发现更多精彩内容' }}</p>
          <p class="category-hero__count">共 {{ total }} 个视频</p>
        </div>
      </div>

      <FilterBar
        :categories="allCategories"
        :active="slug"
        :sort="sort"
        @change="onFilterChange"
      />

      <div class="category-view__body">
        <div class="category-view__main">
          <VideoGrid :videos="videos" :loading="loading" :skeleton-count="15" />

          <!-- 版权内容（番剧 / 国创 / 综艺） -->
          <section v-if="pgc.length" class="pgc-section">
            <div class="pgc-section__head">
              <h2>版权内容 · {{ category?.name }}</h2>
              <span>来自哔哩哔哩番剧季榜，点击可前往 B站 观看</span>
            </div>
            <div class="pgc-grid">
              <a
                v-for="item in pgc"
                :key="item.seasonId"
                class="pgc-card"
                :href="item.url"
                target="_blank"
                rel="noreferrer"
              >
                <div class="pgc-card__cover">
                  <img :src="item.cover" :alt="item.title" referrerpolicy="no-referrer" />
                  <span class="pgc-card__badge" :style="{ background: item.badgeColor }">
                    {{ item.badge }}
                  </span>
                  <span class="pgc-card__play">{{ item.playText }}</span>
                </div>
                <p class="pgc-card__title text-clamp-2">{{ item.title }}</p>
                <p class="pgc-card__meta">
                  <em>{{ item.rating }}</em>
                  <span>{{ item.updateInfo }}</span>
                </p>
              </a>
            </div>
          </section>
        </div>

        <aside class="category-view__aside">
          <div class="aside-card">
            <p class="aside-card__title">本区排行</p>
            <ul class="rank-list">
              <li
                v-for="(item, index) in ranking"
                :key="item.bvid"
                class="rank-item"
                @click="$router.push({ name: 'video', params: { bvid: item.bvid } })"
              >
                <span class="rank-item__no" :class="{ 'is-top': index < 3 }">{{ index + 1 }}</span>
                <img :src="item.cover" :alt="item.title" referrerpolicy="no-referrer" />
                <div class="rank-item__info">
                  <p class="rank-item__title text-clamp-2">{{ item.title }}</p>
                  <span class="rank-item__meta">{{ item.stats.viewText }}</span>
                </div>
              </li>
              <li v-if="!ranking.length" class="rank-empty">暂无排行</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import FilterBar from '@/components/home/FilterBar.vue';
import VideoGrid from '@/components/home/VideoGrid.vue';
import { catalogApi } from '@/api/http.js';
import { useHomeStore } from '@/stores/home.js';

/**
 * 分区页：分区信息 + 筛选 + 信息流 + 本区排行 + 版权内容。
 */
const route = useRoute();
const home = useHomeStore();

const category = ref(null);
const videos = ref([]);
const total = ref(0);
const ranking = ref([]);
const pgc = ref([]);
const loading = ref(true);
const sort = ref('hot');

const slug = computed(() => String(route.params.slug || ''));
const allCategories = computed(() => home.categories);
const heroStyle = computed(() => {
  const accent = category.value?.accent || '#00AEEC';
  return {
    background: `linear-gradient(120deg, ${accent} 0%, ${accent}cc 42%, #1b1c22 100%)`,
  };
});

async function load() {
  loading.value = true;
  try {
    const data = await catalogApi.detail(slug.value, { sort: sort.value, page: 1, pageSize: 30 });
    category.value = data.category;
    videos.value = data.list || [];
    total.value = data.total || 0;
    ranking.value = data.ranking || [];
    pgc.value = data.pgc || [];
  } finally {
    loading.value = false;
  }
}

async function onFilterChange({ category: nextSlug, sort: nextSort }) {
  if (nextSlug && nextSlug !== slug.value) {
    // 切换分区 -> 走路由，保持 URL 可分享
    const target = nextSlug === 'all' ? '/' : `/category/${nextSlug}`;
    window.location.href = target;
    return;
  }
  sort.value = nextSort || 'hot';
  await load();
}

watch(slug, load);
onMounted(async () => {
  if (!home.categories.length) await home.fetchHome();
  await load();
});
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.category-view {
  padding: 20px 0 0;

  &__body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 20px;
    align-items: start;
    margin-top: 4px;
  }

  &__aside {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.category-hero {
  height: 132px;
  border-radius: $radius-lg;
  margin-bottom: 16px;
  overflow: hidden;

  &__inner {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 28px;
    color: #fff;
  }

  &__name {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 2px;
  }

  &__intro {
    margin-top: 6px;
    font-size: 14px;
    opacity: 0.9;
  }

  &__count {
    margin-top: 8px;
    font-size: 12px;
    opacity: 0.75;
  }
}

.aside-card {
  padding: 16px;
  background: #fff;
  border-radius: $radius-lg;

  &__title {
    margin-bottom: 12px;
    font-size: 15px;
    font-weight: 600;
    color: $text-1;
  }
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 0;
  cursor: pointer;

  &__no {
    width: 16px;
    flex: none;
    text-align: center;
    font-size: 13px;
    font-weight: 700;
    font-style: italic;
    color: $text-3;

    &.is-top {
      color: $brand-pink;
    }
  }

  img {
    width: 74px;
    height: 44px;
    flex: none;
    border-radius: $radius-sm;
    object-fit: cover;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 13px;
    line-height: 17px;
    color: $text-1;
  }

  &:hover &__title {
    color: $brand-blue;
  }

  &__meta {
    font-size: 12px;
    color: $text-3;
  }
}

.rank-empty {
  padding: 16px 0;
  text-align: center;
  font-size: 13px;
  color: $text-3;
}

.pgc-section {
  margin-top: 28px;

  &__head {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 14px;

    h2 {
      font-size: 18px;
      font-weight: 600;
      color: $text-1;
    }

    span {
      font-size: 12px;
      color: $text-3;
    }
  }
}

.pgc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.pgc-card {
  display: block;
  transition: transform $transition-base;

  &:hover {
    transform: translateY(-3px);
  }

  &__cover {
    position: relative;
    border-radius: $radius-md;
    overflow: hidden;
    background: $bg-card;

    img {
      width: 100%;
      aspect-ratio: 3 / 4;
      object-fit: cover;
    }
  }

  &__badge {
    position: absolute;
    top: 6px;
    left: 6px;
    padding: 1px 6px;
    font-size: 11px;
    color: #fff;
    border-radius: $radius-sm;
  }

  &__play {
    position: absolute;
    right: 6px;
    bottom: 6px;
    font-size: 11px;
    color: #fff;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  }

  &__title {
    margin-top: 8px;
    font-size: 13px;
    line-height: 18px;
    color: $text-1;
  }

  &:hover &__title {
    color: $brand-blue;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: $text-3;

    em {
      font-style: normal;
      color: #ff8f1f;
      font-weight: 600;
    }
  }
}

@media (max-width: 1200px) {
  .category-view__body {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
