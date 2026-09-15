// 一次性数据抓取脚本：从 B 站公开 API 抓取真实视频数据，并把封面/头像下载到本地。
// 产物: server/data/videos.json + server/public/covers/*.jpg + server/public/faces/*.jpg
import { writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA_DIR = path.join(ROOT, 'server/data');
const COVERS_DIR = path.join(ROOT, 'server/public/covers');
const FACES_DIR = path.join(ROOT, 'server/public/faces');

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const HEADERS = {
  'User-Agent': UA,
  Referer: 'https://www.bilibili.com/',
};

async function fetchJSON(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function download(url, dest) {
  try {
    await access(dest);
    return 'cached';
  } catch {}
  // 统一走 https
  const httpsUrl = url.replace(/^http:/, 'https:');
  const res = await fetch(httpsUrl, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${httpsUrl}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return 'downloaded';
}

function fmtDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

async function main() {
  await mkdir(COVERS_DIR, { recursive: true });
  await mkdir(FACES_DIR, { recursive: true });
  await mkdir(DATA_DIR, { recursive: true });

  const videos = [];
  const seen = new Set();

  for (let pn = 1; pn <= 4; pn++) {
    const json = await fetchJSON(
      `https://api.bilibili.com/x/web-interface/popular?ps=20&pn=${pn}`
    );
    if (json.code !== 0) throw new Error(`API code ${json.code}: ${json.message}`);
    for (const item of json.data.list || []) {
      if (seen.has(item.bvid)) continue;
      seen.add(item.bvid);
      videos.push({
        id: item.bvid,
        aid: item.aid,
        title: item.title,
        desc: item.desc || '',
        category: item.tname, // 真实分区名，如 "汽车生活" "手机游戏"
        tid: item.tid,
        coverUrl: item.pic.replace(/^http:/, 'https:'),
        cover: `/media/covers/${item.bvid}.jpg`,
        owner: {
          name: item.owner.name,
          mid: item.owner.mid,
          faceUrl: (item.owner.face || '').replace(/^http:/, 'https:'),
          face: `/media/faces/${item.owner.mid}.jpg`,
        },
        stat: {
          view: item.stat.view,
          danmaku: item.stat.danmaku,
          reply: item.stat.reply,
          favorite: item.stat.favorite,
          like: item.stat.like,
          coin: item.stat.coin,
          share: item.stat.share,
        },
        duration: fmtDuration(item.duration),
        durationSec: item.duration,
        pubdate: item.pubdate * 1000,
      });
    }
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`fetched ${videos.length} videos`);

  // 并发下载图片（限制并发 8）
  const queue = [];
  for (const v of videos) {
    queue.push({ url: v.coverUrl, dest: path.join(COVERS_DIR, `${v.id}.jpg`) });
    if (v.owner.faceUrl) {
      queue.push({
        url: v.owner.faceUrl,
        dest: path.join(FACES_DIR, `${v.owner.mid}.jpg`),
      });
    }
  }
  let ok = 0;
  let fail = 0;
  const workers = Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const { url, dest } = queue.shift();
      try {
        await download(url, dest);
        ok++;
      } catch (e) {
        fail++;
        console.warn(`img fail: ${url} -> ${e.message}`);
      }
    }
  });
  await Promise.all(workers);
  console.log(`images: ok=${ok} fail=${fail}`);

  await writeFile(
    path.join(DATA_DIR, 'videos.json'),
    JSON.stringify({ fetchedAt: Date.now(), videos }, null, 2),
    'utf8'
  );
  console.log(`wrote ${path.join(DATA_DIR, 'videos.json')}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
