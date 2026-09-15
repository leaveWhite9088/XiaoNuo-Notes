<template>
  <ul class="top-nav">
    <li class="top-nav__item">
      <RouterLink class="top-nav__entry top-nav__entry--home" to="/">
        <SvgIcon name="home" :size="18" />
        <span>首页</span>
      </RouterLink>
    </li>

    <li
      v-for="menu in menus"
      :key="menu.key"
      class="top-nav__item top-nav__item--pop"
      @mouseenter="openMenu(menu.key)"
      @mouseleave="scheduleClose"
    >
      <a class="top-nav__entry" :href="menu.href" @click.prevent="go(menu)">
        <span>{{ menu.label }}</span>
        <SvgIcon v-if="menu.badge" name="fire" :size="12" class="top-nav__badge" />
      </a>

      <transition name="pop">
        <div v-show="active === menu.key" class="mega-menu" @mouseenter="cancelClose">
          <div class="mega-menu__body">
            <div class="mega-menu__col" v-for="col in menu.columns" :key="col.title">
              <p class="mega-menu__title">{{ col.title }}</p>
              <ul class="mega-menu__links">
                <li v-for="link in col.links" :key="link.name">
                  <a
                    class="mega-menu__link"
                    :href="link.href"
                    @click.prevent="go({ href: link.href, route: link.route })"
                  >
                    <span>{{ link.name }}</span>
                    <em v-if="link.hot" class="mega-menu__hot">HOT</em>
                  </a>
                </li>
              </ul>
            </div>

            <div v-if="menu.promo" class="mega-menu__promo" @click="go({ bvid: menu.promo.bvid })">
              <img :src="menu.promo.image" :alt="menu.promo.title" referrerpolicy="no-referrer" />
              <p class="mega-menu__promo-title">{{ menu.promo.title }}</p>
              <span class="mega-menu__promo-tag">编辑推荐</span>
            </div>
          </div>
        </div>
      </transition>
    </li>

    <li class="top-nav__item">
      <a class="top-nav__entry top-nav__entry--download" href="#download" @click.prevent="noop">
        <SvgIcon name="download" :size="16" />
        <span>下载客户端</span>
      </a>
    </li>
  </ul>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import SvgIcon from '@/components/common/SvgIcon.vue';
import { useHomeStore } from '@/stores/home.js';

/**
 * 顶部主导航：hover 展开 Mega Menu（多列链接 + 推荐卡）。
 */
const router = useRouter();
const home = useHomeStore();
const active = ref('');
let closeTimer = null;

const promo = computed(() => home.banners?.[0] || null);

const menus = computed(() => [
  {
    key: 'anime',
    label: '番剧',
    href: '/category/anime',
    route: { name: 'category', params: { slug: 'anime' } },
    badge: true,
    columns: [
      {
        title: '追番',
        links: [
          { name: '连载新番', route: { name: 'category', params: { slug: 'anime' } } },
          { name: '完结动画', route: { name: 'category', params: { slug: 'anime' } } },
          { name: '番剧索引', hot: true, route: { name: 'category', params: { slug: 'anime' } } },
        ],
      },
      {
        title: '国创',
        links: [
          { name: '国产动画', route: { name: 'category', params: { slug: 'guochuang' } } },
          { name: '动态漫', route: { name: 'category', params: { slug: 'guochuang' } } },
        ],
      },
      {
        title: '影视',
        links: [
          { name: '电影', route: { name: 'category', params: { slug: 'movie' } } },
          { name: '电视剧', route: { name: 'category', params: { slug: 'tv' } } },
          { name: '纪录片', route: { name: 'category', params: { slug: 'documentary' } } },
        ],
      },
    ],
    promo: promo.value,
  },
  {
    key: 'live',
    label: '直播',
    href: '/category/live',
    route: { name: 'category', params: { slug: 'game' } },
    badge: true,
    columns: [
      {
        title: '热门直播',
        links: [
          { name: '英雄联盟', route: { name: 'category', params: { slug: 'game' } } },
          { name: '王者荣耀', route: { name: 'category', params: { slug: 'game' } } },
          { name: '永劫无间', route: { name: 'category', params: { slug: 'game' } } },
        ],
      },
      {
        title: '娱乐',
        links: [
          { name: '唱见舞见', route: { name: 'category', params: { slug: 'dance' } } },
          { name: '虚拟主播', route: { name: 'category', params: { slug: 'dance' } } },
          { name: '电台', route: { name: 'category', params: { slug: 'music' } } },
        ],
      },
    ],
    promo: home.banners?.[1] || promo.value,
  },
  {
    key: 'game',
    label: '游戏中心',
    href: '/category/game',
    route: { name: 'category', params: { slug: 'game' } },
    columns: [
      {
        title: '游戏',
        links: [
          { name: '单机游戏', route: { name: 'category', params: { slug: 'game' } } },
          { name: '网络游戏', route: { name: 'category', params: { slug: 'game' } } },
          { name: '电子竞技', hot: true, route: { name: 'category', params: { slug: 'game' } } },
        ],
      },
      {
        title: '手游',
        links: [
          { name: '手机游戏', route: { name: 'category', params: { slug: 'game' } } },
          { name: '桌游棋牌', route: { name: 'category', params: { slug: 'game' } } },
        ],
      },
    ],
    promo: home.banners?.[2] || promo.value,
  },
  {
    key: 'mall',
    label: '会员购',
    href: '/category/fashion',
    route: { name: 'category', params: { slug: 'fashion' } },
    columns: [
      {
        title: '周边',
        links: [
          { name: '手办模型', route: { name: 'category', params: { slug: 'douga' } } },
          { name: '动漫周边', route: { name: 'category', params: { slug: 'douga' } } },
          { name: '服装饰品', route: { name: 'category', params: { slug: 'fashion' } } },
        ],
      },
      {
        title: '票务',
        links: [
          { name: '漫展演出', route: { name: 'category', params: { slug: 'ent' } } },
          { name: '展会门票', route: { name: 'category', params: { slug: 'ent' } } },
        ],
      },
    ],
    promo: home.banners?.[3] || promo.value,
  },
  {
    key: 'manga',
    label: '漫画',
    href: '/category/douga',
    route: { name: 'category', params: { slug: 'douga' } },
    columns: [
      {
        title: '分类',
        links: [
          { name: '热血', route: { name: 'category', params: { slug: 'douga' } } },
          { name: '恋爱', route: { name: 'category', params: { slug: 'douga' } } },
          { name: '玄幻', hot: true, route: { name: 'category', params: { slug: 'douga' } } },
        ],
      },
    ],
    promo: home.banners?.[4] || promo.value,
  },
  {
    key: 'match',
    label: '赛事',
    href: '/category/sports',
    route: { name: 'category', params: { slug: 'sports' } },
    badge: true,
    columns: [
      {
        title: '电竞赛事',
        links: [
          { name: 'LPL', route: { name: 'category', params: { slug: 'game' } } },
          { name: 'KPL', route: { name: 'category', params: { slug: 'game' } } },
          { name: 'Major', route: { name: 'category', params: { slug: 'game' } } },
        ],
      },
      {
        title: '体育赛事',
        links: [
          { name: '篮球', route: { name: 'category', params: { slug: 'sports' } } },
          { name: '足球', route: { name: 'category', params: { slug: 'sports' } } },
        ],
      },
    ],
    promo: home.banners?.[5] || promo.value,
  },
]);

function openMenu(key) {
  cancelClose();
  active.value = key;
}

function scheduleClose() {
  cancelClose();
  closeTimer = setTimeout(() => {
    active.value = '';
  }, 180);
}

function cancelClose() {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
}

function go(menu) {
  active.value = '';
  if (menu.bvid) {
    router.push({ name: 'video', params: { bvid: menu.bvid } });
    return;
  }
  if (menu.route) router.push(menu.route);
}

function noop() {}

onBeforeUnmount(cancelClose);
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.top-nav {
  display: flex;
  align-items: center;
  height: $header-bar-height;
  margin-right: 30px;

  &__item {
    position: relative;
    list-style: none;
    margin-right: 20px;

    &:last-child {
      margin-right: 0;
    }
  }

  &__entry {
    display: flex;
    align-items: center;
    gap: 4px;
    height: $header-bar-height;
    font-size: 14px;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
    transition: color $transition-fast;

    &:hover {
      color: $brand-pink;
      text-shadow: none;
    }

    &--home {
      font-weight: 500;
    }

    &--download {
      gap: 6px;
    }
  }

  &__badge {
    color: #ffd166;
  }
}

.mega-menu {
  position: absolute;
  top: $header-bar-height;
  left: -20px;
  z-index: $z-popover;
  padding: 8px;
  background: #fff;
  border-radius: $radius-lg;
  box-shadow: $shadow-pop;
  border: 1px solid rgba(0, 0, 0, 0.04);

  &__body {
    display: flex;
    gap: 8px;
  }

  &__col {
    min-width: 118px;
    padding: 8px 12px;
  }

  &__title {
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 600;
    color: $text-1;
    white-space: nowrap;
  }

  &__links {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 8px;
    margin-left: -8px;
    border-radius: $radius-md;
    font-size: 13px;
    color: $text-2;
    white-space: nowrap;
    transition: all $transition-fast;

    &:hover {
      color: $brand-blue;
      background: $bg-card;
    }
  }

  &__hot {
    padding: 0 4px;
    font-size: 10px;
    font-style: normal;
    color: #fff;
    background: linear-gradient(90deg, #ff6b6b, #fb7299);
    border-radius: 3px;
  }

  &__promo {
    position: relative;
    width: 168px;
    flex: none;
    border-radius: $radius-md;
    overflow: hidden;
    cursor: pointer;
    background: $bg-card;

    img {
      width: 100%;
      height: 96px;
      object-fit: cover;
      transition: transform $transition-base;
    }

    &:hover img {
      transform: scale(1.06);
    }
  }

  &__promo-title {
    padding: 6px 8px 2px;
    font-size: 12px;
    color: $text-1;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__promo-tag {
    display: inline-block;
    margin: 0 8px 8px;
    padding: 0 6px;
    font-size: 11px;
    color: $brand-blue;
    background: rgba(0, 174, 236, 0.1);
    border-radius: $radius-sm;
  }
}
</style>
