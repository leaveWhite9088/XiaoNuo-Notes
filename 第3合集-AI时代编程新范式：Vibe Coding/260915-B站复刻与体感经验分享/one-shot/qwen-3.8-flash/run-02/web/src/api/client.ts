/** 前端 API 层：统一走 vite 代理的 /api（→ 后端 5141） */
export interface Summary {
  id: string; title: string; cover: string;
  author: { mid: number; name: string; face: string };
  tid: number; tname: string; duration: number; pubdate: number;
  stats: { view: number; danmaku: number };
}
export interface Video extends Summary {
  aid: number; desc: string; tags: string[]; src: string;
  stats: { view: number; danmaku: number; reply: number; favorite: number; coin: number; share: number; like: number };
}
export interface Category { tid: number; name: string; count: number }
export interface Feed { list: Summary[]; total: number; page: number; pageSize: number }

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  const json = await res.json();
  if (json.code !== 0) throw new Error(`${url} -> code ${json.code}`);
  return json.data as T;
}

export const fetchCategories = () => get<Category[]>("/api/categories");
export const fetchFeed = (p: { tid?: number; q?: string; page?: number; pageSize?: number; shuffle?: boolean }) => {
  const sp = new URLSearchParams();
  if (p.tid) sp.set("tid", String(p.tid));
  if (p.q) sp.set("q", p.q);
  sp.set("page", String(p.page ?? 1));
  sp.set("pageSize", String(p.pageSize ?? 12));
  if (p.shuffle) sp.set("shuffle", "1");
  return get<Feed>(`/api/videos?${sp}`);
};
export const fetchVideo = (id: string) => get<Video>(`/api/videos/${encodeURIComponent(id)}`);
export const fetchRelated = (id: string) => get<Summary[]>(`/api/videos/${encodeURIComponent(id)}/related`);
export const fetchSuggest = (q: string) =>
  get<{ source: string; list: string[] }>(`/api/search/suggest?q=${encodeURIComponent(q)}`);

/** 12.3万 / 1.2亿 数字缩写 */
export function fmtCount(n: number): string {
  if (n >= 1e8) return (n / 1e8).toFixed(1) + "亿";
  if (n >= 1e4) return (n / 1e4).toFixed(1) + "万";
  return String(n);
}
export function fmtDuration(sec: number): string {
  if (!sec || sec < 0) return "0:00";
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}
export function fmtDate(ts: number): string {
  if (!ts) return "";
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
