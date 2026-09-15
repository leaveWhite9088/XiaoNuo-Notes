import { Router } from 'express';
import feedRoutes from './feedRoutes.js';
import videoRoutes from './videoRoutes.js';
import searchRoutes from './searchRoutes.js';
import { datasetMeta } from '../data/dataset.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ code: 0, data: { status: 'ok', uptime: process.uptime(), dataset: datasetMeta } });
});

router.use(feedRoutes);
router.use(videoRoutes);
router.use(searchRoutes);

export default router;
