import type { Request, Response } from 'express';
import { ok } from '../middleware/index.js';
import { historyService } from '../services/historyService.js';

/** 控制器层：观看历史 */
export const historyController = {
  list(_req: Request, res: Response) {
    ok(res, historyService.list());
  },

  record(req: Request, res: Response) {
    const bvid = String(req.body?.bvid ?? '');
    const progress = Number(req.body?.progress ?? 0);
    ok(res, historyService.record(bvid, progress));
  },

  clear(_req: Request, res: Response) {
    ok(res, historyService.clear());
  },
};
