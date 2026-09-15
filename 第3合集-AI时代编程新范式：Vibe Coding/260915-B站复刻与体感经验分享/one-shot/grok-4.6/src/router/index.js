import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import VideoView from '../views/VideoView.vue'
import SearchView from '../views/SearchView.vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/video/:bvid', name: 'video', component: VideoView },
    { path: '/search', name: 'search', component: SearchView }
  ]
})

export default router
