#!/usr/bin/env node
/**
 * 种子脚本：从 B 站公开接口拉取真实数据（热门/推荐/排行榜/详情/标签/热搜词），
 * 下载真实封面、UP 主头像、logo 与示例视频到 server/public，写出 server/data/*.json 数据层。
 * 运行：npm run seed （需网络；失败项有本地兜底）
 */
import { mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUB = path.join(ROOT, "server", "public");
const DATA = path.join(ROOT, "server", "data");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const HEADERS = { "User-Agent": UA, Referer: "https://www.bilibili.com/" };
const MAX_VIDEOS = 64;

async function getJSON(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(15000) });
      const j = await res.json();
      if (j && j.code === 0) return j.data;
      if (j && j.code === -352) { await sleep(800); continue; }
      return null;
    } catch { await sleep(400 * (i + 1)); }
  }
  return null;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function download(url, file, minBytes = 1024) {
  try { const s = await stat(file); if (s.size >= minBytes) return true; } catch {}
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { ...HEADERS, Referer: "https://www.bilibili.com/" } });
      if (!res.ok) throw new Error(String(res.status));
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < minBytes) throw new Error("too small");
      await writeFile(file, buf);
      return true;
    } catch { await sleep(300 * (i + 1)); }
  }
  console.warn("  ! 下载失败:", url);
  return false;
}

// 并发限流的 map
async function mapLimit(items, limit, fn) {
  const out = [];
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx], idx); }
  });
  await Promise.all(workers);
  return out;
}

const fmtPic = (p) => (p || "").replace(/^http:/, "https:");

async function main() {
  await mkdir(path.join(PUB, "covers"), { recursive: true });
  await mkdir(path.join(PUB, "faces"), { recursive: true });
  await mkdir(path.join(PUB, "videos"), { recursive: true });
  await mkdir(DATA, { recursive: true });

  console.log("[1/6] 拉取 B 站真实列表数据 ...");
  const pools = [];
  for (const pn of [1, 2, 3]) {
    const d = await getJSON(`https://api.bilibili.com/x/web-interface/popular?ps=30&pn=${pn}`);
    if (d?.list) pools.push(...d.list);
  }
  const rcmd = await getJSON("https://api.bilibili.com/x/web-interface/index/top/rcmd?ps=30&fnos=656&version=1");
  if (rcmd?.item) for (const it of rcmd.item)
    pools.push({ bvid: it.bvid, aid: it.id, title: it.title, pic: it.pic, tag: it.tname ? undefined : undefined, stat: { view: 0 } });
  const rank = await getJSON("https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=all");
  if (rank?.list) pools.push(...rank.list);

  // tid -> tname 名称表（从带 tname 的条目收集）
  const tidName = new Map();
  for (const it of pools) if (it.tid && it.tname) tidName.set(Number(it.tid), it.tname);

  const seen = new Set();
  const picked = [];
  // 按分类均衡抽取：轮转池子，每 tid 先取若干
  const byTid = new Map();
  for (const it of pools) {
    if (!it.bvid || seen.has(it.bvid)) continue;
    const tid = Number(it.tid ?? 0);
    if (!byTid.has(tid)) byTid.set(tid, []);
    byTid.get(tid).push(it);
  }
  let round = 0;
  while (picked.length < MAX_VIDEOS && round < 30) {
    for (const [, arr] of byTid) {
      const it = arr[round];
      if (it && !seen.has(it.bvid)) { seen.add(it.bvid); picked.push(it); }
      if (picked.length >= MAX_VIDEOS) break;
    }
    round++;
  }
  console.log(`  得到 ${picked.length} 条候选（分类 ${byTid.size} 个）`);

  console.log("[2/6] 拉取详情与标签（view + tags）...");
  const enriched = await mapLimit(picked, 8, async (it) => {
    const v = await getJSON(`https://api.bilibili.com/x/web-interface/view?bvid=${it.bvid}`);
    await sleep(60);
    const t = await getJSON(`https://api.bilibili.com/x/tag/archive/tags?bvid=${it.bvid}`);
    if (!v) return null;
    return {
      id: v.bvid, aid: v.aid, title: v.title ?? it.title,
      pic: fmtPic(v.pic || it.pic),
      tid: Number(v.tid || it.tid || 0),
      tname: v.tname || it.tname || tidName.get(Number(v.tid || it.tid || 0)) || "综合",
      duration: v.duration ?? 0, pubdate: v.pubdate ?? 0,
      desc: (v.desc || "").slice(0, 300),
      owner: { mid: v.owner?.mid ?? 0, name: v.owner?.name ?? "哔哩哔哩", face: fmtPic(v.owner?.face) },
      stats: {
        view: v.stat?.view ?? 0, danmaku: v.stat?.danmaku ?? 0, reply: v.stat?.reply ?? 0,
        favorite: v.stat?.favorite ?? 0, coin: v.stat?.coin ?? 0, share: v.stat?.share ?? 0,
        like: v.stat?.like ?? 0,
      },
      tags: (Array.isArray(t) ? t : []).slice(0, 6).map((x) => x.tag_name),
    };
  });
  const videos = enriched.filter(Boolean);
  console.log(`  成功 ${videos.length}/${picked.length}`);

  console.log("[3/6] 拉取 B 站热搜关键词 ...");
  const sq = await getJSON("https://api.bilibili.com/x/web-interface/search/square?limit=10");
  const hot = (sq?.trending?.list ?? []).map((x) => x.show_name || x.keyword).filter(Boolean).slice(0, 10);
  if (!hot.length) hot.push("毕业答辩", "AI", "猫片", "LPL", "做菜", "星穹铁道", "健身", "旅行", "高数", "原神");

  console.log("[4/6] 下载真实视频源（3 个公共 CC 片段）...");
  const clips = [
    ["https://media.w3.org/2010/05/sintel/trailer.mp4", "v1.mp4"],
    ["https://mdn.github.io/shared-assets/videos/flower.mp4", "v2.mp4"],
    ["https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4", "v3.mp4"],
  ];
  for (const [u, f] of clips) {
    const ok = await download(u, path.join(PUB, "videos", f), 100 * 1024);
    if (!ok) console.warn("  视频缺失:", f);
  }

  console.log("[5/6] 下载真实图片（logo / 封面 / 头像）...");
  const logoOk = await download("https://i0.hdslb.com/bfs/static/jinkela/long/images/512.png", path.join(PUB, "logo.png"));
  if (!logoOk) await download("https://static.hdslb.com/images/member/noface.gif", path.join(PUB, "logo.png"), 100);

  let coverOk = 0;
  await mapLimit(videos, 8, async (v) => {
    const ok = await download(v.pic, path.join(PUB, "covers", `${v.id}.jpg`));
    if (ok) coverOk++; else v.coverFallback = v.pic;
  });
  const faces = [...new Map(videos.map((v) => [String(v.owner.mid), v.owner])).values()];
  let faceOk = 0;
  await mapLimit(faces, 8, async (o) => {
    if (!o.face || !o.mid) return;
    if (await download(o.face, path.join(PUB, "faces", `${o.mid}.jpg`))) faceOk++;
  });
  console.log(`  封面 ${coverOk}/${videos.length}，头像 ${faceOk}/${faces.length}`);

  console.log("[6/6] 写出数据层 JSON ...");
  const out = videos.map((v, i) => ({
    id: v.id, aid: v.aid, title: v.title,
    cover: v.coverFallback || `/media/covers/${v.id}.jpg`,
    author: { mid: v.owner.mid, name: v.owner.name, face: v.owner.face ? `/media/faces/${v.owner.mid}.jpg` : "/media/logo.png" },
    tid: v.tid, tname: v.tname, duration: v.duration, pubdate: v.pubdate, desc: v.desc,
    stats: v.stats, tags: v.tags,
    src: `/media/videos/${["v1.mp4", "v2.mp4", "v3.mp4"][i % 3]}`,
  }));
  await writeFile(path.join(DATA, "videos.json"), JSON.stringify(out, null, 0));
  await writeFile(path.join(DATA, "hotword.json"), JSON.stringify({ title: sq?.trending?.title || "bilibili热搜", list: hot }));
  console.log(`完成：${out.length} 条视频写入 server/data/videos.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
