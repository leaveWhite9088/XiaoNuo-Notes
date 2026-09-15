import { createRouter, createWebHistory } from 'vue-router';

/**
 * 路由表：首页 / 分区 / 搜索 / 视频详情（播放主链路）
 */
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '首页', keepScroll: true },
  },
  {
    path: '/category/:slug',
    name: 'category',
    component: () => import('@/views/CategoryView.vue'),
    meta: { title: '分区' },
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/SearchView.vue'),
    meta: { title: '搜索' },
  },
  {
    path: '/video/:bvid',
    name: 'video',
    component: () => import('@/views/VideoView.vue'),
    meta: { title: '视频详情' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  },
});

router.afterEach((to) => {
  document.title =
    to.name === 'video'
      ? '视频播放 - 哔哩哔哩'
      : to.name === 'search'
        ? `${to.query.keyword || '搜索'} - 搜索结果 - 哔哩哔哩`
        : '哔哩哔哩 (゜-゜)つロ 干杯~-bilibili';
});

export default router;
