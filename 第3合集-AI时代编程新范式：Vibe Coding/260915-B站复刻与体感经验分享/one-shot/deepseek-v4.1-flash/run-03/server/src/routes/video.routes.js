import { Router } from 'express';
import * as videoController from '../controllers/videoController.js';

const router = Router();

router.get('/history', videoController.getHistory);
router.get('/:bvid', videoController.getDetail);
router.get('/:bvid/related', videoController.getRelated);
router.get('/:bvid/comments', videoController.getComments);
router.post('/:bvid/comments', videoController.postComment);
router.post('/:bvid/danmaku', videoController.postDanmaku);
router.post('/:bvid/history', videoController.postHistory);

export default router;
