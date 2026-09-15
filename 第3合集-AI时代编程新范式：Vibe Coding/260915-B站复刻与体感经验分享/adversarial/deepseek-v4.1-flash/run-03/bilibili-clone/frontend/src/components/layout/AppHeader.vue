<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import Icon from '@/components/common/Icon.vue';
import HeaderPanel from '@/components/layout/HeaderPanel.vue';
import SearchBox from '@/components/layout/SearchBox.vue';
import { useHistoryStore } from '@/stores/history';
import { useUiStore } from '@/stores/ui';

/**
 * 顶部导航：Logo / 频道导航 / 搜索建议 / 消息·动态·收藏·创作中心面板 / 投稿菜单 / 用户菜单。
 * 所有按钮都有真实行为：要么跳转、要么展开真实数据面板、要么给出明确的未接入提示。
 */
const route = useRoute();
const router = useRouter();
const history = useHistoryStore();
const ui = useUiStore();

const scrolled = ref(false);
const userMenuOpen = ref(false);
const publishMenuOpen = ref(false);
const activePanel = ref<'message' | 'dynamic' | 'favorite' | 'creator' | null>(null);
const headerRef = ref<HTMLElement | null>(null);
let closeTimer: ReturnType<typeof setTimeout> | null = null;

const navLinks = [
  { label: '首页', to: '/' },
  { label: '番剧', to: '/category/douga' },
  { label: '直播', to: '/search?keyword=直播' },
  { label: '游戏中心', to: '/category/game' },
  { label: '会员购', to: '/category/ent' },
  { label: '漫画', to: '/category/douga' },
  { label: '赛事', to: '/search?keyword=赛事' },
  { label: '下载客户端', to: '/search?keyword=客户端' },
];

const publishItems = [
  { icon: 'i-upload', title: '视频投稿', desc: '投稿视频，分享你的精彩' },
  { icon: 'i-dynamic', title: '发布动态', desc: '记录此刻的想法' },
  { icon: 'i-message', title: '专栏投稿', desc: '写一篇长文' },
];

function onScroll() {
  scrolled.value = window.scrollY > 10;
}

function openUserMenu() {
  if (closeTimer) clearTimeout(closeTimer);
  userMenuOpen.value = true;
}
function scheduleCloseUserMenu() {
  if (closeTimer) clearTimeout(closeTimer);
  closeTimer = setTimeout(() => {
    userMenuOpen.value = false;
  }, 160);
}

function togglePanel(type: 'message' | 'dynamic' | 'favorite' | 'creator') {
  activePanel.value = activePanel.value === type ? null : type;
}

function onDocClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest('.publish')) publishMenuOpen.value = false;
  if (!target.closest('.action-wrap')) activePanel.value = null;
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('click', onDocClick);
  void history.load();
});
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  document.removeEventListener('click', onDocClick);
});

async function goHistory() {
  userMenuOpen.value = false;
  activePanel.value = null;
  await router.push({ name: 'history' });
}

/** Demo 未接入的能力：给明确反馈而不是静默无响应 */
function notImplemented(feature: string) {
  publishMenuOpen.value = false;
  userMenuOpen.value = false;
  activePanel.value = null;
  ui.notImplemented(feature);
}
</script>

<template>
  <header ref="headerRef" class="header" :class="{ 'is-scrolled': scrolled }">
    <div class="header__inner bili-container">
      <!-- Logo -->
      <RouterLink to="/" class="logo" title="哔哩哔哩">
        <Icon name="i-bilibili" :size="34" class="logo__mark" />
        <span class="logo__text">哔哩哔哩</span>
      </RouterLink>

      <!-- 频道导航（悬浮高亮，当前项粉色） -->
      <nav class="nav">
        <RouterLink
          v-for="link in navLinks"
          :key="link.label"
          :to="link.to"
          class="nav__item"
          :class="{ 'is-active': route.path === link.to }"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <!-- 搜索 -->
      <SearchBox />

      <!-- 右侧功能区 -->
      <div class="actions">
        <button class="action" title="大会员（Demo 未接入）" @click="notImplemented('大会员')">
          <Icon name="i-crown" :size="20" />
          <span class="action__label">大会员</span>
        </button>

        <!-- 消息 -->
        <div class="action-wrap">
          <button class="action" title="消息" @click="togglePanel('message')">
            <Icon name="i-message" :size="20" />
            <span class="action__label">消息</span>
            <i class="action__dot"></i>
          </button>
          <Transition name="fade">
            <div v-show="activePanel === 'message'" class="dropdown action-wrap__panel">
              <HeaderPanel type="message" />
            </div>
          </Transition>
        </div>

        <!-- 动态 -->
        <div class="action-wrap">
          <button class="action" title="动态" @click="togglePanel('dynamic')">
            <Icon name="i-dynamic" :size="20" />
            <span class="action__label">动态</span>
          </button>
          <Transition name="fade">
            <div v-show="activePanel === 'dynamic'" class="dropdown action-wrap__panel">
              <HeaderPanel type="dynamic" />
            </div>
          </Transition>
        </div>

        <!-- 收藏 -->
        <div class="action-wrap">
          <button class="action" title="收藏" @click="togglePanel('favorite')">
            <Icon name="i-favorite" :size="20" />
            <span class="action__label">收藏</span>
          </button>
          <Transition name="fade">
            <div v-show="activePanel === 'favorite'" class="dropdown action-wrap__panel">
              <HeaderPanel type="favorite" />
            </div>
          </Transition>
        </div>

        <button class="action" title="历史" @click="goHistory">
          <Icon name="i-history" :size="20" />
          <span class="action__label">历史</span>
        </button>

        <!-- 创作中心 -->
        <div class="action-wrap">
          <button class="action" title="创作中心" @click="togglePanel('creator')">
            <Icon name="i-live" :size="20" />
            <span class="action__label">创作中心</span>
          </button>
          <Transition name="fade">
            <div v-show="activePanel === 'creator'" class="dropdown action-wrap__panel action-wrap__panel--wide">
              <HeaderPanel type="creator" />
            </div>
          </Transition>
        </div>

        <!-- 投稿：点击展开菜单 -->
        <div class="publish">
          <button class="publish__btn" @click.stop="publishMenuOpen = !publishMenuOpen">
            <Icon name="i-upload" :size="18" />
            <span>投稿</span>
          </button>
          <Transition name="fade">
            <div v-show="publishMenuOpen" class="dropdown publish__menu">
              <div class="dropdown__title">创作中心</div>
              <button
                v-for="item in publishItems"
                :key="item.title"
                class="publish__item"
                @click="notImplemented(item.title)"
              >
                <Icon :name="item.icon" :size="20" />
                <span class="publish__item-body">
                  <b>{{ item.title }}</b>
                  <em>{{ item.desc }}</em>
                </span>
              </button>
            </div>
          </Transition>
        </div>

        <!-- 用户头像：悬浮展开菜单 -->
        <div class="user" @mouseenter="openUserMenu" @mouseleave="scheduleCloseUserMenu">
          <span class="user__avatar">哔</span>
          <Transition name="fade">
            <div v-show="userMenuOpen" class="dropdown user__menu">
              <div class="user__head">
                <span class="user__head-avatar">哔</span>
                <div>
                  <b>哔哩哔哩用户</b>
                  <em>UID 20260909</em>
                </div>
              </div>
              <div class="user__grid">
                <button class="user__cell" @click="notImplemented('个人中心')">
                  <Icon name="i-user" :size="18" /><span>个人中心</span>
                </button>
                <button class="user__cell" @click="notImplemented('投稿管理')">
                  <Icon name="i-upload" :size="18" /><span>投稿管理</span>
                </button>
                <button class="user__cell" @click="notImplemented('B币钱包')">
                  <Icon name="i-coin" :size="18" /><span>B币钱包</span>
                </button>
                <button class="user__cell" @click="goHistory"><Icon name="i-history" :size="18" /><span>历史记录</span></button>
              </div>
              <button class="user__logout" @click="notImplemented('退出登录')">退出登录</button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-h);
  background: #fff;
  z-index: 100;
  transition: box-shadow 0.2s;
}
.header.is-scrolled {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}

.header__inner {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 100%;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: none;
}
.logo__mark {
  color: var(--bili-pink);
  width: 34px;
  height: 24px;
}
.logo__text {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--bili-pink);
}

/* 导航 */
.nav {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: none;
}
.nav__item {
  position: relative;
  padding: 0 10px;
  height: 32px;
  line-height: 32px;
  font-size: 15px;
  color: var(--text-1);
  border-radius: var(--radius);
  transition: all 0.18s;
  white-space: nowrap;
}
.nav__item:hover {
  color: var(--bili-pink);
  background: var(--bili-pink-light);
}
.nav__item.is-active {
  color: var(--bili-pink);
  font-weight: 600;
}

/* 操作区 */
.actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  flex: none;
}
.action {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  width: 56px;
  height: 48px;
  color: var(--text-2);
  border-radius: var(--radius);
  transition: all 0.18s;
}
.action:hover {
  color: var(--bili-pink);
  background: var(--bili-pink-light);
}
.action__label {
  font-size: 11px;
  line-height: 1;
}
.action__dot {
  position: absolute;
  top: 8px;
  right: 14px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fe2d46;
}

/* 投稿 */
.publish {
  position: relative;
  margin-left: 6px;
}
.publish__btn {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 34px;
  padding: 0 14px;
  border-radius: var(--radius);
  background: var(--bili-pink);
  color: #fff;
  font-size: 14px;
  transition: background 0.2s;
}
.publish__btn:hover {
  background: var(--bili-pink-hover);
}
.publish__menu {
  left: 50%;
  transform: translateX(-50%);
  width: 250px;
}
.publish__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 14px;
  text-align: left;
  color: var(--text-1);
  transition: background 0.15s;
}
.publish__item:hover {
  background: var(--bg-gray-deep);
  color: var(--bili-pink);
}
.publish__item-body {
  display: flex;
  flex-direction: column;
}
.publish__item-body b {
  font-size: 13px;
  font-weight: 500;
}
.publish__item-body em {
  font-size: 11px;
  font-style: normal;
  color: var(--text-3);
}

/* 用户 */
.user {
  position: relative;
  width: 44px;
  height: 44px;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.user__avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fb7299, #00aeec);
  color: #fff;
  font-size: 16px;
  transition: transform 0.2s;
}
.user:hover .user__avatar {
  transform: scale(1.06);
}
.user__menu {
  right: 0;
  width: 280px;
}
.user__head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line-light);
}
.user__head-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fb7299, #00aeec);
  color: #fff;
}
.user__head b {
  display: block;
  font-size: 14px;
}
.user__head em {
  font-size: 12px;
  font-style: normal;
  color: var(--text-3);
}
.user__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 8px;
  gap: 4px;
}
.user__cell {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border-radius: var(--radius);
  color: var(--text-2);
  font-size: 13px;
  transition: all 0.15s;
}
.user__cell:hover {
  background: var(--bg-gray-deep);
  color: var(--bili-pink);
}
.user__logout {
  width: 100%;
  padding: 10px;
  border-top: 1px solid var(--line-light);
  color: var(--text-3);
  font-size: 13px;
}
.user__logout:hover {
  color: var(--bili-pink);
}

/* 顶栏面板容器 */
.action-wrap {
  position: relative;
}
.action-wrap__panel {
  left: 50%;
  transform: translateX(-50%);
  padding: 0;
  overflow: hidden;
}
.action-wrap__panel--wide {
  width: 300px;
}

/* 下拉容器 */
.dropdown {
  position: absolute;
  top: calc(100% + 6px);
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-3);
  padding: 6px 0;
  z-index: 60;
}
.dropdown__title {
  padding: 8px 14px 4px;
  font-size: 12px;
  color: var(--text-3);
}
</style>
