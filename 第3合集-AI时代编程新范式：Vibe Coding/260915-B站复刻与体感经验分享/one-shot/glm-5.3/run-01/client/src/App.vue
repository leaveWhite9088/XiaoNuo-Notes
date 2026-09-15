<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import AppHeader from './components/AppHeader.vue';
import ToastHost from './components/ToastHost.vue';

const router = useRouter();

// 头部导航：点击 logo 始终回首页（返回首页主路径之一）
function goHome() {
  router.push('/');
}

let mounted = true;
onMounted(() => {
  mounted = true;
});
onBeforeUnmount(() => {
  mounted = false;
});
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </main>
    <footer class="app-footer">
      <div class="footer-links">
        <a href="javascript:void(0)">关于我们</a>
        <a href="javascript:void(0)">联系我们</a>
        <a href="javascript:void(0)">加入我们</a>
        <a href="javascript:void(0)">友情链接</a>
        <a href="javascript:void(0)">用户协议</a>
        <a href="javascript:void(0)">隐私政策</a>
        <a href="javascript:void(0)">社区规则</a>
      </div>
      <p class="footer-note">
        本站为 bilibili 首页复刻的学习演示项目：数据来自 B 站公开接口抓取，仅用于本地演示，与 bilibili
        官方无关。视频播放使用公开示例片源。
      </p>
    </footer>
    <ToastHost />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.app-main {
  flex: 1;
  padding-top: var(--header-h);
}
.app-footer {
  margin-top: 40px;
  border-top: 1px solid var(--line);
  background: #fff;
  padding: 24px 0 32px;
  text-align: center;
}
.footer-links a {
  color: var(--text-2);
  margin: 0 12px;
  font-size: 13px;
}
.footer-links a:hover {
  color: var(--bili-pink);
}
.footer-note {
  margin-top: 12px;
  color: var(--text-3);
  font-size: 12px;
  padding: 0 24px;
}
</style>
