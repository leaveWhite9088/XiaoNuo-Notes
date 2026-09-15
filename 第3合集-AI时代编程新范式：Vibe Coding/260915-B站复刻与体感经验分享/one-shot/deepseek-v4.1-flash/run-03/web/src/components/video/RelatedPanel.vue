<template>
  <aside class="related">
    <p class="related__title">相关推荐</p>
    <ul>
      <li
        v-for="video in videos"
        :key="video.bvid"
        class="related-item"
        @click="$router.push({ name: 'video', params: { bvid: video.bvid } })"
      >
        <div class="related-item__cover">
          <img :src="video.cover" :alt="video.title" referrerpolicy="no-referrer" />
          <span class="related-item__duration">{{ video.durationText }}</span>
        </div>
        <div class="related-item__info">
          <p class="related-item__title text-clamp-2">{{ video.title }}</p>
          <span class="related-item__meta">{{ video.owner.name }}</span>
          <span class="related-item__meta">{{ video.stats.viewText }} · {{ video.pubdateText }}</span>
        </div>
      </li>
      <li v-if="!videos.length" class="related-empty">暂无相关推荐</li>
    </ul>
  </aside>
</template>

<script setup>
/**
 * 播放页右侧相关推荐列表。
 */
defineProps({
  videos: { type: Array, default: () => [] },
});
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.related {
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

.related-item {
  display: flex;
  gap: 10px;
  padding: 7px 0;
  cursor: pointer;

  &__cover {
    position: relative;
    width: 128px;
    flex: none;
    border-radius: $radius-md;
    overflow: hidden;

    img {
      width: 100%;
      height: 72px;
      object-fit: cover;
      transition: transform $transition-base;
    }
  }

  &:hover &__cover img {
    transform: scale(1.05);
  }

  &__duration {
    position: absolute;
    right: 4px;
    bottom: 4px;
    padding: 0 4px;
    font-size: 11px;
    color: #fff;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 3px;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 13px;
    line-height: 18px;
    color: $text-1;
  }

  &:hover &__title {
    color: $brand-blue;
  }

  &__meta {
    display: block;
    font-size: 12px;
    color: $text-3;
  }
}

.related-empty {
  padding: 20px 0;
  text-align: center;
  font-size: 13px;
  color: $text-3;
}
</style>
