/**
 * HTTP 路由层：薄封装，业务全部在数据层 store.ts。
 */
import { Router } from "express";
import * as store from "../data/store.js";

export const api = Router();

api.get("/health", (_req, res) => res.json({ code: 0, data: { ok: true, ...store.stats() } }));

api.get("/categories", (_req, res) => res.json({ code: 0, data: store.getCategories() }));

api.get("/videos", (req, res) => {
  const { tid, q, page, pageSize, shuffle } = req.query;
  res.json({
    code: 0,
    data: store.listVideos({
      tid: Number(tid ?? 0) || 0,
      q: String(q ?? ""),
      page: Number(page ?? 1) || 1,
      pageSize: Number(pageSize ?? 12) || 12,
      shuffle: shuffle === "1",
    }),
  });
});

api.get("/videos/:id", (req, res) => {
  const v = store.getVideo(req.params.id);
  if (!v) return res.status(404).json({ code: -404, message: "视频不存在" });
  res.json({ code: 0, data: v });
});

api.get("/videos/:id/related", (req, res) =>
  res.json({ code: 0, data: store.getRelated(req.params.id) }),
);

api.get("/hot-search", (_req, res) => res.json({ code: 0, data: store.getHotSearch() }));

/**
 * 搜索建议：先探 B 站线上 suggest 接口（1.2s 超时），失败用本地数据层建议兜底。
 */
api.get("/search/suggest", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  if (!q) return res.json({ code: 0, data: { source: "local", list: store.getHotSearch().list.slice(0, 10) } });
  try {
    const url = `https://s.search.bilibili.com/main/suggest?term=${encodeURIComponent(q)}&userid=0`;
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/126.0.0.0 Safari/537.36", Referer: "https://www.bilibili.com/" },
      signal: AbortSignal.timeout(1200),
    });
    const j = (await r.json()) as { result?: { tag?: { value: string }[] } };
    const list = (j?.result?.tag ?? []).map((t) => t.value).filter(Boolean).slice(0, 10);
    if (list.length) return res.json({ code: 0, data: { source: "live", list } });
  } catch { /* 离线/风控时走本地 */ }
  res.json({ code: 0, data: { source: "local", list: store.suggestLocal(q) } });
});
