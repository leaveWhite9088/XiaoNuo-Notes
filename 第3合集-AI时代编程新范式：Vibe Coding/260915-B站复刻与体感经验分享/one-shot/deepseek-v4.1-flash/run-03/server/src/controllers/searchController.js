import searchService from '../services/searchService.js';
import { ok } from './respond.js';
import asyncHandler from '../utils/asyncHandler.js';

/** 搜索控制器 */

export const suggest = asyncHandler(async (req, res) => {
  const { keyword = '', limit = 10 } = req.query;
  ok(res, searchService.suggest(keyword, Number(limit)));
});

export const search = asyncHandler(async (req, res) => {
  const { keyword = '', page = 1, pageSize, category = 'all' } = req.query;
  ok(res, searchService.search({ keyword, page, pageSize, categorySlug: category }));
});

export const history = asyncHandler(async (req, res) => {
  ok(res, searchService.history(Number(req.query.limit) || 8));
});

export const clearHistory = asyncHandler(async (req, res) => {
  ok(res, searchService.clearHistory());
});

export default { suggest, search, history, clearHistory };
