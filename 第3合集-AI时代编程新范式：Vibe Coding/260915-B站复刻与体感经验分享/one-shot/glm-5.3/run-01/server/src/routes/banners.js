import { Router } from 'express';
import { db } from '../repositories/db.js';

export const bannerRouter = Router();

bannerRouter.get('/', (_req, res) => {
  res.json({ code: 0, message: 'ok', data: db.banners });
});
