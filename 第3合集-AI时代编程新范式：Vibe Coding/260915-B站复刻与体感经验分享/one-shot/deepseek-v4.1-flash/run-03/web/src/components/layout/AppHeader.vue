<template>
  <header class="app-header" :class="{ 'is-scrolled': scrolled, 'is-compact': compact }">
    <!-- 顶部大图 banner：logo + 渐变遮罩，主导航浮在其上 -->
    <div class="header-banner" :style="bannerStyle">
      <div class="header-banner__inner layout">
        <RouterLink class="inner-logo" to="/" aria-label="哔哩哔哩">
          <SvgIcon name="home" :size="30" class="inner-logo__mark" />
          <span class="inner-logo__text">哔哩哔哩</span>
        </RouterLink>
      </div>
      <div class="taper-line" />

      <!-- 主导航条：绝对定位覆盖在 banner 上 -->
      <div class="header-bar">
        <div class="layout header-bar__inner">
          <TopNav />
          <div class="center-search">
            <SearchBox />
          </div>
          <UserMenu />
        </div>
      </div>
    </div>

    <!-- 吸顶后的紧凑导航 -->
    <div v-show="compact" class="header-sticky">
      <div class="layout header-sticky__inner">
        <RouterLink class="sticky-logo" to="/">
          <SvgIcon name="home" :size="22" />
          <span>哔哩哔哩</span>
        </RouterLink>
        <TopNavCompact />
        <div class="center-search"><SearchBox /></div>
        <UserMenu />
      </div>
    </div>

    <ChannelBar />
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import SvgIcon from '@/components/common/SvgIcon.vue';
import TopNav from './TopNav.vue';
import TopNavCompact from './TopNavCompact.vue';
import SearchBox from './SearchBox.vue';
import UserMenu from './UserMenu.vue';
import ChannelBar from './ChannelBar.vue';
import { useHomeStore } from '@/stores/home.js';

/**
 * 页头：banner 大图 + 浮层导航 + 频道条。
 * 滚动超过 banner 高度后切换为吸顶紧凑导航（还原 B站 的滚动行为）。
 */
const home = useHomeStore();
const scrolled = ref(false);
const compact = ref(false);

const bannerStyle = computed(() => {
  const banner = home.banners?.[0];
  if (!banner?.image) {
    return { background: 'linear-gradient(120deg,#2b2b3a,#4a4a63)' };
  }
  return { backgroundImage: `url(${banner.image})` };
});

function onScroll() {
  const y = window.scrollY;
  scrolled.value = y > 20;
  compact.value = y > 240;
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll));
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.app-header {
  position: relative;
  background: #fff;
  z-index: $z-header;
}

.header-banner {
  position: relative;
  height: $banner-height;
  background-color: #e3e5e7;
  background-size: cover;
  background-position: center 30%;

  &__inner {
    position: relative;
    height: 100%;
    display: flex;
    align-items: flex-end;
    padding-bottom: 12px;
  }
}

.inner-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);

  &__text {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 2px;
  }

  &__mark {
    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35));
  }
}

.taper-line {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.42) 0%,
    rgba(0, 0, 0, 0.12) 38%,
    rgba(255, 255, 255, 0.16) 78%,
    rgba(255, 255, 255, 0.9) 100%
  );
  pointer-events: none;
}

.header-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: $header-bar-height;

  &__inner {
    display: flex;
    align-items: center;
    height: 100%;
  }
}

.center-search {
  flex: 1;
  display: flex;
  justify-content: center;
  margin: 0 24px;
}

.header-sticky {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: saturate(180%) blur(12px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  z-index: $z-header;

  &__inner {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .sticky-logo {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-right: 24px;
    font-size: 16px;
    font-weight: 700;
    color: $brand-pink;
  }

  :deep(.top-nav__entry) {
    color: $text-1;
    text-shadow: none;
    height: 56px;

    &:hover {
      color: $brand-pink;
    }
  }

  :deep(.user-entry) {
    color: $text-2;
    text-shadow: none;
    height: 44px;

    &:hover {
      color: $brand-blue;
      background: $bg-card;
    }
  }

  :deep(.avatar-trigger) {
    border-color: $border-line;
  }

  :deep(.mega-menu),
  :deep(.avatar-panel),
  :deep(.mini-pop) {
    top: 52px !important;
  }
}
</style>
