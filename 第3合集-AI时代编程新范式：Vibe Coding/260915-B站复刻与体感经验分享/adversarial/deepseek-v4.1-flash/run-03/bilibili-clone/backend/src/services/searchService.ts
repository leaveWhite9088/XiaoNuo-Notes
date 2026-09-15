import { metaRepository } from '../repositories/metaRepository.js';
import { videoRepository } from '../repositories/videoRepository.js';
import { toVideoCardDto } from './mappers.js';

export interface Suggestion {
  type: 'video' | 'up' | 'keyword';
  text: string;
  bvid?: string;
  mid?: number;
  cover?: string;
  playText?: string;
}

/**
 * 业务层：搜索建议与搜索结果。
 * 所有 SQL 都收敛在 repository 层，本层只做业务编排与 DTO 组装。
 */
export const searchService = {
  /**
   * 搜索建议：视频标题命中 + UP主命中 + 热搜关键词命中。
   * 输入为空时返回热搜榜（用于「聚焦即展开下拉」的场景）。
   */
  suggest(keyword: string, limit = 10) {
    const kw = keyword.trim();
    const hot = metaRepository.hotSearches(10);
    if (!kw) {
      return {
        keyword: '',
        mode: 'hot' as const,
        hotSearch: hot,
        suggestions: [] as Suggestion[],
      };
    }

    const suggestions: Suggestion[] = [];

    for (const row of videoRepository.suggestByTitle(kw, limit)) {
      if (suggestions.length >= limit) break;
      suggestions.push({
        type: 'video',
        text: row.title,
        bvid: row.bvid,
        cover: row.cover,
        playText: row.ownerName ?? '',
      });
    }

    for (const owner of metaRepository.ownerByName(kw, 3)) {
      if (suggestions.length >= limit) break;
      suggestions.push({ type: 'up', text: owner.name, mid: owner.mid });
    }

    for (const h of hot.filter((item) => item.includes(kw) || kw.includes(item))) {
      if (suggestions.length >= limit) break;
      suggestions.push({ type: 'keyword', text: h });
    }

    return { keyword: kw, mode: 'suggest' as const, hotSearch: hot, suggestions };
  },

  search(params: {
    keyword: string;
    page?: number;
    pageSize?: number;
    sort?: 'default' | 'play' | 'newest' | 'danmaku';
  }) {
    const keyword = params.keyword.trim();
    if (!keyword) {
      return { keyword, list: [], total: 0, page: 1, pageSize: 24, hasMore: false };
    }
    const paged = videoRepository.findFeed({
      keyword,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 24,
      sort: params.sort ?? 'default',
    });
    return { keyword, ...paged, list: paged.list.map(toVideoCardDto) };
  },

  hot() {
    return metaRepository.hotSearches(10);
  },
};
