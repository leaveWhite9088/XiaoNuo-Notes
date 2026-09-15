import { db } from '../repositories/db.js';
import { searchVideos } from './videoService.js';

// 搜索建议：标题 / UP 主 / 标签 / 分区名 模糊匹配，按类型加权去重
export function suggest(keyword, limit = 8) {
  const q = String(keyword || '').trim().toLowerCase();
  if (!q) return [];
  const seen = new Set();
  const out = [];

  const push = (text, type, score) => {
    const key = type + ':' + text;
    if (!text || seen.has(key)) return;
    seen.add(key);
    out.push({ text, type, score });
  };

  for (const v of db.videos) {
    if (v.title.toLowerCase().includes(q)) push(v.title, '视频', 30);
    if (v.owner.name.toLowerCase().includes(q)) push(v.owner.name, '用户', 20);
    for (const t of v.tags) {
      if (t.toLowerCase().includes(q)) push(t, '标签', 15);
    }
    const cat = db.categories.find((c) => c.key === v.region);
    if (cat && cat.name.toLowerCase().includes(q)) push(cat.name, '分区', 10);
  }

  return out.sort((a, b) => b.score - a.score).slice(0, Math.min(10, Number(limit) || 8));
}

export function hotSearch() {
  return db.hotSearch;
}
