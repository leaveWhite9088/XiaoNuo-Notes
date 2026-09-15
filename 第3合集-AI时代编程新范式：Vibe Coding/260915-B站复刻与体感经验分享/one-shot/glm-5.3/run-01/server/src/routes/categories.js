import { Router } from 'express';
import { db } from '../repositories/db.js';

export const categoryRouter = Router();

categoryRouter.get('/', (_req, res) => {
  res.json({ code: 0, message: 'ok', data: db.categories });
});
