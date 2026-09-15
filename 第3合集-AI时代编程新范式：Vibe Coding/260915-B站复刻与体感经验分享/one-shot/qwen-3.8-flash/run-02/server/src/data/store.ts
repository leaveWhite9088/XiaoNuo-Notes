/**
 * 数据层：加载并查询 server/data/*.json 真实种子数据。
 * 只暴露纯查询函数，不依赖 Express，便于单独测试。
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface Video {
  id: string;
  aid: number;
  title: string;
  cover: string;
  author: { mid: number; name: string; face: string };
  tid: number;
  tname: string;
  duration: number;
  pubdate: number;
  desc: string;
  stats: { view: number; danmaku: number; reply: number; favorite: number; coin: number; share: number; like: number };
  tags: string[];
  src: string;
}

export interface Category {
  tid: number;
  name: string;
  count: number;
}

const DATA_DIR = path.resolve(fileURLToPath(import.meta.url), "..", "..", "..", "data");

function loadJson<T>(name: string): T {
  return JSON.parse(readFileSync(path.join(DATA_DIR, name), "utf-8")) as T;
}

let videos: Video[] | null = null;
let hotword: { title: string; list: string[] } | null = null;
let categories: Category[] | null = null;

function all(): Video[] {
  if (!videos) {
    videos = loadJson<Video[]>("videos.json");
    if (!videos.length) throw new Error("数据层为空：请先运行 npm run seed 生成 server/data/videos.json");
  }
  return videos;
}

/** 真实分类（按视频数量降序） */
export function getCategories(): Category[] {
  if (!categories) {
    const map = new Map<number, Category>();
    for (const v of all()) {
      const c = map.get(v.tid) ?? { tid: v.tid, name: v.tname || `分区${v.tid}`, count: 0 };
      c.count += 1;
      map.set(v.tid, c);
    }
    categories = [...map.values()].sort((a, b) => b.count - a.count || a.tid - b.tid);
  }
  return categories;
}

/**
 * 首页视频流：支持分类过滤 (tid)、关键词搜索 (q)、分页 (page/pageSize)、随机 (shuffle)。
 */
export function listVideos(opt: { tid?: number; q?: string; page?: number; pageSize?: number; shuffle?: boolean }) {
  const pageSize = Math.min(Math.max(opt.pageSize ?? 12, 1), 40);
  const page = Math.max(opt.page ?? 1, 1);
  const q = (opt.q ?? "").trim().toLowerCase();

  let list = all();
  if (opt.tid && opt.tid > 0) list = list.filter((v) => v.tid === opt.tid);
  if (q)
    list = list.filter(
      (v) => v.title.toLowerCase().includes(q) || v.tname.toLowerCase().includes(q) ||
        v.author.name.toLowerCase().includes(q) || v.tags.some((t) => t.toLowerCase().includes(q)),
    );
  if (opt.shuffle) list = [...list].sort(() => Math.random() - 0.5);

  const total = list.length;
  const start = (page - 1) * pageSize;
  const items = list.slice(start, start + pageSize).map(toSummary);
  return { list: items, total, page, pageSize };
}

/** 卡片摘要（详情接口返回全量，列表瘦身） */
function toSummary(v: Video) {
  return {
    id: v.id, title: v.title, cover: v.cover, author: v.author,
    tid: v.tid, tname: v.tname, duration: v.duration, stats: { view: v.stats.view, danmaku: v.stats.danmaku },
    pubdate: v.pubdate,
  };
}

export function getVideo(id: string): Video | null {
  return all().find((v) => v.id === id || String(v.aid) === id) ?? null;
}

/** 相关推荐：优先同分区，按播放量降序，剔除自身 */
export function getRelated(id: string, limit = 12) {
  const self = getVideo(id);
  if (!self) return [];
  const pool = all().filter((v) => v.id !== id);
  const same = pool.filter((v) => v.tid === self.tid).sort((a, b) => b.stats.view - a.stats.view);
  const rest = pool.filter((v) => v.tid !== self.tid).sort(() => Math.random() - 0.5);
  return [...same, ...rest].slice(0, limit).map(toSummary);
}

export function getHotSearch() {
  if (!hotword) hotword = loadJson<{ title: string; list: string[] }>("hotword.json");
  return hotword;
}

/** 本地搜索建议兜底：标题前缀/包含 + 标签 + 热搜词 */
export function suggestLocal(q: string, limit = 10): string[] {
  const t = q.trim().toLowerCase();
  const set = new Set<string>();
  const push = (s: string) => { if (s && !set.has(s) && (set.add(s), set.size < limit)) return; };
  if (t) {
    for (const v of all()) {
      if (v.title.toLowerCase().includes(t) && v.title !== q) push(v.title.length > 30 ? v.title.slice(0, 30) + "…" : v.title);
      for (const tag of v.tags) if (tag.toLowerCase().includes(t)) push(tag);
      if (set.size >= limit) break;
    }
  }
  for (const w of getHotSearch().list) if (!t || w.toLowerCase().includes(t)) push(w);
  if (!set.size && t) push(`搜索 "${q}"`);
  return [...set].slice(0, limit);
}

export const stats = () => ({ videos: all().length, categories: getCategories().length });
