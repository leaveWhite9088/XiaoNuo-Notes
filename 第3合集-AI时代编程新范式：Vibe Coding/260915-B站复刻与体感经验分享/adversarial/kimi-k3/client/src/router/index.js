import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import VideoDetailView from '../views/VideoDetailView.vue';
import SearchView from '../views/SearchView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/video/:id', name: 'video', component: VideoDetailView },
    { path: '/search', name: 'search', component: SearchView },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
