import { Router } from 'express';
import { searchService } from '../services/searchService.js';
import { ok } from '../middleware/errorHandler.js';

export const searchRouter = Router();

/** 搜索框输入联想 */
searchRouter.get('/suggest', (req, res) => {
  ok(
    res,
    searchService.suggest(String(req.query.q ?? ''), Number(req.query.limit) || 10),
  );
});

/** 搜索结果页 */
searchRouter.get('/', (req, res) => {
  ok(
    res,
    searchService.search({
      keyword: String(req.query.keyword ?? req.query.q ?? ''),
      order: req.query.order as string | undefined,
      page: Number(req.query.page),
      pageSize: Number(req.query.pageSize),
    }),
  );
});

/** 搜索框聚焦时展示的「bilibili 热搜」+ 搜索历史 */
searchRouter.get('/square', (_req, res) => {
  ok(res, { hotSearches: searchService.hotSearches(), history: searchService.history() });
});

searchRouter.delete('/history', (_req, res) => {
  searchService.clearHistory();
  ok(res, { cleared: true });
});
