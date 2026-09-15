/**
 * 搜索业务逻辑：下拉联想词、热搜榜、搜索结果分页。
 */
import * as videoRepo from '../repositories/videoRepository.js';
import { hotSearches } from '../data/content.js';
import { toCard } from './feedService.js';

/** 搜索框下拉联想：优先标题，其次 UP 主与标签，逐类去重 */
export function suggest(keyword, limit = 10) {
  const kw = keyword.trim();
  if (!kw) return [];
  const matched = videoRepo.searchVideos(kw);
  const seen = new Set();
  /** @type {{text: string, type: string, bvid: string}[]} */
  const titles = [];
  const others = [];

  for (const video of matched) {
    const title = normalize(video.title);
    if (title.includes(kw) && !seen.has(title)) {
      seen.add(title);
      titles.push({ text: title, type: 'video', bvid: video.bvid });
    }
    if (video.up.name.includes(kw) && !seen.has(video.up.name)) {
      seen.add(video.up.name);
      others.push({ text: video.up.name, type: 'user', bvid: video.bvid });
    }
    for (const tag of video.tags) {
      const text = tag.includes(kw) ? tag : `${kw} ${tag}`;
      if (!tag.includes(kw) && !video.channelName.includes(kw)) continue;
      if (seen.has(text)) continue;
      seen.add(text);
      others.push({ text, type: 'word', bvid: video.bvid });
    }
  }

  return [...titles, ...others].slice(0, limit);
}

export function getHotSearches() {
  return hotSearches.map((text, i) => ({ rank: i + 1, text, hot: 1200000 - i * 87000 }));
}

/**
 * @param {{keyword: string, page?: number, pageSize?: number, order?: string}} params
 */
export function search({ keyword, page = 1, pageSize = 20, order = 'totalrank' }) {
  const matched = videoRepo.searchVideos(keyword);
  const sorted = sortResults(matched, order);
  const start = (page - 1) * pageSize;
  return {
    keyword,
    order,
    page,
    pageSize,
    total: sorted.length,
    hasMore: start + pageSize < sorted.length,
    items: sorted.slice(start, start + pageSize).map(toCard),
  };
}

function sortResults(list, order) {
  const copy = [...list];
  switch (order) {
    case 'click':
      return copy.sort((a, b) => b.stats.view - a.stats.view);
    case 'pubdate':
      return copy.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
    case 'dm':
      return copy.sort((a, b) => b.stats.danmaku - a.stats.danmaku);
    default:
      return copy;
  }
}

function normalize(text) {
  return text.replace(/[【】]/g, ' ').replace(/\s+/g, ' ').trim();
}

function looseMatch(text, kw) {
  const hits = [...kw].filter((ch) => text.includes(ch)).length;
  return hits >= Math.ceil(kw.length * 0.6);
}
