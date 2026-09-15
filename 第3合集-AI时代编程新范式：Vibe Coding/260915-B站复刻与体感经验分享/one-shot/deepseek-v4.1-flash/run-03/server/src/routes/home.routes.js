import { Router } from 'express';
import * as homeController from '../controllers/homeController.js';

const router = Router();

router.get('/home', homeController.getHome);
router.get('/feed', homeController.getFeed);
router.get('/filters', homeController.getFilters);
router.get('/stats', homeController.getStats);
router.get('/hot-searches', homeController.getHotSearches);

export default router;
