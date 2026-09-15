import { Router } from 'express';
import * as playController from '../controllers/playController.js';

const router = Router();

router.get('/:bvid/info', playController.getPlayInfo);
router.get('/:bvid/stream', playController.stream);

export default router;
