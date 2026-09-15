// 服务层：业务逻辑（查询、筛选、分页、搜索建议、关联推荐）
import { videos, CATEGORIES, SEARCH_HOT } from '../data/videos.js';

// 内存可变状态（点赞数）
const state = new Map(videos.map((v) => [v.id, { likes: v.likes }]));

export function listVideos({ category = '首页', keyword = '', page = 1, pageSize = 20, sort = 'recommend' } = {}) {
  let list = [...videos];
  if (category && category !== '首页') list = list.filter((v) => v.category === category);
  if (keyword) {
    const kw = keyword.toLowerCase();
    list = list.filter(
      (v) =>
        v.title.toLowerCase().includes(kw) ||
        v.up.name.toLowerCase().includes(kw) ||
        v.tags.some((t) => t.toLowerCase().includes(kw))
    );
  }
  if (sort === 'views') list.sort((a, b) => b.views - a.views);
  else if (sort === 'newest') list.sort((a, b) => new Date(b.publishAt) - new Date(a.publishAt));
  // 推荐位：稳定伪随机打散
  else list.sort((a, b) => (hash(a.id) % 97) - (hash(b.id) % 97));

  const total = list.length;
  const start = (page - 1) * pageSize;
  return {
    list: list.slice(start, start + pageSize).map(withState),
    total,
    page,
    pageSize,
    hasMore: start + pageSize < total
  };
}

export function getVideo(id) {
  const v = videos.find((x) => x.id === id);
  return v ? withState(v) : null;
}

export function getRelated(id, limit = 8) {
  const v = videos.find((x) => x.id === id);
  if (!v) return [];
  const score = (x) => (x.category === v.category ? 2 : 0) + x.tags.filter((t) => v.tags.includes(t)).length;
  return videos
    .filter((x) => x.id !== id)
    .map((x) => ({ x, s: score(x) }))
    .sort((a, b) => b.s - a.s || hash(a.x.id) - hash(b.x.id))
    .slice(0, limit)
    .map((e) => withState(e.x));
}

export function searchSuggestions(keyword = '') {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return SEARCH_HOT.slice(0, 8);
  const pool = new Set();
  for (const v of videos) {
    if (v.title.toLowerCase().includes(kw)) pool.add(v.title.slice(0, 30));
    for (const t of v.tags) if (t.toLowerCase().includes(kw)) pool.add(t);
    if (v.up.name.toLowerCase().includes(kw)) pool.add(v.up.name);
  }
  for (const c of CATEGORIES) if (c.includes(kw)) pool.add(c);
  return [...pool].slice(0, 8);
}

export function likeVideo(id) {
  const s = state.get(id);
  if (!s) return null;
  s.likes += 1;
  return withState(videos.find((v) => v.id === id));
}

export function getCategories() {
  return CATEGORIES;
}

function withState(v) {
  return { ...v, likes: state.get(v.id)?.likes ?? v.likes };
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}
