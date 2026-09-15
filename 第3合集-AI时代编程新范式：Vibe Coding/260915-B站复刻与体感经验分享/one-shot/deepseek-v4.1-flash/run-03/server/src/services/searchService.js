import videoRepository from '../repositories/videoRepository.js';
import searchRepository from '../repositories/searchRepository.js';
import categoryRepository from '../repositories/categoryRepository.js';
import { toVideoList } from './mappers.js';
import config from '../config/index.js';

/**
 * 搜索服务：搜索建议（联想）+ 结果检索 + 热搜。
 */

export function suggest(keyword = '', limit = 10) {
  const kw = keyword.trim();
  if (!kw) {
    return searchRepository.findHotSearches(limit).map((r) => ({
      keyword: r.keyword,
      tag: r.tag,
      source: 'hot',
      heat: r.heat,
    }));
  }

  const rows = searchRepository.suggestByKeyword(kw, limit);
  const seen = new Set();
  const list = [];
  for (const row of rows) {
    if (seen.has(row.keyword) || !row.keyword) continue;
    seen.add(row.keyword);
    list.push({
      keyword: row.keyword,
      tag: row.tag,
      source: row.source,
      heat: row.heat,
    });
  }

  // 兜底：不足时用热搜前缀补全
  if (list.length < 4) {
    for (const hot of searchRepository.findHotSearches(10)) {
      if (list.length >= limit) break;
      if (seen.has(hot.keyword)) continue;
      if (kw && !hot.keyword.includes(kw)) continue;
      seen.add(hot.keyword);
      list.push({ keyword: hot.keyword, tag: hot.tag, source: 'hot', heat: hot.heat });
    }
  }
  return list;
}

export function search({ keyword = '', page = 1, pageSize = config.feed.pageSize, categorySlug } = {}) {
  const kw = keyword.trim();
  const size = Math.min(Number(pageSize) || 20, config.feed.maxPageSize);
  if (!kw) {
    return { keyword: kw, list: [], total: 0, page: 1, pageSize: size, hasMore: false };
  }
  searchRepository.logSearch(kw);

  const category = categorySlug && categorySlug !== 'all'
    ? categoryRepository.findBySlug(categorySlug)
    : null;

  const { list, total } = videoRepository.search({
    keyword: kw,
    page: Number(page) || 1,
    pageSize: size,
    categoryId: category?.id ?? null,
  });

  return {
    keyword: kw,
    list: toVideoList(list),
    total,
    page: Number(page) || 1,
    pageSize: size,
    hasMore: (Number(page) || 1) * size < total,
  };
}

export function hotSearches(limit = 10) {
  return searchRepository.findHotSearches(limit).map((r) => ({
    keyword: r.keyword,
    tag: r.tag,
    heat: r.heat,
  }));
}

export function history(limit = 8) {
  return searchRepository.recentSearches(limit).map((r) => r.keyword);
}

export function clearHistory() {
  searchRepository.clearSearchLogs();
  return { ok: true };
}

export default { suggest, search, hotSearches, history, clearHistory };
