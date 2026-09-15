<script setup lang="ts">
import { RouterLink } from 'vue-router';

/**
 * 页脚：仿 bilibili 的多列信息区。
 * 本站没有真实的「关于我们 / 下载 APP / 友情链接」页面，因此这些条目渲染为纯文本
 * 并标注「演示占位」，不再伪装成可点击链接；真正有页面可去的分区入口使用 RouterLink。
 */
const textColumns = [
  {
    title: '关于我们',
    items: ['关于哔哩哔哩', '帮助中心', '用户协议', '隐私政策', '社区规范', '加入我们'],
  },
  {
    title: '友情链接',
    items: ['哔哩哔哩动画', '创作中心', '开源社区', '开发者文档', '开放平台'],
  },
  {
    title: '下载APP',
    items: ['Android 版', 'iPhone 版', 'iPad 版', 'TV 版', 'Windows 版'],
  },
];

const portalLinks = [
  { label: '番剧', slug: 'douga' },
  { label: '音乐', slug: 'music' },
  { label: '游戏中心', slug: 'game' },
  { label: '知识', slug: 'knowledge' },
  { label: '美食', slug: 'food' },
  { label: '影视', slug: 'movie' },
];

const year = new Date().getFullYear();
</script>

<template>
  <footer class="footer">
    <div class="bili-container">
      <div class="footer__cols">
        <div v-for="col in textColumns" :key="col.title" class="footer__col">
          <h4>{{ col.title }}</h4>
          <span v-for="item in col.items" :key="item" class="footer__text" title="演示占位，未接入外链">
            {{ item }}
          </span>
        </div>

        <div class="footer__col">
          <h4>传送门</h4>
          <RouterLink
            v-for="link in portalLinks"
            :key="link.slug"
            class="footer__link"
            :to="{ name: 'category', params: { slug: link.slug } }"
          >
            {{ link.label }}
          </RouterLink>
        </div>

        <div class="footer__col footer__col--brand">
          <h4>哔哩哔哩 (゜-゜)つロ</h4>
          <p>干杯~ 这里是 B 站首页复刻 Demo，用于前端工程与分层架构演示。</p>
          <p class="footer__note">Vue 3 · Vite · TypeScript · Pinia · Express · SQLite</p>
        </div>
      </div>

      <div class="footer__bottom">
        <span>© 2009-{{ year }} bilibili 复刻演示 · 仅供学习交流</span>
        <span class="footer__dot">·</span>
        <span>沪ICP备00000000号（占位）</span>
        <span class="footer__dot">·</span>
        <span>沪公网安备 00000000000000 号（占位）</span>
      </div>
      <p class="footer__tip">标注「演示占位」的条目没有对应页面，故仅作展示；可点击的入口都会真的跳转。</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: 40px;
  padding: 32px 0 24px;
  border-top: 1px solid var(--line-light);
  background: var(--bg-gray);
  color: var(--text-2);
}
.footer__cols {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr)) 1.6fr;
  gap: 24px;
}
.footer__col h4 {
  font-size: 14px;
  color: var(--text-1);
  margin-bottom: 12px;
}
.footer__text,
.footer__link {
  display: block;
  font-size: 12px;
  line-height: 2;
}
.footer__text {
  color: var(--text-3);
  cursor: default;
}
.footer__link {
  color: var(--text-2);
}
.footer__link:hover {
  color: var(--bili-pink);
}
.footer__col--brand p {
  font-size: 12px;
  color: var(--text-3);
  line-height: 1.8;
}
.footer__note {
  margin-top: 6px;
  color: var(--text-2) !important;
}
.footer__bottom {
  margin-top: 26px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
  font-size: 12px;
  color: var(--text-3);
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.footer__tip {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-4);
}
@media (max-width: 1000px) {
  .footer__cols {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
