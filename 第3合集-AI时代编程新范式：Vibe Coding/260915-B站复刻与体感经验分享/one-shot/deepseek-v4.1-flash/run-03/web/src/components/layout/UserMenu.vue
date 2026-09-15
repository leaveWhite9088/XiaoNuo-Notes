<template>
  <ul class="user-menu">
    <li
      class="user-menu__item user-menu__item--avatar"
      @mouseenter="open = true"
      @mouseleave="open = false"
    >
      <div class="avatar-trigger" :class="{ 'is-open': open }">
        <img class="avatar-trigger__img" :src="user.face" alt="头像" referrerpolicy="no-referrer" />
      </div>

      <transition name="pop">
        <div v-show="open" class="avatar-panel">
          <div class="avatar-panel__head">
            <img :src="user.face" alt="" referrerpolicy="no-referrer" />
            <div class="avatar-panel__info">
              <p class="avatar-panel__name">{{ user.name }}</p>
              <p class="avatar-panel__sign">硬币：{{ user.coins }} · B币：{{ user.bCoins }}</p>
            </div>
          </div>
          <div class="avatar-panel__stats">
            <div><b>{{ user.following }}</b><span>关注</span></div>
            <div><b>{{ user.follower }}</b><span>粉丝</span></div>
            <div><b>{{ user.favorites }}</b><span>收藏</span></div>
          </div>
          <div class="avatar-panel__grid">
            <button class="avatar-panel__cell">
              <SvgIcon name="history" :size="18" /><span>历史</span>
            </button>
            <button class="avatar-panel__cell">
              <SvgIcon name="collect" :size="18" /><span>收藏</span>
            </button>
            <button class="avatar-panel__cell">
              <SvgIcon name="create" :size="18" /><span>创作中心</span>
            </button>
            <button class="avatar-panel__cell">
              <SvgIcon name="setting" :size="18" /><span>设置</span>
            </button>
          </div>
          <button class="avatar-panel__logout" @click="noop">退出登录</button>
        </div>
      </transition>
    </li>

    <li
      v-for="entry in entries"
      :key="entry.key"
      class="user-menu__item user-menu__item--entry"
      @mouseenter="hover = entry.key"
      @mouseleave="hover = ''"
    >
      <button class="user-entry" :class="{ 'is-hover': hover === entry.key }" @click="onEntry(entry)">
        <span class="user-entry__icon"><SvgIcon :name="entry.icon" :size="20" /></span>
        <span class="user-entry__label">{{ entry.label }}</span>
        <em v-if="entry.badge" class="user-entry__badge">{{ entry.badge }}</em>
      </button>

      <transition name="pop">
        <div v-show="hover === entry.key" class="mini-pop">
          <p class="mini-pop__title">{{ entry.label }}</p>
          <ul class="mini-pop__list">
            <li v-for="sub in entry.subs" :key="sub" class="mini-pop__row">
              <SvgIcon :name="entry.icon" :size="14" />
              <span>{{ sub }}</span>
            </li>
          </ul>
          <div v-if="entry.empty" class="mini-pop__empty">{{ entry.empty }}</div>
          <div v-else-if="quickVideos.length" class="mini-pop__videos">
            <div
              v-for="video in quickVideos"
              :key="video.bvid"
              class="mini-pop__video"
              @click="goVideo(video.bvid)"
            >
              <img :src="video.cover" alt="" referrerpolicy="no-referrer" />
              <span>{{ video.title }}</span>
            </div>
          </div>
        </div>
      </transition>
    </li>

    <li class="user-menu__item">
      <button class="user-entry user-entry--upload" @click="noop">
        <SvgIcon name="upload" :size="16" />
        <span>投稿</span>
      </button>
    </li>
  </ul>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import SvgIcon from '@/components/common/SvgIcon.vue';
import { userApi } from '@/api/http.js';
import { useHomeStore } from '@/stores/home.js';

/**
 * 顶部右侧用户区：hover 展开头像面板与各入口浮层。
 */
const router = useRouter();
const home = useHomeStore();
const open = ref(false);
const hover = ref('');
const user = ref({
  name: '哔哩哔哩用户',
  face: 'https://i0.hdslb.com/bfs/face/member/noface.jpg',
  coins: 1286,
  bCoins: 328,
  following: 56,
  follower: 128,
  favorites: 0,
});

const entries = computed(() => [
  {
    key: 'message',
    label: '消息',
    icon: 'message',
    badge: '12',
    subs: ['回复我的', '收到的赞', '@我的', '系统通知'],
    empty: '暂无新消息',
  },
  {
    key: 'dynamic',
    label: '动态',
    icon: 'dynamic',
    subs: ['全部动态', '关注的UP主', '话题'],
  },
  {
    key: 'favorite',
    label: '收藏',
    icon: 'collect',
    subs: ['默认收藏夹', '稍后再看', '订阅合集'],
  },
  {
    key: 'history',
    label: '历史',
    icon: 'history',
    subs: ['观看记录', '弹幕设置', '搜索历史'],
  },
]);

const quickVideos = computed(() => (home.feed.list || []).slice(0, 2));

function onEntry(entry) {
  if (entry.key === 'history') router.push({ name: 'home' });
}

function goVideo(bvid) {
  router.push({ name: 'video', params: { bvid } });
}

function noop() {}

onMounted(async () => {
  try {
    user.value = { ...user.value, ...(await userApi.me()) };
  } catch {
    /* 使用默认演示账户 */
  }
});
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.user-menu {
  display: flex;
  align-items: center;
  gap: 4px;

  &__item {
    position: relative;
    list-style: none;

    &--avatar {
      margin-right: 6px;
    }
  }
}

.avatar-trigger {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: border-color $transition-fast;

  &.is-open {
    border-color: $brand-pink;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatar-panel {
  position: absolute;
  top: 48px;
  right: 0;
  width: 268px;
  padding: 14px;
  z-index: $z-popover;
  background: #fff;
  border-radius: $radius-lg;
  box-shadow: $shadow-pop;
  border: 1px solid rgba(0, 0, 0, 0.04);

  &__head {
    display: flex;
    align-items: center;
    gap: 10px;

    img {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      object-fit: cover;
    }
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: $text-1;
  }

  &__sign {
    font-size: 12px;
    color: $text-3;
  }

  &__stats {
    display: flex;
    justify-content: space-around;
    margin: 12px 0;
    padding: 10px 0;
    border-top: 1px solid $border-line;
    border-bottom: 1px solid $border-line;

    div {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    b {
      font-size: 15px;
      color: $text-1;
    }

    span {
      font-size: 12px;
      color: $text-3;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }

  &__cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 0;
    border-radius: $radius-md;
    font-size: 12px;
    color: $text-2;
    transition: all $transition-fast;

    &:hover {
      color: $brand-blue;
      background: $bg-card;
    }
  }

  &__logout {
    width: 100%;
    height: 32px;
    margin-top: 10px;
    border-radius: $radius-md;
    background: $bg-card;
    font-size: 13px;
    color: $text-2;

    &:hover {
      background: #fdecef;
      color: $brand-pink;
    }
  }
}

.user-entry {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  width: 50px;
  height: 44px;
  border-radius: $radius-md;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  transition: all $transition-fast;

  &__label {
    font-size: 12px;
  }

  &__badge {
    position: absolute;
    top: 2px;
    right: 6px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    font-size: 10px;
    font-style: normal;
    line-height: 16px;
    text-align: center;
    color: #fff;
    background: $brand-pink;
    border-radius: 8px;
    text-shadow: none;
  }

  &:hover,
  &.is-hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.18);
    text-shadow: none;
  }

  &--upload {
    flex-direction: row;
    gap: 4px;
    width: auto;
    height: 34px;
    padding: 0 14px;
    font-size: 13px;
    font-weight: 500;
    color: $text-1;
    background: #fff;
    text-shadow: none;
    border-radius: $radius-md;

    &:hover {
      color: $brand-pink;
      background: #fdecef;
    }
  }
}

.mini-pop {
  position: absolute;
  top: 50px;
  right: 0;
  width: 240px;
  padding: 12px;
  z-index: $z-popover;
  background: #fff;
  border-radius: $radius-lg;
  box-shadow: $shadow-pop;
  border: 1px solid rgba(0, 0, 0, 0.04);

  &__title {
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 600;
    color: $text-1;
  }

  &__list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
    margin-bottom: 8px;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 5px;
    height: 28px;
    padding: 0 6px;
    border-radius: $radius-sm;
    font-size: 12px;
    color: $text-2;

    &:hover {
      color: $brand-blue;
      background: $bg-card;
    }
  }

  &__empty {
    padding: 10px 0;
    text-align: center;
    font-size: 12px;
    color: $text-3;
    background: $bg-card;
    border-radius: $radius-md;
  }

  &__videos {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__video {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    img {
      width: 72px;
      height: 42px;
      border-radius: $radius-sm;
      object-fit: cover;
    }

    span {
      flex: 1;
      font-size: 12px;
      color: $text-2;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    &:hover span {
      color: $brand-blue;
    }
  }
}
</style>
