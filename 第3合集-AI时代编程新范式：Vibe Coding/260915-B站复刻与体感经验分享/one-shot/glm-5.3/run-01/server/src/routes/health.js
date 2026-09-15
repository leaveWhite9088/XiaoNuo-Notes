import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({ code: 0, message: 'ok', data: { ok: true, ts: Date.now() } });
});
