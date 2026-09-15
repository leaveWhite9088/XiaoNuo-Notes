import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';
import VideoView from './views/VideoView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/video/:id', name: 'video', component: VideoView, props: true },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});
