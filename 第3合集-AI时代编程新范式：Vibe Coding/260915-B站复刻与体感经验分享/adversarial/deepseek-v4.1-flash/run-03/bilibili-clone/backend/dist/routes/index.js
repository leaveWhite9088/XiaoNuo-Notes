import { Router } from 'express';
import { homeController } from '../controllers/homeController.js';
import { searchController } from '../controllers/searchController.js';
import { videoController } from '../controllers/videoController.js';
import { historyController } from '../controllers/historyController.js';
/**
 * 路由层：只负责 URL -> 控制器的映射。
 * 前端约定所有接口都挂在 /api 下。
 */
export const apiRouter = Router();
apiRouter.get('/health', (_req, res) => {
    res.json({ code: 0, message: 'OK', data: { status: 'up', ts: Date.now() } });
});
// ---- 首页 ----
apiRouter.get('/home', homeController.overview);
apiRouter.get('/feed', homeController.feed);
apiRouter.get('/sidebar', homeController.sidebar);
apiRouter.get('/categories', homeController.categories);
// ---- 顶栏面板（收藏 / 动态 / 消息 / 创作中心）----
apiRouter.get('/me/favorites', homeController.favorites);
apiRouter.get('/me/dynamics', homeController.dynamics);
apiRouter.get('/me/notifications', homeController.notifications);
apiRouter.get('/me/creator-stats', homeController.creatorStats);
// ---- 搜索 ----
apiRouter.get('/search/suggest', searchController.suggest);
apiRouter.get('/search/hot', searchController.hot);
apiRouter.get('/search', searchController.search);
// ---- 视频 ----
apiRouter.get('/videos/:bvid', videoController.detail);
apiRouter.get('/videos/:bvid/play', videoController.play);
apiRouter.get('/videos/:bvid/danmaku', videoController.danmaku);
apiRouter.post('/videos/:bvid/danmaku', videoController.createDanmaku);
apiRouter.get('/videos/:bvid/comments', videoController.comments);
apiRouter.post('/videos/:bvid/comments', videoController.createComment);
apiRouter.post('/videos/:bvid/toggle/:field', videoController.toggle);
apiRouter.post('/comments/:id/like', videoController.likeComment);
// ---- 历史 ----
apiRouter.get('/history', historyController.list);
apiRouter.post('/history', historyController.record);
apiRouter.delete('/history', historyController.clear);
//# sourceMappingURL=index.js.map