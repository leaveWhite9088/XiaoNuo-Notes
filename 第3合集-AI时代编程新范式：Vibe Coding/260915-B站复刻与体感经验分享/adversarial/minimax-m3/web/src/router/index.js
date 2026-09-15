import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import VideoDetail from '@/views/VideoDetail.vue';
import Category from '@/views/Category.vue';

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/video/:id', name: 'video', component: VideoDetail, props: true },
    { path: '/c/:tid', name: 'category', component: Category, props: true },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  },
});
