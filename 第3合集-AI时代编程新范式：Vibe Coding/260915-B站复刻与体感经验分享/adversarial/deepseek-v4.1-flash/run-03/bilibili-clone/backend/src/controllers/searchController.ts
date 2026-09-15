import type { Request, Response } from 'express';
import { ok, parsePaging } from '../middleware/index.js';
import { searchService } from '../services/searchService.js';

/** 控制器层：搜索建议 / 搜索结果 / 热搜榜 */
export const searchController = {
  suggest(req: Request, res: Response) {
    const keyword = String(req.query.keyword ?? '');
    ok(res, searchService.suggest(keyword, 10));
  },

  search(req: Request, res: Response) {
    const keyword = String(req.query.keyword ?? '');
    const { page, pageSize } = parsePaging(req.query as Record<string, unknown>);
    const sort = String(req.query.sort ?? 'default') as 'default' | 'play' | 'newest' | 'danmaku';
    ok(res, searchService.search({ keyword, page, pageSize, sort }));
  },

  hot(_req: Request, res: Response) {
    ok(res, searchService.hot());
  },
};
