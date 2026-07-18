import { Router } from 'express';
import videoRoutes from './videos';
import commentRoutes from './comments';
import danmakuRoutes from './danmaku';
import userRoutes from './user';
import authRoutes from './auth';

const router = Router();

router.use('/videos', videoRoutes);
router.use('/comments', commentRoutes);
router.use('/danmaku', danmakuRoutes);
router.use('/user', userRoutes);
router.use('/auth', authRoutes);

export default router;