// 仓储层：对种子数据的查询封装
import { videos, byId, byBvid, categories, hotwords } from '../db.js';

/** 分页取信息流；cat=tuijian 或缺省表示推荐（全量）；page/size 做边界归一 */
export function listFeed({ cat = 'tuijian', page = 1, size = 24 } = {}) {
  const p = Math.max(1, Math.floor(Number(page)) || 1);
  const s = Math.min(100, Math.max(1, Math.floor(Number(size)) || 24));
  const source = !cat || cat === 'tuijian' ? videos : videos.filter((v) => v.cat === cat);
  const start = (p - 1) * s;
  const list = source.slice(start, start + s);
  return { list, total: source.length, page: p, size: s, hasMore: start + s < source.length };
}

export function getVideo(idOrBvid) {
  const n = Number(idOrBvid);
  return (Number.isInteger(n) ? byId.get(n) : null) || byBvid.get(String(idOrBvid)) || null;
}

/** 相关推荐：同分区优先（按 id 做确定性伪随机打散），不足用全站高播放补 */
export function relatedVideos(video, n = 16) {
  const seed = video.id;
  const score = (v) => (v.id * 2654435761 + seed * 40503) % 9973;
  const same = videos.filter((v) => v.cat === video.cat && v.id !== video.id).sort((a, b) => score(a) - score(b));
  const others = videos.filter((v) => v.cat !== video.cat && v.id !== video.id).sort((a, b) => b.stat.view - a.stat.view);
  return [...same, ...others.slice(0, 8)].slice(0, n);
}

export function searchVideos(q) {
  const s = String(q || '').trim().toLowerCase();
  if (!s) return [];
  return videos.filter(
    (v) =>
      v.title.toLowerCase().includes(s) ||
      v.owner.name.toLowerCase().includes(s) ||
      v.tname.toLowerCase().includes(s) ||
      v.cat === s
  );
}

/** 本地兜底搜索建议：标题前缀/包含匹配 + 热词 */
export function localSuggestions(q, n = 10) {
  const kw = String(q || '').trim().toLowerCase();
  if (!kw) return hotwords.slice(0, n).map((w) => ({ text: w, kind: 'hot' }));
  const titles = videos
    .filter((v) => v.title.toLowerCase().includes(kw))
    .slice(0, n)
    .map((v) => ({ text: v.title, kind: 'title', id: v.id, bvid: v.bvid }));
  const extra = hotwords.filter((w) => w.toLowerCase().includes(kw) && !titles.some((t) => t.text === w));
  return [...titles, ...extra.slice(0, 3).map((w) => ({ text: w, kind: 'hot' }))].slice(0, n);
}

export function listCategories() {
  return categories;
}
