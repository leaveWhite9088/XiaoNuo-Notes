import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';

const router = Router();

router.get('/', categoryController.listCategories);
router.get('/:slug', categoryController.getCategory);

export default router;
