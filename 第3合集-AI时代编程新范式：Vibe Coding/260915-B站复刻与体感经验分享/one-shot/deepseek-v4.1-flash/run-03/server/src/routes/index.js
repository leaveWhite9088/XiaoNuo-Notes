import { Router } from 'express';
import homeRoutes from './home.routes.js';
import videoRoutes from './video.routes.js';
import searchRoutes from './search.routes.js';
import categoryRoutes from './category.routes.js';
import userRoutes from './user.routes.js';
import playRoutes from './play.routes.js';

/**
 * /api 路由总装：所有子路由在此挂载，app.js 只负责中间件与错误处理。
 */
const router = Router();

// 首页聚合 / 信息流：home.routes 内部已声明 /home、/feed、/filters、/stats
router.use('/', homeRoutes);
router.use('/videos', videoRoutes);
router.use('/search', searchRoutes);
router.use('/categories', categoryRoutes);
router.use('/users', userRoutes);
router.use('/play', playRoutes);

export default router;
