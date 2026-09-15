import catalogService from '../services/catalogService.js';
import feedService from '../services/feedService.js';
import videoRepository from '../repositories/videoRepository.js';
import pgcRepository from '../repositories/pgcRepository.js';
import { toPgcDTO, toVideoList } from '../services/mappers.js';
import ApiError from '../utils/ApiError.js';
import { ok } from './respond.js';
import asyncHandler from '../utils/asyncHandler.js';

/** 分区控制器 */

export const listCategories = asyncHandler(async (req, res) => {
  const { scope = 'all' } = req.query;
  if (scope === 'nav') return ok(res, catalogService.listCategories({ onlyNav: true }));
  if (scope === 'filter') return ok(res, catalogService.listCategories({ onlyFilter: true }));
  return ok(res, catalogService.listCategories());
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = catalogService.getBySlug(req.params.slug);
  if (!category) throw ApiError.notFound(`分区 ${req.params.slug} 不存在`);
  const { sort = 'hot', page = 1, pageSize } = req.query;
  const feed = feedService.getFeed({ categorySlug: req.params.slug, sort, page, pageSize });
  ok(res, {
    category,
    ...feed,
    ranking: videoRepository.findRanking(category.id, 10).map((row, i) => ({
      ...toVideoList([row])[0],
      rank: i + 1,
    })),
    pgc: pgcRepository.findByCategory(category.id, 12).map(toPgcDTO),
  });
});

export default { listCategories, getCategory };
