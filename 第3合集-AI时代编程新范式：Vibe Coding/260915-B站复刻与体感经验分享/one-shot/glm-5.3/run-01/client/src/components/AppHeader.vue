<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import SearchBox from './SearchBox.vue';
import BaseIcon from './BaseIcon.vue';
import { useUserStore } from '../stores/user.js';
import { toast } from '../composables/toast';

const router = useRouter();
const route = useRoute();
const user = useUserStore();

const scrolled = ref(false);

function onScroll() {
  scrolled.value = window.scrollY > 8;
}
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }));
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll));

// ---------- 左侧主导航（hover 展开二级菜单） ----------
const NAV_ITEMS = [
  { label: '首页', to: '/' },
  {
    label: '番剧',
    region: 'animation',
    menu: [
      { group: '番剧', items: ['新番时间表', '新番导视', '完结番剧', '番剧资讯'] },
      { group: '国创', items: ['国创时间表', '国产动画', '国产漫画'] },
    ],
  },
  {
    label: '直播',
    menu: [
      { group: '热门直播', items: ['英雄联盟', '王者荣耀', '虚拟主播', '聊天电台'] },
      { group: '直播分区', items: ['网游', '手游', '娱乐', '电台'] },
    ],
  },
  {
    label: '游戏中心',
    region: 'game',
    menu: [
      { group: '游戏推荐', items: ['新游速报', '游戏评测', '独立游戏', '游戏攻略'] },
      { group: '热门榜单', items: ['热门游戏榜', '新游期待榜'] },
    ],
  },
  {
    label: '会员购',
    narrowHide: true,
    menu: [
      { group: '手办', items: ['新品预订', '限量版', '景品手办'] },
      { group: '周边', items: ['IP 周边', '数码周边', '服饰'] },
    ],
  },
  {
    label: '漫画',
    narrowHide: true,
    menu: [
      { group: '漫画推荐', items: ['恋爱', '搞笑', '冒险', '科幻'] },
      { group: '榜单', items: ['人气榜', '更新榜', '付费榜'] },
    ],
  },
  {
    label: '赛事',
    narrowHide: true,
    region: 'sports',
    menu: [
      { group: '电竞赛事', items: ['LPL 职业联赛', '国际赛事', '第三方赛事'] },
      { group: '体育赛事', items: ['篮球', '足球', '综合体育'] },
    ],
  },
];

const activeNav = ref(null);
let navCloseTimer = null;

function openNav(item) {
  clearTimeout(navCloseTimer);
  activeNav.value = item.menu ? item : null;
}
function scheduleCloseNav() {
  clearTimeout(navCloseTimer);
  navCloseTimer = setTimeout(() => (activeNav.value = null), 150);
}
function navClick(item) {
  activeNav.value = null;
  if (item.to) {
    router.push(item.to);
  } else if (item.region) {
    router.push({ path: '/', query: { region: item.region } });
  } else {
    toast(`演示站点：「${item.label}」频道为静态菜单演示`);
  }
}
function menuItemClick(label) {
  activeNav.value = null;
  toast(`演示站点：菜单「${label}」为静态演示`);
}

// ---------- 右侧快捷入口（hover 展开面板） ----------
const QUICK_ITEMS = [
  { key: 'vip', icon: 'crown', label: '大会员', badge: 0, texts: ['开通大会员，享高清画质与专属挂件', '本月限定装扮上线'] },
  { key: 'message', icon: 'bell', label: '消息', badge: 3, texts: ['回复我的：3 条新回复', '收到的赞：1 个赞', '@ 我：暂无新消息'] },
  { key: 'dynamic', icon: 'bolt', label: '动态', badge: 0, texts: ['暂无新动态', '去关注喜欢的 UP 主吧'] },
  { key: 'favorite', icon: 'star', label: '收藏', badge: 0, texts: ['收藏夹是空的', '看到好内容记得收藏哦'] },
  { key: 'history', icon: 'clock', label: '历史', badge: 0, texts: ['还没有观看记录', '看过的视频会出现在这里'] },
];

const activeQuick = ref(null);
let quickCloseTimer = null;

function openQuick(item) {
  clearTimeout(quickCloseTimer);
  activeQuick.value = item;
}
function scheduleCloseQuick() {
  clearTimeout(quickCloseTimer);
  quickCloseTimer = setTimeout(() => (activeQuick.value = null), 150);
}
function quickClick(item) {
  activeQuick.value = null;
  if (item.key === 'favorite' || item.key === 'history') {
    toast('演示站点：收藏与历史为静态演示');
  } else {
    toast(`演示站点：「${item.label}」为静态演示`);
  }
}

// ---------- 头像下拉菜单（hover 展开） ----------
const avatarOpen = ref(false);
let avatarTimer = null;
function openAvatar() {
  clearTimeout(avatarTimer);
  avatarOpen.value = true;
}
function scheduleCloseAvatar() {
  clearTimeout(avatarTimer);
  avatarTimer = setTimeout(() => (avatarOpen.value = false), 150);
}
const AVATAR_MENU = [
  { icon: 'person', label: '个人主页' },
  { icon: 'comment', label: '我的消息' },
  { icon: 'crown', label: '会员中心' },
  { icon: 'pen', label: '创作中心' },
  { icon: 'upload', label: '投稿管理' },
  { icon: 'settings', label: '推荐设置' },
  { icon: 'logout', label: '退出登录', danger: true },
];
function avatarMenuClick(label) {
  avatarOpen.value = false;
  toast(label === '退出登录' ? '演示站点：账号体系未实现，退出仅作演示' : `演示站点：「${label}」为静态演示`);
}
</script>

<template>
  <header class="app-header" :class="{ scrolled }">
    <div class="header-inner">
      <div class="header-left">
        <a class="logo" href="/" @click.prevent="router.push('/')">
          <svg viewBox="0 0 64 64" class="logo-tv" aria-hidden="true">
            <rect x="4" y="14" width="56" height="42" rx="12" fill="#fb7299" />
            <path d="M20 6l6 8M44 6l-6 8" stroke="#fb7299" stroke-width="6" stroke-linecap="round" />
            <circle cx="22" cy="34" r="5" fill="#fff" />
            <circle cx="42" cy="34" r="5" fill="#fff" />
            <path d="M24 46q8 6 16 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" />
          </svg>
          <span class="logo-text">bilibili</span>
        </a>

        <nav class="main-nav" @mouseleave="scheduleCloseNav">
          <div
            v-for="item in NAV_ITEMS"
            :key="item.label"
            class="nav-item"
            :class="{ 'narrow-hide': item.narrowHide }"
            @mouseenter="openNav(item)"
            @mouseleave="scheduleCloseNav"
          >
            <a class="nav-link" @click="navClick(item)">{{ item.label }}</a>
          </div>

          <!-- 导航二级菜单面板 -->
          <Transition name="drop">
            <div v-if="activeNav" class="nav-panel" @mouseenter="openNav(activeNav)" @mouseleave="scheduleCloseNav">
              <div class="nav-panel-title">{{ activeNav.label }}</div>
              <div class="nav-panel-grid">
                <div v-for="col in activeNav.menu" :key="col.group" class="nav-panel-col">
                  <div class="nav-panel-group">{{ col.group }}</div>
                  <a v-for="sub in col.items" :key="sub" class="nav-panel-item" @click="menuItemClick(sub)">
                    {{ sub }}
                  </a>
                </div>
              </div>
            </div>
          </Transition>
        </nav>
      </div>

      <div class="header-right">
        <SearchBox />

        <div class="quick-group" @mouseleave="scheduleCloseQuick">
          <div
            v-for="item in QUICK_ITEMS"
            :key="item.key"
            class="quick-item"
            @mouseenter="openQuick(item)"
            @click="quickClick(item)"
          >
            <BaseIcon :name="item.icon" :size="18" />
            <span class="quick-label">{{ item.label }}</span>
            <span v-if="item.badge" class="quick-badge">{{ item.badge }}</span>
          </div>

          <Transition name="drop">
            <div v-if="activeQuick" class="quick-panel" @mouseenter="openQuick(activeQuick)" @mouseleave="scheduleCloseQuick">
              <div class="quick-panel-title">{{ activeQuick.label }}</div>
              <div v-for="(text, i) in activeQuick.texts" :key="i" class="quick-panel-row">{{ text }}</div>
            </div>
          </Transition>
        </div>

        <div class="avatar-wrap" @mouseenter="openAvatar" @mouseleave="scheduleCloseAvatar">
          <img class="avatar" :src="user.profile.face" alt="用户头像" />
          <Transition name="drop">
            <div v-if="avatarOpen" class="avatar-menu">
              <div class="avatar-menu-head">
                <img class="avatar-large" :src="user.profile.face" alt="" />
                <div>
                  <div class="avatar-name">{{ user.profile.name }}</div>
                  <div class="avatar-level">Lv6 大会员体验中</div>
                </div>
              </div>
              <a v-for="m in AVATAR_MENU" :key="m.label" class="avatar-menu-item" :class="{ danger: m.danger }" @click="avatarMenuClick(m.label)">
                <BaseIcon :name="m.icon" :size="15" />
                <span>{{ m.label }}</span>
              </a>
            </div>
          </Transition>
        </div>

        <button class="upload-btn" @click="toast('演示站点：投稿功能未实现')">
          <BaseIcon name="upload" :size="14" />
          投稿
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-h);
  background: #fff;
  z-index: 1000;
  transition: box-shadow 0.2s;
}
.app-header.scrolled {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.header-inner {
  max-width: 1440px;
  margin: 0 auto;
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 0;
}
.logo {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  cursor: pointer;
}
.logo-tv {
  width: 34px;
  height: 34px;
}
.logo-text {
  font-size: 21px;
  font-weight: 800;
  color: var(--bili-pink);
  letter-spacing: -0.5px;
}
.main-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
  height: 100%;
}
.nav-item {
  height: 100%;
  display: flex;
  align-items: center;
}
.nav-link {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-1);
  cursor: pointer;
  white-space: nowrap;
}
.nav-link:hover {
  background: var(--bg-page);
  color: var(--bili-pink);
}

/* 导航二级菜单 */
.nav-panel {
  position: absolute;
  top: calc(100% + 10px);
  left: -40px;
  min-width: 420px;
  background: #fff;
  border-radius: 10px;
  box-shadow: var(--shadow-pop);
  padding: 18px 22px;
  cursor: default;
}
.nav-panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--bili-pink);
  margin-bottom: 12px;
}
.nav-panel-grid {
  display: flex;
  gap: 36px;
}
.nav-panel-group {
  font-size: 13px;
  color: var(--text-3);
  margin-bottom: 8px;
}
.nav-panel-item {
  display: block;
  font-size: 14px;
  color: var(--text-1);
  padding: 5px 0;
  cursor: pointer;
}
.nav-panel-item:hover {
  color: var(--bili-pink);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

/* 快捷入口 */
.quick-group {
  display: flex;
  align-items: center;
  gap: 2px;
  position: relative;
}
.quick-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 4px 8px;
  border-radius: 6px;
  color: var(--text-2);
  cursor: pointer;
}
.quick-item:hover {
  background: var(--bg-page);
  color: var(--bili-pink);
}
.quick-label {
  font-size: 11px;
}
.quick-badge {
  position: absolute;
  top: 0;
  right: 2px;
  min-width: 14px;
  height: 14px;
  line-height: 14px;
  text-align: center;
  border-radius: 7px;
  background: var(--bili-pink);
  color: #fff;
  font-size: 10px;
  padding: 0 2px;
}
.quick-panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 240px;
  background: #fff;
  border-radius: 10px;
  box-shadow: var(--shadow-pop);
  padding: 14px 16px;
  cursor: default;
  z-index: 1100;
}
.quick-panel-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
}
.quick-panel-row {
  font-size: 13px;
  color: var(--text-2);
  padding: 4px 0;
}

/* 头像 */
.avatar-wrap {
  position: relative;
}
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid var(--line);
  cursor: pointer;
  object-fit: cover;
}
.avatar-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: -10px;
  width: 210px;
  background: #fff;
  border-radius: 10px;
  box-shadow: var(--shadow-pop);
  padding: 8px;
  cursor: default;
  z-index: 1100;
}
.avatar-menu-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 6px;
}
.avatar-large {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-name {
  font-size: 14px;
  font-weight: 600;
}
.avatar-level {
  font-size: 12px;
  color: var(--bili-pink);
  margin-top: 2px;
}
.avatar-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-1);
  cursor: pointer;
}
.avatar-menu-item:hover {
  background: var(--bg-page);
  color: var(--bili-pink);
}
.avatar-menu-item.danger:hover {
  color: #f25d8e;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bili-pink);
  color: #fff;
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 14px;
  flex-shrink: 0;
  transition: background 0.2s;
}
.upload-btn:hover {
  background: var(--bili-pink-light);
}

/* 下拉过渡 */
.drop-enter-active,
.drop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 1200px) {
  .quick-label {
    display: none;
  }
  .quick-item {
    padding: 4px 6px;
  }
}
@media (max-width: 1280px) {
  .nav-item.narrow-hide {
    display: none;
  }
}
@media (max-width: 1000px) {
  .main-nav {
    display: none;
  }
}
</style>
