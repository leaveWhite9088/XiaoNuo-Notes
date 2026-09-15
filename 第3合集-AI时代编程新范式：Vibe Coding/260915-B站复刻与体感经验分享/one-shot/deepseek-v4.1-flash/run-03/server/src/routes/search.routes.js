import { Router } from 'express';
import * as searchController from '../controllers/searchController.js';

const router = Router();

router.get('/suggest', searchController.suggest);
router.get('/', searchController.search);
router.get('/history', searchController.history);
router.delete('/history', searchController.clearHistory);

export default router;
