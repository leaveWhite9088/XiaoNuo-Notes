<script setup>
/** 全局头部：logo/主导航/分区大菜单/搜索/右侧功能图标（悬停展开面板）/头像菜单/投稿按钮 */
import { useRouter } from 'vue-router';
import BIcon from './BIcon.vue';
import SearchBox from './SearchBox.vue';
import HeaderDropdown from './HeaderDropdown.vue';
import { useCategories } from '../composables/useCategories';
import { useUserStore } from '../stores/user';
import { useToastStore } from '../stores/toast';
import { formatCount, timeAgo } from '../utils/format';

const router = useRouter();
const user = useUserStore();
const toast = useToastStore();
const { chips, menu, failed: categoriesFailed, reload: reloadCategories } = useCategories();

const primaryNav = [
  { label: '首页', to: () => router.push('/') },
  { label: '番剧', to: () => router.push({ name: 'home', query: { category: 'anime' } }) },
  { label: '直播', toast: '演示站未收录直播频道' },
  { label: '游戏中心', to: () => router.push({ name: 'home', query: { category: 'game' } }) },
  { label: '会员购', toast: '演示站未收录会员购' },
  { label: '漫画', toast: '演示站未收录漫画频道' },
  { label: '赛事', toast: '演示站未收录赛事频道' },
  { label: '下载客户端', toast: '演示项目暂无客户端' },
];

function navClick(item) {
  if (item.to) item.to();
  else toast.show(item.toast);
}
function goCategory(key) {
  router.push({ name: 'home', query: key ? { category: key } : {} });
}
function goVideo(bvid) {
  router.push({ name: 'video', params: { id: bvid } });
}
function toastDemo(msg = '演示项目未接入该功能') {
  toast.show(msg);
}
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- Logo：点击返回首页 -->
      <a class="logo" href="/" @click.prevent="goCategory('')" title="回到首页">
        <svg class="tv" viewBox="0 0 44 32" aria-hidden="true">
          <path d="M8 2.5 15 9h6l7-6.5" stroke="var(--bili-pink)" stroke-width="4" fill="none" stroke-linecap="round" />
          <rect x="2" y="8" width="40" height="24" rx="5" fill="var(--bili-pink)" />
          <circle cx="14" cy="20" r="4.6" fill="#fff" />
          <circle cx="30" cy="20" r="4.6" fill="#fff" />
        </svg>
        <span class="wordmark">bilibili</span>
      </a>

      <!-- 主导航 -->
      <nav class="primary-nav">
        <a v-for="item in primaryNav" :key="item.label" href="javascript:;" @click="navClick(item)">
          {{ item.label }}<i v-if="item.label === '下载客户端'" class="mini-tag">NEW</i>
        </a>
      </nav>

      <!-- 分区大菜单 -->
      <HeaderDropdown :width="520" align="left" title="全部分区">
        <template #trigger>
          <button class="zone-trigger">
            分区
            <BIcon name="chevron-down" :size="14" />
          </button>
        </template>
        <div v-if="categoriesFailed" class="zone-failed" @click="reloadCategories">
          分类加载失败，点击重试
        </div>
        <div v-else class="zone-grid">
          <a v-for="c in [...chips, ...menu]" :key="c.key" href="javascript:;" class="zone-item" @click="goCategory(c.key)">
            <span class="zone-dot" />{{ c.label }}
          </a>
        </div>
      </HeaderDropdown>

      <!-- 搜索 -->
      <div class="header-search">
        <SearchBox />
      </div>

      <!-- 右侧功能区 -->
      <div class="right-cluster">
        <!-- 头像菜单 -->
        <HeaderDropdown :width="260" title="游客模式（本地体验数据）">
          <template #trigger>
            <a class="avatar" href="javascript:;" title="个人中心">
              <img v-if="user.history[0]?.cover" :src="user.history[0].cover" alt="头像" />
              <span v-else class="avatar-fallback">客</span>
            </a>
          </template>
          <div class="avatar-head">
            <span class="avatar-big">客</span>
            <div class="avatar-info">
              <b>游客_114514</b>
              <span>硬币 512 · 经验 60/80</span>
            </div>
          </div>
          <div class="avatar-menu">
            <a href="javascript:;" @click="toastDemo('演示项目未接入个人空间')">个人空间</a>
            <a href="javascript:;" @click="toastDemo('演示项目未接入投稿管理')">投稿管理</a>
            <a href="javascript:;" @click="toastDemo('演示项目未接入大会员')">大会员</a>
            <a href="javascript:;" @click="toastDemo('演示项目未接入推荐设置')">推荐设置</a>
            <a href="javascript:;" class="logout" @click="toastDemo('游客模式无需退出')">退出登录</a>
          </div>
        </HeaderDropdown>

        <a class="icon-item" href="javascript:;" title="大会员" @click="toastDemo('演示项目未接入大会员')">
          <BIcon name="vip" :size="19" />
        </a>

        <!-- 消息 -->
        <HeaderDropdown :width="340" title="消息">
          <template #trigger>
            <a class="icon-item" href="javascript:;" title="消息"><BIcon name="message" :size="19" /><i class="badge">2</i></a>
          </template>
          <div class="panel-rows">
            <a href="javascript:;" @click="toastDemo('演示项目未接入消息系统')"><BIcon name="reply" :size="18" />回复我的<i class="count">1</i></a>
            <a href="javascript:;" @click="toastDemo('演示项目未接入消息系统')"><BIcon name="like" :size="18" />收到的赞<i class="count">1</i></a>
            <a href="javascript:;" @click="toastDemo('演示项目未接入消息系统')"><BIcon name="dynamic" :size="18" />@我<i class="count">0</i></a>
          </div>
        </HeaderDropdown>

        <!-- 动态 -->
        <HeaderDropdown :width="340" title="动态">
          <template #trigger>
            <a class="icon-item" href="javascript:;" title="动态"><BIcon name="dynamic" :size="19" /></a>
          </template>
          <div class="panel-empty">
            登录后可查看关注的 UP 主动态<br />
            <small>演示项目未接入账号体系</small>
          </div>
        </HeaderDropdown>

        <!-- 收藏（稍后再看 / 收藏，真实本地数据） -->
        <HeaderDropdown :width="400" title="我的收藏">
          <template #trigger>
            <a class="icon-item" href="javascript:;" title="收藏"><BIcon name="star" :size="19" /></a>
          </template>
          <div class="panel-rows stack">
            <div class="stack-title">稍后再看（{{ user.watchLater.length }}）</div>
            <template v-if="user.watchLater.length">
              <a v-for="h in user.watchLater.slice(0, 3)" :key="'wl' + h.bvid" href="javascript:;" class="media-row" @click="goVideo(h.bvid)">
                <img :src="h.cover" loading="lazy" alt="" />
                <span class="media-info">
                  <span class="clamp-1">{{ h.title }}</span>
                  <small>{{ h.ownerName }} · {{ formatCount(h.view) }}播放</small>
                </span>
              </a>
            </template>
            <div v-else class="panel-empty small">暂无内容，视频卡片右上角悬停可加入稍后再看</div>
            <div class="stack-title">收藏（{{ user.favorites.length }}）</div>
            <template v-if="user.favorites.length">
              <a v-for="h in user.favorites.slice(0, 3)" :key="'fv' + h.bvid" href="javascript:;" class="media-row" @click="goVideo(h.bvid)">
                <img :src="h.cover" loading="lazy" alt="" />
                <span class="media-info">
                  <span class="clamp-1">{{ h.title }}</span>
                  <small>{{ h.ownerName }} · {{ formatCount(h.view) }}播放</small>
                </span>
              </a>
            </template>
            <div v-else class="panel-empty small">暂无内容，视频页点击收藏夹按钮即可收藏</div>
          </div>
        </HeaderDropdown>

        <!-- 历史（真实本地数据） -->
        <HeaderDropdown :width="400" title="历史记录">
          <template #trigger>
            <a class="icon-item" href="javascript:;" title="历史"><BIcon name="history" :size="19" /></a>
          </template>
          <div class="panel-rows stack">
            <template v-if="user.history.length">
              <a v-for="h in user.history.slice(0, 6)" :key="h.bvid" href="javascript:;" class="media-row" @click="goVideo(h.bvid)">
                <img :src="h.cover" loading="lazy" alt="" />
                <span class="media-info">
                  <span class="clamp-1">{{ h.title }}</span>
                  <small>{{ h.ownerName }} · {{ timeAgo(h.at / 1000) }}看过</small>
                </span>
              </a>
            </template>
            <div v-else class="panel-empty small">暂无观看记录，去首页看点视频吧</div>
          </div>
        </HeaderDropdown>

        <!-- 创作中心 -->
        <HeaderDropdown :width="240" title="创作中心">
          <template #trigger>
            <a class="icon-item" href="javascript:;" title="创作中心"><BIcon name="upload" :size="19" /></a>
          </template>
          <div class="panel-rows">
            <button class="upload-btn" @click="toastDemo('演示项目未接入投稿功能')"><BIcon name="upload" :size="16" />视频投稿</button>
            <a href="javascript:;" @click="toastDemo('演示项目未接入内容管理')">内容管理</a>
            <a href="javascript:;" @click="toastDemo('演示项目未接入数据看板')">数据中心</a>
          </div>
        </HeaderDropdown>

        <button class="contribute" @click="toastDemo('演示项目未接入投稿功能')">
          <BIcon name="upload" :size="15" /> 投稿
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--white);
  box-shadow: 0 1px 0 var(--line);
  height: var(--header-h);
}
.header-inner {
  max-width: 1660px;
  margin: 0 auto;
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* logo */
.logo { display: flex; align-items: center; gap: 8px; margin-right: 8px; }
.tv { width: 46px; }
.wordmark {
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.5px;
  background: linear-gradient(90deg, var(--bili-pink), #ff9db6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* 主导航 */
.primary-nav { display: flex; gap: 2px; flex-shrink: 0; }
.primary-nav a {
  position: relative;
  padding: 6px 11px;
  font-size: 14px;
  color: var(--text-1);
  border-radius: 6px;
  transition: all 0.15s;
}
.primary-nav a:hover { color: var(--bili-pink); background: var(--bili-pink-light); }
.mini-tag {
  position: absolute;
  top: -2px;
  right: 0;
  font-size: 10px;
  font-style: normal;
  background: var(--bili-pink);
  color: #fff;
  padding: 0 3px;
  border-radius: 3px;
  line-height: 14px;
}

/* 分区按钮 */
.zone-trigger {
  display: flex;
  align-items: center;
  gap: 3px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--text-1);
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  margin: 0 6px 0 2px;
  transition: all 0.15s;
}
.zone-trigger:hover { color: var(--bili-pink); background: var(--bili-pink-light); }
.zone-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
.zone-failed {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--bili-pink);
  font-size: 13.5px;
  padding: 18px 0;
  cursor: pointer;
}
.zone-failed:hover { background: var(--bg-2); border-radius: 6px; }
.zone-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13.5px;
  transition: all 0.15s;
}
.zone-item:hover { background: var(--bg-2); color: var(--bili-pink); }
.zone-dot { width: 7px; height: 7px; border-radius: 50%; background: linear-gradient(135deg, var(--bili-pink), var(--bili-blue)); }

/* 搜索 */
.header-search { flex: 1; display: flex; justify-content: center; padding: 0 8px; min-width: 0; }

/* 右侧 */
.right-cluster { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.icon-item {
  position: relative;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-2);
  border-radius: 8px;
  transition: all 0.15s;
}
.icon-item:hover { color: var(--bili-pink); background: var(--bili-pink-light); }
.badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 15px;
  height: 15px;
  line-height: 15px;
  font-size: 10px;
  font-style: normal;
  text-align: center;
  background: var(--bili-pink);
  color: #fff;
  border-radius: 8px;
  padding: 0 3px;
}

/* 头像 */
.avatar { width: 38px; height: 38px; margin-right: 4px; }
.avatar img, .avatar-fallback {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid var(--line);
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bili-pink-light);
  color: var(--bili-pink);
  font-weight: 600;
}
.avatar-head { display: flex; gap: 10px; align-items: center; padding: 4px 6px 10px; border-bottom: 1px solid var(--line); margin-bottom: 6px; }
.avatar-big {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--bili-pink), #ffa5c0);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
.avatar-info { display: flex; flex-direction: column; gap: 3px; font-size: 12px; color: var(--text-3); }
.avatar-info b { font-size: 14px; color: var(--text-1); }
.avatar-menu { display: flex; flex-direction: column; }
.avatar-menu a { padding: 8px 10px; border-radius: 6px; font-size: 13.5px; }
.avatar-menu a:hover { background: var(--bg-2); color: var(--bili-pink); }
.avatar-menu .logout { color: var(--text-3); border-top: 1px solid var(--line); margin-top: 4px; border-radius: 0; }

/* 面板通用 */
.panel-rows { display: flex; flex-direction: column; gap: 2px; }
.panel-rows > a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 6px;
  font-size: 13.5px;
  color: var(--text-1);
}
.panel-rows > a:hover { background: var(--bg-2); color: var(--bili-pink); }
.count { margin-left: auto; font-size: 12px; color: var(--text-3); font-style: normal; }
.panel-empty { padding: 26px 10px; text-align: center; color: var(--text-3); font-size: 13px; line-height: 1.8; }
.panel-empty.small { padding: 10px; }
.stack-title { font-size: 12px; color: var(--text-3); padding: 6px 6px 2px; }
.media-row { display: flex; gap: 10px; padding: 7px 6px; border-radius: 6px; }
.media-row:hover { background: var(--bg-2); }
.media-row img { width: 96px; height: 60px; object-fit: cover; border-radius: 4px; flex-shrink: 0; }
.media-info { display: flex; flex-direction: column; gap: 4px; font-size: 13px; min-width: 0; justify-content: center; }
.media-info small { color: var(--text-3); font-size: 12px; }
.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 9px;
  border: none;
  border-radius: 6px;
  background: var(--bili-pink);
  color: #fff;
  font-size: 13.5px;
  cursor: pointer;
  margin-bottom: 6px;
}
.upload-btn:hover { background: var(--bili-pink-hover); }

/* 投稿按钮 */
.contribute {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--text-1);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0 14px;
  height: 40px;
  font-size: 14px;
  cursor: pointer;
  margin-left: 6px;
  transition: all 0.15s;
}
.contribute:hover { background: #333; }

@media (max-width: 1280px) {
  .primary-nav a:nth-child(n+5) { display: none; }
  .wordmark { display: none; }
}
</style>
