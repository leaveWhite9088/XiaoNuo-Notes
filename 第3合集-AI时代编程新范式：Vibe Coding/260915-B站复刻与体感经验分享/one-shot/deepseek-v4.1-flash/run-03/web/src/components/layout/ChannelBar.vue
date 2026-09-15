<template>
  <div class="channel-bar">
    <div class="layout channel-bar__inner">
      <div class="channel-icons">
        <a
          v-for="icon in quickIcons"
          :key="icon.key"
          class="channel-icons__item"
          :href="icon.href"
          @click.prevent="goIcon(icon)"
        >
          <div class="icon-bg" :style="{ background: icon.bg }">
            <SvgIcon :name="icon.icon" :size="22" filled />
          </div>
          <span class="icon-title">{{ icon.title }}</span>
        </a>
      </div>

      <div class="right-channel">
        <div class="channel-items" :class="{ 'is-expanded': expanded }">
          <RouterLink
            v-for="cat in primaryCategories"
            :key="cat.slug"
            class="channel-link"
            :to="{ name: 'category', params: { slug: cat.slug } }"
          >
            {{ cat.name }}
          </RouterLink>

          <RouterLink
            v-for="cat in extraCategories"
            :key="cat.slug"
            class="channel-link"
            :class="{ 'is-hidden': !expanded }"
            :to="{ name: 'category', params: { slug: cat.slug } }"
          >
            {{ cat.name }}
          </RouterLink>

          <button class="channel-more" @click="expanded = !expanded">
            <span>{{ expanded ? '收起' : '更多' }}</span>
            <SvgIcon :name="expanded ? 'arrowUp' : 'arrowDown'" :size="12" />
          </button>
        </div>

        <div class="channel-right">
          <a
            v-for="item in rightLinks"
            :key="item.name"
            class="channel-link__right"
            :href="item.href"
            @click.prevent="goRight(item)"
          >
            <SvgIcon :name="item.icon" :size="15" />
            <span>{{ item.name }}</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import SvgIcon from '@/components/common/SvgIcon.vue';
import { useHomeStore } from '@/stores/home.js';

/**
 * 频道条：左侧功能入口 + 二级分区宫格（可展开「更多」）。
 */
const router = useRouter();
const home = useHomeStore();
const expanded = ref(false);

const quickIcons = [
  { key: 'dynamic', title: '动态', icon: 'dynamic', bg: 'linear-gradient(135deg,#FF9212,#FFB75E)', route: 'home' },
  { key: 'popular', title: '热门', icon: 'popular', bg: 'linear-gradient(135deg,#F07775,#FB7299)', route: 'category', slug: 'douga' },
  { key: 'channel', title: '频道', icon: 'channel', bg: 'linear-gradient(135deg,#00AEEC,#40C5F1)', route: 'home' },
  { key: 'article', title: '专栏', icon: 'column', bg: 'linear-gradient(135deg,#6D9CF3,#8E7BFF)', route: 'category', slug: 'knowledge' },
  { key: 'activity', title: '活动', icon: 'activity', bg: 'linear-gradient(135deg,#4CC6A9,#2FBF71)', route: 'home' },
  { key: 'community', title: '社区中心', icon: 'community', bg: 'linear-gradient(135deg,#FF7BA9,#FB7299)', route: 'home' },
];

const rightLinks = [
  { name: '直播', icon: 'live', route: 'category', slug: 'game' },
  { name: '游戏中心', icon: 'game', route: 'category', slug: 'game' },
  { name: '会员购', icon: 'vip', route: 'category', slug: 'fashion' },
  { name: '漫画', icon: 'column', route: 'category', slug: 'douga' },
  { name: '赛事', icon: 'fire', route: 'category', slug: 'sports' },
  { name: '下载客户端', icon: 'download', route: 'home' },
];

/** 频道条展示全部分区，前 14 个默认可见 */
const allCategories = computed(() => home.navCategories.concat(home.categories));
const merged = computed(() => {
  const map = new Map();
  for (const cat of allCategories.value) {
    if (!map.has(cat.slug)) map.set(cat.slug, cat);
  }
  return [...map.values()];
});
const primaryCategories = computed(() => merged.value.slice(0, 14));
const extraCategories = computed(() => merged.value.slice(14));

function goIcon(icon) {
  if (icon.slug) router.push({ name: 'category', params: { slug: icon.slug } });
  else router.push({ name: 'home' });
}

function goRight(item) {
  if (item.slug) router.push({ name: 'category', params: { slug: item.slug } });
  else router.push({ name: 'home' });
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.channel-bar {
  background: #fff;
  height: $channel-height;
  overflow: hidden;

  &__inner {
    display: flex;
    align-items: flex-start;
    padding-top: 24px;
  }
}

.channel-icons {
  display: flex;
  margin-right: 20px;

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 24px;
    color: $text-1;

    &:hover .icon-bg {
      transform: translateY(-2px);
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.16);
    }

    &:hover .icon-title {
      color: $brand-blue;
    }
  }
}

.icon-bg {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  transition: all $transition-base;
}

.icon-title {
  margin-top: 6px;
  font-size: 13px;
  color: $text-1;
  transition: color $transition-fast;
}

.right-channel {
  flex: 1;
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.channel-items {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(82px, 1fr));
  gap: 10px 12px;
  max-height: 74px;
  overflow: hidden;
  transition: max-height 0.28s $ease;

  &.is-expanded {
    max-height: 300px;
  }
}

.channel-link {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 8px;
  font-size: 14px;
  color: $text-2;
  background: $bg-card;
  border-radius: $radius-md;
  white-space: nowrap;
  transition: all $transition-fast;

  &.is-hidden {
    display: none;
  }

  &:hover {
    color: #fff;
    background: $brand-blue;
  }

  &.router-link-active {
    color: #fff;
    background: $brand-pink;
  }
}

.channel-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 32px;
  font-size: 13px;
  color: $text-2;
  background: $bg-card;
  border-radius: $radius-md;
  transition: all $transition-fast;

  &:hover {
    color: $brand-blue;
    background: rgba(0, 174, 236, 0.1);
  }
}

.channel-right {
  width: 220px;
  flex: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 12px;
  align-content: start;
}

.channel-link__right {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 8px;
  font-size: 13px;
  color: $text-2;
  border-radius: $radius-md;
  white-space: nowrap;
  transition: all $transition-fast;

  &:hover {
    color: $brand-blue;
    background: $bg-card;
  }
}
</style>
