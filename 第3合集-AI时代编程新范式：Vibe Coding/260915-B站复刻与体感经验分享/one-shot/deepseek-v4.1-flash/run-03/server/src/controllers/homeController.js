import feedService from '../services/feedService.js';
import catalogService from '../services/catalogService.js';
import searchService from '../services/searchService.js';
import videoRepository from '../repositories/videoRepository.js';
import { ok } from './respond.js';
import asyncHandler from '../utils/asyncHandler.js';

/** 首页 / 信息流控制器 */

export const getHome = asyncHandler(async (req, res) => {
  ok(res, feedService.getHome());
});

export const getFeed = asyncHandler(async (req, res) => {
  const { category = 'all', sort = 'hot', page = 1, pageSize } = req.query;
  ok(res, feedService.getFeed({ categorySlug: category, sort, page, pageSize }));
});

export const getFilters = asyncHandler(async (req, res) => {
  ok(res, {
    ...feedService.getFilterOptions(),
    categories: catalogService.listCategories({ onlyFilter: true }),
    navCategories: catalogService.listCategories({ onlyNav: true }),
  });
});

export const getStats = asyncHandler(async (req, res) => {
  ok(res, videoRepository.stats());
});

export const getHotSearches = asyncHandler(async (req, res) => {
  ok(res, searchService.hotSearches(Number(req.query.limit) || 10));
});

export default { getHome, getFeed, getFilters, getStats, getHotSearches };
