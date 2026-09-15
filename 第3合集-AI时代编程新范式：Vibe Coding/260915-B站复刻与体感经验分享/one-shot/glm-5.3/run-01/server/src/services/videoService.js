import { db, findVideo } from '../repositories/db.js';

function paginate(list, page, pageSize) {
  const p = Math.max(1, Number(page) || 1);
  const size = Math.min(50, Math.max(1, Number(pageSize) || 20));
  const start = (p - 1) * size;
  return {
    list: list.slice(start, start + size),
    total: list.length,
    page: p,
    page_size: size,
    has_more: start + size < list.length,
  };
}

export function listFeed({ region = 'home', page = 1, pageSize = 20 } = {}) {
  if (region === 'home') {
    // 首页推荐流：保留数据文件里“各分区轮询交错”的预排顺序
    return paginate(db.videos, page, pageSize);
  }
  if (region === 'hot') {
    const byPlay = [...db.videos].sort((a, b) => b.stat.play - a.stat.play);
    return paginate(byPlay, page, pageSize);
  }
  const filtered = db.videos.filter((v) => v.region === region);
  return paginate(filtered, page, pageSize);
}

export function getVideo(id) {
  return findVideo(id);
}

export function getRelated(id, limit = 10) {
  const video = findVideo(id);
  if (!video) return [];
  const size = Math.min(30, Math.max(1, Number(limit) || 10));
  const sameRegion = db.videos.filter((v) => v.region === video.region && v.id !== id);
  const others = db.videos
    .filter((v) => v.region !== video.region && v.id !== id)
    .sort((a, b) => b.stat.play - a.stat.play);
  return [...sameRegion, ...others].slice(0, size);
}

function scoreMatch(video, q) {
  let score = 0;
  if (video.title.toLowerCase().includes(q)) score += 10;
  if (video.owner.name.toLowerCase().includes(q)) score += 6;
  if (video.tags.some((t) => t.toLowerCase().includes(q))) score += 4;
  if ((video.desc || '').toLowerCase().includes(q)) score += 2;
  return score;
}

export function searchVideos(q, page = 1, pageSize = 20) {
  const query = String(q || '').trim().toLowerCase();
  if (!query) return { list: [], total: 0, page: 1, page_size: pageSize, has_more: false };
  const matched = db.videos
    .map((v) => ({ v, score: scoreMatch(v, query) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.v.stat.play - a.v.stat.play)
    .map((x) => x.v);
  return paginate(matched, page, pageSize);
}
