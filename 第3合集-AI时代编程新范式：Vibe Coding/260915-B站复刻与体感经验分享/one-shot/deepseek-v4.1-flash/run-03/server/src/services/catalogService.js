import categoryRepository from '../repositories/categoryRepository.js';
import { toCategoryDTO } from './mappers.js';

/**
 * 分区服务：为顶部导航 / 首页筛选条提供带统计的分区数据。
 */

export function listCategories({ onlyNav = false, onlyFilter = false } = {}) {
  const rows = onlyNav
    ? categoryRepository.findNav()
    : onlyFilter
      ? categoryRepository.findFilters()
      : categoryRepository.findAll();
  const counts = categoryRepository.countByCategory();
  return rows.map((row) => ({
    ...toCategoryDTO(row),
    videoCount: counts[row.slug] ?? 0,
  }));
}

export function getBySlug(slug) {
  return toCategoryDTO(categoryRepository.findBySlug(slug));
}

export function getById(id) {
  return toCategoryDTO(categoryRepository.findById(id));
}

/** 首页筛选条：[全部] + 有足够内容的分区（避免出现空分区） */
export function feedFilters(minVideos = 5) {
  const counts = categoryRepository.countByCategory();
  const totalVideos = Object.values(counts).reduce((a, b) => a + b, 0);
  const all = {
    id: 0,
    slug: 'all',
    name: '全部',
    icon: 'all',
    accent: '#00AEEC',
    videoCount: totalVideos,
  };
  return [
    all,
    ...listCategories({ onlyFilter: true }).filter((c) => c.videoCount >= minVideos),
  ];
}

export default { listCategories, getBySlug, getById, feedFilters };
