import { createRouter, createWebHistory } from 'vue-router';

/** 路由表：首页 / 视频详情 / 搜索 / 分区 / 历史 */
export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, saved) {
    if (saved) return saved;
    if (to.path === from.path) return undefined;
    return { top: 0 };
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: '哔哩哔哩 (゜-゜)つロ 干杯~-bilibili' },
    },
    {
      path: '/video/:bvid',
      name: 'video',
      component: () => import('@/views/VideoDetailView.vue'),
      meta: { title: '视频播放 - 哔哩哔哩' },
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchView.vue'),
      meta: { title: '搜索 - 哔哩哔哩' },
    },
    {
      path: '/category/:slug',
      name: 'category',
      component: () => import('@/views/CategoryView.vue'),
      meta: { title: '分区 - 哔哩哔哩' },
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('@/views/HistoryView.vue'),
      meta: { title: '历史记录 - 哔哩哔哩' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: '页面不存在 - 哔哩哔哩' },
    },
  ],
});

/**
 * 标题策略：静态路由直接取 meta.title；
 * 视频详情 / 搜索 / 分区页的标题由各自视图在数据到达后覆盖（更精确）。
 */
router.afterEach((to) => {
  const title = to.meta?.title as string | undefined;
  if (title) document.title = title;
});
