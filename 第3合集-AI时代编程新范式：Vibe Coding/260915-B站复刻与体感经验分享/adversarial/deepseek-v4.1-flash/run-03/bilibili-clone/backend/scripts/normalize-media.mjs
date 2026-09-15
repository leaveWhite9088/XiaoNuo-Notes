/**
 * 媒体文件名归一化（修复大小写碰撞）。
 *
 * 背景：B 站存在仅大小写不同的两个 BV 号（如 BV1gGYX6DEhm / BV1gGYX6DEHm），
 * 旧命名 `covers/{bvid}.webp` 在 macOS/Windows 这类大小写不敏感的文件系统上会互相覆盖，
 * 部署到 Linux 又会变成 404。这里统一改为大小写无关唯一的名字：
 *
 *     covers/{bvid 小写}-{aid}.webp      // aid 为数字，天然区分同小写 bvid 的两条记录
 *
 * 同时回写 data/seed.json，并做严格校验：每条引用都能在磁盘上找到“大小写完全一致”的文件。
 *
 *   node scripts/normalize-media.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SEED = path.join(ROOT, 'data', 'seed.json');
const COVER_DIR = path.join(ROOT, 'public', 'media', 'covers');
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const targetName = (bvid, aid) => `${bvid.toLowerCase()}-${aid}.webp`;

async function download(url, dest) {
  const res = await fetch(url.replace(/^http:/, 'https:'), {
    headers: { 'User-Agent': UA, Referer: 'https://www.bilibili.com/' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 512) throw new Error(`文件过小 ${buf.length}`);
  fs.writeFileSync(dest, buf);
  return buf.length;
}

async function main() {
  const seed = JSON.parse(fs.readFileSync(SEED, 'utf8'));
  const existing = fs.readdirSync(COVER_DIR);
  /** 小写文件名 -> 真实文件名 */
  const byLower = new Map(existing.map((f) => [f.toLowerCase(), f]));

  let moved = 0;
  let downloaded = 0;
  const failures = [];

  for (const video of seed.videos) {
    const target = targetName(video.bvid, video.aid);
    const targetPath = path.join(COVER_DIR, target);
    const oldStem = video.cover.split('/').pop() ?? '';
    const currentFile = byLower.get(oldStem.toLowerCase());
    const currentPath = currentFile ? path.join(COVER_DIR, currentFile) : null;

    if (fs.existsSync(targetPath) && currentPath !== targetPath) {
      // 目标名已存在（上一次运行留下的），删掉旧的冗余文件
      if (currentPath && currentPath !== targetPath) fs.rmSync(currentPath, { force: true });
    } else if (currentPath && currentPath !== targetPath) {
      fs.renameSync(currentPath, targetPath);
      byLower.delete(currentFile.toLowerCase());
      moved++;
    } else if (!fs.existsSync(targetPath)) {
      // 碰撞对里被覆盖掉的那一个：从原始 CDN 重新下载
      try {
        await download(`${video.coverUrl}@440w_275h_1c.webp`, targetPath);
        downloaded++;
        console.log(`↓ 重新下载 ${video.bvid} -> ${target}`);
      } catch (err) {
        failures.push(`${video.bvid}: ${err.message}`);
      }
    }
    byLower.set(target.toLowerCase(), target);
    video.cover = `/media/covers/${target}`;
  }

  fs.writeFileSync(SEED, `${JSON.stringify(seed, null, 2)}\n`);

  // ---------- 严格校验 ----------
  const files = new Set(fs.readdirSync(COVER_DIR));
  const missing = seed.videos.filter((v) => !files.has(v.cover.split('/').pop()));
  const refs = seed.videos.map((v) => v.cover);
  const lowerMap = new Map();
  const collisions = [];
  for (const f of files) {
    const k = f.toLowerCase();
    if (lowerMap.has(k)) collisions.push([lowerMap.get(k), f]);
    lowerMap.set(k, f);
  }

  console.log(`\n重命名 ${moved} 个，重新下载 ${downloaded} 个，目录内文件 ${files.size} 个`);
  console.log(`引用 ${refs.length} 条 / 唯一 ${new Set(refs).size} 条 / 缺失 ${missing.length} 条`);
  console.log(`文件名大小写碰撞: ${collisions.length} 组`);
  if (failures.length) console.log('下载失败:', failures);
  if (missing.length || collisions.length || failures.length) process.exit(1);
  console.log('✔ 媒体文件名归一化完成，引用与文件大小写完全一致');
}

main();
