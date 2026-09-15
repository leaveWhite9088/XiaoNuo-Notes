import videoRepository from '../repositories/videoRepository.js';
import bannerRepository from '../repositories/bannerRepository.js';
import searchRepository from '../repositories/searchRepository.js';
import categoryRepository from '../repositories/categoryRepository.js';
import commentRepository from '../repositories/commentRepository.js';
import config from '../config/index.js';
import catalogService from './catalogService.js';
import { toVideoList, toBannerDTO, toCategoryDTO, toCommentDTO } from './mappers.js';

/**
 * 首页聚合服务：一次请求返回首屏需要的所有区块（信息流 / 轮播 / 排行 / 热搜）。
 */

export function getBanners() {
  return bannerRepository.findAll().map(toBannerDTO);
}

function resolveCategoryId({ categorySlug, categoryId }) {
  if (categoryId) return Number(categoryId);
  if (categorySlug && categorySlug !== 'all') {
    const cat = categoryRepository.findBySlug(categorySlug);
    return cat?.id ?? null;
  }
  return null;
}

export function getFeed({ categorySlug, categoryId, sort = 'hot', page = 1, pageSize } = {}) {
  const size = Math.min(Number(pageSize) || config.feed.pageSize, config.feed.maxPageSize);
  const catId = resolveCategoryId({ categorySlug, categoryId });
  const rows = videoRepository.findFeed({ categoryId: catId, sort, page: Number(page) || 1, pageSize: size });
  const total = videoRepository.countFeed({ categoryId: catId });
  return {
    list: toVideoList(rows),
    total,
    page: Number(page) || 1,
    pageSize: size,
    hasMore: (Number(page) || 1) * size < total,
    categoryId: catId,
  };
}

/** 首页整页聚合 */
export function getHome() {
  const feed = getFeed({ sort: 'hot', page: 1, pageSize: 20 });
  const banners = getBanners();
  const categories = catalogService.feedFilters().filter((c) => c.slug !== 'all');
  const navCategories = categoryRepository.findNav().map(toCategoryDTO);

  const hotSearches = searchRepository.findHotSearches(10).map((r) => ({
    keyword: r.keyword,
    tag: r.tag,
    heat: r.heat,
  }));

  // 侧栏排行：优先选真正有排行数据的分区
  // （番剧/国创等版权分区由 PGC 承载，没有 UGC 排行，需要跳过）
  let rankCategory = null;
  let ranking = [];
  for (const cat of [...navCategories, ...categories]) {
    const rows = videoRepository.findRanking(cat.id, 6);
    if (rows.length) {
      rankCategory = cat;
      ranking = rows.map((row, i) => ({ ...toVideoList([row])[0], rank: i + 1 }));
      break;
    }
  }

  const trending = videoRepository.findTrending(6).map((row, i) => ({
    ...toVideoList([row])[0],
    rank: i + 1,
  }));

  const hotComments = commentRepository.findHottest(4).map((row) => ({
    ...toCommentDTO(row),
    videoTitle: row.video_title,
    videoCover: row.video_cover,
  }));

  return {
    banners,
    categories,
    navCategories,
    hotSearches,
    feed,
    ranking,
    rankCategory,
    trending,
    hotComments,
  };
}

/** 加载更多（滚动分页） */
export function loadMore({ categorySlug, sort = 'hot', page = 2, pageSize = 20 } = {}) {
  return getFeed({ categorySlug, sort, page, pageSize });
}

/** 分区筛选项：每个分区下的标签聚合，用于筛选面板 */
export function getFilterOptions() {
  return {
    categories: categoryRepository.findFilters().map(toCategoryDTO),
    sorts: [
      { key: 'hot', label: '综合排序' },
      { key: 'play', label: '最多播放' },
      { key: 'new', label: '最新发布' },
      { key: 'danmaku', label: '最多弹幕' },
    ],
    durations: [
      { key: 'all', label: '全部时长' },
      { key: 'short', label: '1分钟以下' },
      { key: 'mid', label: '1-10分钟' },
      { key: 'long', label: '10分钟以上' },
    ],
  };
}

export default { getHome, getFeed, loadMore, getBanners, getFilterOptions };
