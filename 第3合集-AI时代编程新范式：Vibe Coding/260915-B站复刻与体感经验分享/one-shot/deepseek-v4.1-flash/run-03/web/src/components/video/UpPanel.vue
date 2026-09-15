<template>
  <aside class="up-panel">
    <div class="up-panel__head">
      <RouterLink class="up-avatar" :to="{ name: 'search', query: { keyword: owner.name } }">
        <img :src="owner.face" :alt="owner.name" referrerpolicy="no-referrer" />
      </RouterLink>

      <div class="up-info">
        <RouterLink class="up-info__name" :to="{ name: 'search', query: { keyword: owner.name } }">
          {{ owner.name }}
        </RouterLink>
        <p class="up-info__meta">
          <span>{{ owner.followerText }} 粉丝</span>
          <span>Lv{{ owner.level }}</span>
          <span v-if="owner.vip" class="up-info__vip">大会员</span>
        </p>
      </div>

      <button class="up-follow" :class="{ 'is-active': following }" @click="following = !following">
        {{ following ? '已关注' : '+ 关注' }}
      </button>
    </div>

    <p class="up-panel__sign">{{ owner.sign || '这个UP主很懒，什么都没写~' }}</p>

    <div class="up-panel__videos">
      <p class="up-panel__title">TA 的其它作品</p>
      <ul>
        <li
          v-for="item in videos"
          :key="item.bvid"
          class="up-video"
          @click="$router.push({ name: 'video', params: { bvid: item.bvid } })"
        >
          <img :src="item.cover" :alt="item.title" referrerpolicy="no-referrer" />
          <div class="up-video__info">
            <p class="up-video__title text-clamp-2">{{ item.title }}</p>
            <span class="up-video__meta">{{ item.durationText }} · {{ item.stats.viewText }}</span>
          </div>
        </li>
        <li v-if="!videos.length" class="up-video--empty">暂无其它作品</li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue';

/**
 * UP主信息卡：头像、粉丝数、关注按钮与其它作品列表。
 */
defineProps({
  owner: { type: Object, required: true },
  videos: { type: Array, default: () => [] },
});

const following = ref(false);
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.up-panel {
  padding: 16px;
  background: #fff;
  border-radius: $radius-lg;

  &__head {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__sign {
    margin: 12px 0;
    padding: 10px;
    font-size: 13px;
    color: $text-2;
    background: $bg-card;
    border-radius: $radius-md;
    line-height: 19px;
  }

  &__title {
    margin-bottom: 10px;
    font-size: 14px
    ;
    font-weight: 600;
    color: $text-1;
  }
}

.up-avatar img {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
}

.up-info {
  flex: 1;
  min-width: 0;

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: $text-1;

    &:hover {
      color: $brand-blue;
    }
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 2px;
    font-size: 12px;
    color: $text-3;
  }

  &__vip {
    padding: 0 5px;
    color: $brand-pink;
    background: rgba(251, 114, 153, 0.12);
    border-radius: $radius-sm;
  }
}

.up-follow {
  flex: none;
  height: 32px;
  padding: 0 16px;
  font-size: 13px;
  color: #fff;
  background: $brand-pink;
  border-radius: $radius-md;
  transition: all $transition-fast;

  &:hover {
    background: $brand-pink-hover;
  }

  &.is-active {
    color: $text-2;
    background: $bg-card;
  }
}

.up-video {
  display: flex;
  gap: 8px;
  padding: 6px 0;
  cursor: pointer;

  img {
    width: 92px;
    height: 52px;
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

  &--empty {
    padding: 12px 0;
    text-align: center;
    font-size: 12px;
    color: $text-3;
  }
}
</style>
