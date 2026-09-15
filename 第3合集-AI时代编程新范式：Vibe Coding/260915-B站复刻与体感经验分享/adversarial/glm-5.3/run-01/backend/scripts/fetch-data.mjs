/**
 * 数据集构建脚本（一次性，产物入库 backend/data 与 backend/public）。
 *
 * 数据来源：
 *  - 视频元数据：B 站公开排行榜接口 /x/web-interface/ranking/v2（真实标题/封面/UP主/播放数据）
 *  - 封面与头像：下载自 hdslb.com CDN，并利用其缩放参数压成 webp（封面 480w，头像 120w）
 *  - 可播放视频：Blender 开放电影预告 / CC0 示例片段（B 站正片流需签名，不做破解）
 *
 * 运行：npm --prefix backend run fetch:data
 * 幂等：已存在的图片/视频文件会跳过，可重复运行。
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url))); // backend/
const DATA_DIR = path.join(ROOT, 'data');
const PUBLIC_DIR = path.join(ROOT, 'public');
const COVER_DIR = path.join(PUBLIC_DIR, 'covers');
const FACE_DIR = path.join(PUBLIC_DIR, 'faces');
const VIDEO_DIR = path.join(PUBLIC_DIR, 'videos');
for (const d of [DATA_DIR, COVER_DIR, FACE_DIR, VIDEO_DIR]) mkdir(d, { recursive: true });

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

/** 分区定义：chips=首页分类条，menu=顶部"分区"悬停菜单（均使用真实分区 rid） */
const REGIONS = [
  { rid: 1, key: 'anime', label: '动画', group: 'chips' },
  { rid: 3, key: 'music', label: '音乐', group: 'chips' },
  { rid: 129, key: 'dance', label: '舞蹈', group: 'chips' },
  { rid: 4, key: 'game', label: '游戏', group: 'chips' },
  { rid: 36, key: 'knowledge', label: '知识', group: 'chips' },
  { rid: 211, key: 'food', label: '美食', group: 'chips' },
  { rid: 160, key: 'life', label: '生活', group: 'chips' },
  { rid: 5, key: 'ent', label: '娱乐', group: 'chips' },
  { rid: 23, key: 'movie', label: '电影', group: 'menu' },
  { rid: 11, key: 'tv', label: '电视剧', group: 'menu' },
  { rid: 13, key: 'bangumi', label: '番剧', group: 'menu' },
  { rid: 168, key: 'guochuang', label: '国创', group: 'menu' },
  { rid: 177, key: 'doc', label: '纪录片', group: 'menu' },
  { rid: 119, key: 'guichu', label: '鬼畜', group: 'menu' },
  { rid: 217, key: 'animal', label: '动物圈', group: 'menu' },
  { rid: 155, key: 'fashion', label: '时尚', group: 'menu' },
  { rid: 223, key: 'car', label: '汽车', group: 'menu' },
  { rid: 234, key: 'sport', label: '运动', group: 'menu' },
];

/** 可播放示例片段（公开授权），按 bvid 哈希轮换映射 */
const CLIPS = [
  { file: 'sintel-trailer.mp4', url: 'https://media.w3.org/2010/05/sintel/trailer.mp4', about: 'Sintel 预告片' },
  { file: 'bunny-trailer.mp4', url: 'https://media.w3.org/2010/05/bunny/trailer.mp4', about: 'Big Buck Bunny 预告片' },
  { file: 'movie-300.mp4', url: 'https://media.w3.org/2010/05/video/movie_300.mp4', about: 'Blender 短片' },
  { file: 'flower.mp4', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', about: 'CC0 花朵' },
  { file: 'bbb-1080.mp4', url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4', about: 'Big Buck Bunny 1080p' },
  { file: 'jellyfish-1080.mp4', url: 'https://test-videos.co.uk/vids/jellyfish/mp4/h264/1080/Jellyfish_1080_10s_5MB.mp4', about: '水母 1080p' },
  { file: 'sintel-1080.mp4', url: 'https://test-videos.co.uk/vids/sintel/mp4/h264/1080/Sintel_1080_10s_5MB.mp4', about: 'Sintel 1080p' },
];

const PER_REGION_LIMIT = 30;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJSON(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Referer: 'https://www.bilibili.com/' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(800 * (i + 1));
    }
  }
}

async function download(url, dest) {
  if (existsSync(dest) && (await readFile(dest)).length > 0) return 'skip';
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 200) throw new Error(`too small (${buf.length}B)`);
      await writeFile(dest, buf);
      return 'ok';
    } catch (e) {
      if (i === 2) return `fail:${e.message}`;
      await sleep(600 * (i + 1));
    }
  }
}

async function pool(items, limit, worker) {
  const ret = [];
  let idx = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (idx < items.length) {
        const i = idx++;
        ret[i] = await worker(items[i], i);
      }
    }),
  );
  return ret;
}

function hash(s) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

async function main() {
  console.log('[1/4] 拉取各分区排行榜…');
  const byBvid = new Map();
  const regionCount = {};
  for (const region of REGIONS) {
    const api = `https://api.bilibili.com/x/web-interface/ranking/v2?rid=${region.rid}&type=all`;
    try {
      const json = await fetchJSON(api);
      const list = json?.data?.list ?? [];
      regionCount[region.key] = Math.min(list.length, PER_REGION_LIMIT);
      if (list.length < 8) {
        console.log(`  · rid=${region.rid} ${region.label}: 仅 ${list.length} 条，跳过该分区`);
        continue;
      }
      for (const v of list.slice(0, PER_REGION_LIMIT)) {
        if (byBvid.has(v.bvid)) continue;
        byBvid.set(v.bvid, { v, region });
      }
      console.log(`  · rid=${region.rid} ${region.label}: ${Math.min(list.length, PER_REGION_LIMIT)} 条`);
    } catch (e) {
      console.log(`  · rid=${region.rid} ${region.label}: 拉取失败 ${e.message}`);
    }
    await sleep(400);
  }

  // 全站榜只用来给 hotRank 排序（不引入新条目，避免无分区归属）
  let hotOrder = [];
  try {
    const json = await fetchJSON('https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=all');
    hotOrder = (json?.data?.list ?? []).map((v) => v.bvid);
  } catch {
    /* 拿不到就退化按播放量排 */
  }
  const hotRankMap = new Map(hotOrder.map((bvid, i) => [bvid, i + 1]));

  const usedRegions = REGIONS.filter((r) => (regionCount[r.key] ?? 0) > 0);
  const items = [...byBvid.values()].map(({ v, region }) => ({
    bvid: v.bvid,
    aid: v.aid,
    title: v.title.replace(/<em class="keyword">|<\/em>/g, ''),
    desc: (v.desc || '').slice(0, 300),
    duration: v.duration,
    pubdate: v.pubdate,
    tname: v.tname || '',
    region: region.key,
    regionLabel: region.label,
    hotRank: hotRankMap.get(v.bvid) ?? 99999,
    owner: { mid: v.owner.mid, name: v.owner.name },
    stat: {
      view: v.stat.view,
      danmaku: v.stat.danmaku,
      reply: v.stat.reply,
      like: v.stat.like,
      coin: v.stat.coin,
      favorite: v.stat.favorite,
      share: v.stat.share,
    },
    coverUrl: v.pic,
    faceUrl: v.owner.face,
  }));
  console.log(`  共 ${items.length} 条不重复视频`);

  console.log('[2/4] 下载封面（480w webp）…');
  const coverJobs = items.map((it) => ({ it, url: `${it.coverUrl}@480w.webp`, dest: path.join(COVER_DIR, `${it.bvid}.webp`) }));
  const coverRes = await pool(coverJobs, 10, (j) => download(j.url, j.dest));
  const coverFail = coverRes.filter((r) => r?.startsWith('fail')).length;
  console.log(`  封面完成（跳过/成功 ${coverRes.length - coverFail}，失败 ${coverFail}）`);

  console.log('[3/4] 下载 UP 主头像（120w webp）…');
  const faces = new Map(items.map((it) => [it.owner.mid, it.faceUrl]));
  const faceRes = await pool([...faces.entries()], 10, ([mid, url]) => download(`${url}@120w.webp`, path.join(FACE_DIR, `${mid}.webp`)));
  console.log(`  头像完成（失败 ${faceRes.filter((r) => r?.startsWith('fail')).length}）`);

  console.log('[4/4] 下载示例视频片段…');
  for (const clip of CLIPS) {
    const r = await download(clip.url, path.join(VIDEO_DIR, clip.file));
    console.log(`  · ${clip.file}: ${r}`);
  }

  const dataset = items.map(({ coverUrl, faceUrl, ...it }) => ({
    ...it,
    cover: `/media/covers/${it.bvid}.webp`,
    ownerFace: `/media/faces/${it.owner.mid}.webp`,
    clip: CLIPS[hash(it.bvid) % CLIPS.length].file,
    playUrl: `/media/videos/${CLIPS[hash(it.bvid) % CLIPS.length].file}`,
  }));

  await writeFile(path.join(DATA_DIR, 'videos.json'), JSON.stringify({ fetchedAt: new Date().toISOString(), items: dataset }));
  await writeFile(
    path.join(DATA_DIR, 'meta.json'),
    JSON.stringify({ fetchedAt: new Date().toISOString(), total: dataset.length, regions: usedRegions, regionCount, clips: CLIPS }, null, 2),
  );
  console.log(`完成：${dataset.length} 条 → backend/data/videos.json`);
}

main().catch((e) => {
  console.error('抓取失败：', e);
  process.exit(1);
});
