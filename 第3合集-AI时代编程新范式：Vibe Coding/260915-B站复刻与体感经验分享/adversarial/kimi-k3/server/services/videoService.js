// 视频查询/筛选/排序逻辑
const { videos } = require('../data/videos');

const HOT_LIMIT_DAYS = null; // 热门 = 全部按播放量排序

function toListItem(v) {
  return {
    id: v.id,
    title: v.title,
    upName: v.upName,
    upAvatar: v.upAvatar,
    cover: v.cover,
    playCount: v.playCount,
    danmakuCount: v.danmakuCount,
    duration: v.duration,
    category: v.category,
    pubDate: v.pubDate,
    tags: v.tags,
  };
}

/**
 * 分类 + 分页查询
 * category: '推荐' | '热门' | 具体分类名
 */
function queryVideos({ category, page = 1, pageSize = 10 }) {
  let list = videos.slice();

  if (category && category !== '推荐' && category !== '热门') {
    list = list.filter((v) => v.category === category);
  }
  if (category === '热门') {
    list.sort((a, b) => b.playCount - a.playCount);
  }

  const total = list.length;
  const start = (page - 1) * pageSize;
  const items = list.slice(start, start + pageSize).map(toListItem);

  return {
    total,
    page,
    pageSize,
    hasMore: start + pageSize < total,
    items,
  };
}

function getVideoById(id) {
  return videos.find((v) => v.id === id) || null;
}

/**
 * 相关推荐：同分类优先，其余按播放量补足
 */
function getRelated(id, limit = 10) {
  const current = getVideoById(id);
  if (!current) return [];
  const same = videos.filter((v) => v.id !== id && v.category === current.category);
  const others = videos
    .filter((v) => v.id !== id && v.category !== current.category)
    .sort((a, b) => b.playCount - a.playCount);
  return same.concat(others).slice(0, limit).map(toListItem);
}

/**
 * 关键词搜索：标题 / UP主 / 标签 / 简介
 */
function searchVideos(keyword) {
  if (!keyword) return [];
  const kw = String(keyword).toLowerCase();
  return videos
    .filter(
      (v) =>
        v.title.toLowerCase().includes(kw) ||
        v.upName.toLowerCase().includes(kw) ||
        v.category.toLowerCase().includes(kw) ||
        (v.tags || []).some((t) => t.toLowerCase().includes(kw)) ||
        (v.desc || '').toLowerCase().includes(kw)
    )
    .sort((a, b) => b.playCount - a.playCount)
    .map(toListItem);
}

/**
 * 搜索建议：匹配标题与标签，最多 8 条
 */
function suggest(keyword, limit = 8) {
  if (!keyword) return [];
  const kw = String(keyword).toLowerCase();
  const hits = new Set();
  for (const v of videos) {
    if (v.title.toLowerCase().includes(kw)) hits.add(v.title);
    for (const t of v.tags || []) {
      if (t.toLowerCase().includes(kw)) hits.add(t);
    }
    if (v.upName.toLowerCase().includes(kw)) hits.add(v.upName);
    if (hits.size >= limit) break;
  }
  return Array.from(hits).slice(0, limit);
}

module.exports = { queryVideos, getVideoById, getRelated, searchVideos, suggest };
