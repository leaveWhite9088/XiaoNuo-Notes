import { SEARCH_PAGE_SIZE } from '../config.js';
import { catalogRepo } from '../repositories/catalogRepo.js';
import { searchRepo, type SearchOrder } from '../repositories/searchRepo.js';
import type { Paged, SearchSuggestion, VideoCard } from '../types.js';

const ORDERS: SearchOrder[] = ['default', 'view', 'pubdate', 'danmaku'];

export const searchService = {
  /** 搜索框下拉：热搜词 + UP 主 + 标签 + 标题，按 B 站的联想顺序合并去重 */
  suggest(keyword: string, limit = 10): SearchSuggestion[] {
    const q = keyword.trim();
    if (!q) return [];

    const out: SearchSuggestion[] = [];
    const seen = new Set<string>();
    const push = (s: SearchSuggestion) => {
      const key = `${s.type}:${s.keyword}`;
      if (seen.has(key) || out.length >= limit) return;
      seen.add(key);
      out.push(s);
    };

    for (const h of searchRepo.hotKeywordMatches(q, 3)) {
      push({ keyword: h.showName || h.keyword, type: 'hot', extra: '热搜' });
    }
    for (const u of searchRepo.ownerMatches(q, 3)) {
      push({
        keyword: u.name,
        type: 'up',
        extra: `${formatCount(u.fans)}粉丝 · ${u.videos} 个视频`,
        cover: u.face,
      });
    }
    for (const t of searchRepo.tagMatches(q, 3)) {
      push({ keyword: t.tag, type: 'tag', extra: `${t.count} 个相关视频` });
    }
    for (const v of searchRepo.titleMatches(q, limit)) {
      push({ keyword: v.title, type: 'video', extra: `${formatCount(v.view)}播放`, cover: v.cover });
    }
    return out;
  },

  search(params: { keyword: string; order?: string; page?: number; pageSize?: number }): Paged<VideoCard> & {
    keyword: string;
  } {
    const keyword = (params.keyword ?? '').trim();
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(60, Math.max(1, Number(params.pageSize) || SEARCH_PAGE_SIZE));
    const order = (ORDERS.includes(params.order as SearchOrder) ? params.order : 'default') as SearchOrder;

    if (!keyword) {
      return { keyword, items: [], page, pageSize, total: 0, hasMore: false };
    }
    searchRepo.rememberKeyword(keyword);
    const { items, total } = searchRepo.search(keyword, order, page, pageSize);
    return { keyword, items, page, pageSize, total, hasMore: page * pageSize < total };
  },

  hotSearches() {
    return catalogRepo.hotSearches();
  },

  history(limit = 8) {
    return searchRepo.recentKeywords(limit);
  },

  clearHistory() {
    searchRepo.clearHistory();
  },
};

function formatCount(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}亿`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}万`;
  return String(n);
}
