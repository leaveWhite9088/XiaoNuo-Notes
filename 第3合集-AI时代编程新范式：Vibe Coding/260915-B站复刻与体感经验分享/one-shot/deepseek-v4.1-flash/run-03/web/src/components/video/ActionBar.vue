<template>
  <div class="action-bar">
    <div class="action-bar__stats">
      <span class="stat"><SvgIcon name="play" :size="16" />{{ video.stats.viewText }}</span>
      <span class="stat"><SvgIcon name="danmaku" :size="16" />{{ video.stats.danmakuText }}</span>
      <span class="stat stat--date">发布于 {{ video.pubdateText }}</span>
    </div>

    <div class="action-bar__buttons">
      <button
        v-for="action in actions"
        :key="action.key"
        class="action-btn"
        :class="{ 'is-active': active[action.key] }"
        @click="toggle(action)"
      >
        <SvgIcon :name="action.icon" :size="20" />
        <span>{{ action.label }}</span>
        <em v-if="action.count">{{ action.count }}</em>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue';
import SvgIcon from '@/components/common/SvgIcon.vue';

/**
 * 视频操作栏：点赞 / 投币 / 收藏 / 分享（本地交互反馈）。
 */
const props = defineProps({
  video: { type: Object, required: true },
});

const active = reactive({ like: false, coin: false, favorite: false, share: false });

const actions = computed(() => [
  { key: 'like', label: '点赞', icon: 'like', count: props.video.stats.likeText },
  { key: 'coin', label: '投币', icon: 'coin', count: props.video.stats.coinText },
  { key: 'favorite', label: '收藏', icon: 'favorite', count: props.video.stats.favoriteText },
  { key: 'share', label: '分享', icon: 'share', count: props.video.stats.share ? props.video.stats.share : '' },
]);

function toggle(action) {
  active[action.key] = !active[action.key];
  if (action.key === 'share' && navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  flex-wrap: wrap;

  &__stats {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 13px;
    color: $text-3;
  }

  &__buttons {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &--date::before {
    content: '';
  }
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border-radius: $radius-md;
  background: $bg-card;
  font-size: 13px;
  color: $text-2;
  transition: all $transition-fast;

  em {
    font-style: normal;
    color: $text-3;
  }

  &:hover {
    color: $brand-blue;
    background: rgba(0, 174, 236, 0.1);
  }

  &.is-active {
    color: $brand-pink;
    background: rgba(251, 114, 153, 0.12);
  }
}
</style>
