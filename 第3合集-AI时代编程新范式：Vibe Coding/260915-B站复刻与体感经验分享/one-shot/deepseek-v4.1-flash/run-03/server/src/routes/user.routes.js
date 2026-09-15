import { Router } from 'express';
import * as userController from '../controllers/userController.js';

const router = Router();

router.get('/me', userController.me);
router.get('/top', userController.topUsers);
router.get('/:mid', userController.getUser);
router.post('/favorites/:bvid', userController.toggleFavorite);

export default router;
