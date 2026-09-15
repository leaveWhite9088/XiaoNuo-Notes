/**
 * 首页顶部轮播图素材采集：从 B 站公开接口取真实视频封面的大图版本。
 *   node scripts/fetch-banners.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'media', 'banners');
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const PICK_INDEX = [0, 1, 2, 3, 4, 5];

const res = await fetch('https://api.bilibili.com/x/web-interface/popular?ps=10&pn=1', {
  headers: { 'User-Agent': UA, Referer: 'https://www.bilibili.com/' },
});
const json = await res.json();
const list = json.data?.list ?? [];
if (!list.length) {
  console.error('接口无数据，跳过 banner 采集');
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });
const banners = [];
for (const i of PICK_INDEX) {
  const item = list[i % list.length];
  if (!item) continue;
  const pic = item.pic.replace(/^http:/, 'https:');
  const url = `${pic}@1146w_360h_1c.webp`;
  const file = `banner-${i + 1}.webp`;
  const r = await fetch(url, { headers: { 'User-Agent': UA, Referer: 'https://www.bilibili.com/' } });
  if (!r.ok) {
    console.warn(`跳过 ${url} -> ${r.status}`);
    continue;
  }
  const buf = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(path.join(OUT, file), buf);
  banners.push({
    title: item.title,
    subtitle: `${item.owner?.name ?? ''} · ${item.tname ?? ''}`,
    image: `/media/banners/${file}`,
    link: `/video/${item.bvid}`,
  });
  console.log(`✔ ${file} (${(buf.length / 1024).toFixed(0)}KB) ${item.title}`);
}
fs.writeFileSync(path.join(ROOT, 'data', 'banners.json'), JSON.stringify(banners, null, 2));
console.log(`✔ 写入 data/banners.json (${banners.length})`);
