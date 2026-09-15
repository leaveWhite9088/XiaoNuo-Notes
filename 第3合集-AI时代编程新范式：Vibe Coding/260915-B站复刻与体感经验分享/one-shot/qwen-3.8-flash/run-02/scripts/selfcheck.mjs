#!/usr/bin/env node
/**
 * 主链路自检：启动后端(5141) + 前端(3141)，逐项验证
 * 健康检查 → 分类筛选 → 视频流分页/搜索 → 建议 → 详情 → 相关推荐 → 真实图片/视频 → 前端代理链路。
 * 运行：npm run selfcheck （全部通过输出 PASS 并退出码 0）
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BACK = "http://localhost:5141";
const FRONT = "http://localhost:3141";
const results = [];
let server, web;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitUp(base, tries = 120) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(base + "/api/health", { signal: AbortSignal.timeout(1500) }); if (r.ok) return true; } catch {}
    await sleep(500);
  }
  return false;
}
async function waitFront(tries = 120) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(FRONT + "/", { signal: AbortSignal.timeout(1500) }); if (r.ok) return true; } catch {}
    await sleep(500);
  }
  return false;
}
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✅" : "❌"} ${name}${detail ? "  — " + detail : ""}`);
}
const jget = async (u) => (await fetch(u)).json();

async function main() {
  console.log(":: 启动后端(5141)与前端(3141) ...");
  server = spawn("npm", ["run", "start", "-w", "server"], { cwd: ROOT, detached: true, stdio: "ignore" });
  web = spawn("npm", ["run", "dev", "-w", "web"], { cwd: ROOT, detached: true, stdio: "ignore" });

  const backUp = await waitUp(BACK);
  check("后端 5141 启动", backUp);
  if (!backUp) throw new Error("后端无法启动");
  const frontUp = await waitFront();
  check("前端 3141 启动", frontUp);

  const health = await jget(`${BACK}/api/health`);
  check("GET /api/health（数据层加载）", health.code === 0 && health.data.videos > 0, `videos=${health.data.videos}, categories=${health.data.categories}`);

  const cats = (await jget(`${BACK}/api/categories`)).data;
  check("GET /api/categories（真实分区）", Array.isArray(cats) && cats.length > 3, cats.slice(0, 4).map((c) => c.name).join(" / "));

  const feed = (await jget(`${BACK}/api/videos?page=1&pageSize=12`)).data;
  check("GET /api/videos 首页视频流", feed.list.length === 12 && !!feed.list[0].cover && !!feed.list[0].title, `total=${feed.total}, 首条=「${feed.list[0].title.slice(0, 18)}…」`);

  const one = cats.find((c) => c.count >= 2);
  const filtered = (await jget(`${BACK}/api/videos?tid=${one.tid}&pageSize=40`)).data;
  check(`GET /api/videos?tid=${one.tid}（分类筛选「${one.name}」）`, filtered.list.length > 0 && filtered.list.every((v) => v.tid === one.tid), `命中 ${filtered.list.length}/${filtered.total} 条且 tid 全部一致`);

  const kw = feed.list[0].title.slice(0, 4);
  const searched = (await jget(`${BACK}/api/videos?q=${encodeURIComponent(kw)}`)).data;
  check(`GET /api/videos?q=${kw}（搜索命中）`, searched.total >= 1, `命中 ${searched.total} 条`);

  const sug = (await jget(`${BACK}/api/search/suggest?q=${encodeURIComponent("手机")}`)).data;
  check("GET /api/search/suggest（搜索建议）", sug.list.length > 0, `来源=${sug.source}, 例: ${sug.list.slice(0, 3).join("、")}`);

  const hot = (await jget(`${BACK}/api/hot-search`)).data;
  check("GET /api/hot-search（真实热搜）", hot.list.length > 0, hot.list.slice(0, 2).join("、"));

  const vid = (await jget(`${BACK}/api/videos/${feed.list[0].id}`)).data;
  check(`GET /api/videos/${vid.id}（详情）`, !!vid.stats && vid.stats.view > 0 && !!vid.src, `播放量=${vid.stats.view}, tags=${vid.tags.length}`);

  const rel = (await jget(`${BACK}/api/videos/${vid.id}/related`)).data;
  check("GET /api/videos/:id/related（相关推荐）", rel.length > 0 && rel.every((r) => r.id !== vid.id), `${rel.length} 条`);

  const img = await fetch(`${BACK}${vid.cover}`, { signal: AbortSignal.timeout(10000) });
  const imgBuf = await img.arrayBuffer();
  check("真实封面图片可访问（/media）", img.status === 200 && imgBuf.byteLength > 10000, `${img.headers.get("content-type")}, ${(imgBuf.byteLength / 1024).toFixed(0)}KB`);

  const faceR = await fetch(`${BACK}${vid.author.face}`, { signal: AbortSignal.timeout(8000) });
  check("真实 UP 主头像可访问", faceR.status === 200);

  const range = await fetch(`${BACK}${vid.src}`, { headers: { Range: "bytes=0-65535" }, signal: AbortSignal.timeout(15000) });
  check("真实视频源支持 Range 播放（/media/*.mp4）", range.status === 206 && (range.headers.get("content-type") || "").includes("video"), `${range.headers.get("content-type")}`);

  const page = await fetch(`${FRONT}/`).then((r) => r.text());
  check("GET :3141/ 返回 SPA 首页", page.includes('id="root"') && page.includes("哔哩哔哩"));

  const proxied = await jget(`${FRONT}/api/videos?page=1&pageSize=4`);
  check("前端代理链路 :3141/api → :5141", proxied.code === 0 && proxied.data.list.length === 4, "vite proxy 正常");

  const proxiedImg = await fetch(`${FRONT}${feed.list[1].cover}`);
  check("前端代理链路 :3141/media → :5141（图片）", proxiedImg.status === 200);

  const deepLink = await fetch(`${FRONT}/video/${vid.id}`);
  check("详情页路由可用（/video/:id）", deepLink.status === 200);

  const mod = await fetch(`${FRONT}/src/main.tsx`).then((r) => r.text());
  check("Vite 运行时编译 React/TSX 模块", mod.includes("createRoot") && !mod.includes("Transform failed"));
}

main().catch((e) => { results.push({ name: "FATAL", ok: false, detail: String(e) }); console.error("❌ FATAL", e); })
  .finally(async () => {
    for (const p of [server, web]) { try { if (p?.pid) process.kill(-p.pid); } catch {} }
    await sleep(300);
    for (const p of [server, web]) { try { p?.kill("SIGKILL"); } catch {} }
    const pass = results.filter((r) => r.ok).length;
    const fail = results.length - pass;
    console.log(`\n===== 自检结果: ${pass} 通过 / ${fail} 失败 =====`);
    process.exit(fail ? 1 : 0);
  });
