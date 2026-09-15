// 数据抓取脚本（产物已随仓库提交，可重复执行覆盖）
// 数据源均为 B 站公开只读接口：
//   1) 热门榜 /x/web-interface/popular 前 6 页（真实标题/封面/UP/数据/tid 分区）
//   2) 每个视频的真实评论 /x/v2/reply 与真实标签 /x/tag/archive/tags
//   3) 全站热搜 /x/web-interface/search/square
// 资产：封面与头像下载到 server/public/{covers,avatars}，
//       示例 mp4 下载到 server/public/videos（test-videos.co.uk / media.w3.org / vjs.zencdn.net），
//       banner 用 picsum.photos 真实照片。
// 说明：仅用于构建本地演示数据，与 bilibili 官方无关。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const PUBLIC_DIR = path.join(ROOT, 'public');
const COVER_DIR = path.join(PUBLIC_DIR, 'covers');
const AVATAR_DIR = path.join(PUBLIC_DIR, 'avatars');
const VIDEO_DIR = path.join(PUBLIC_DIR, 'videos');
const BANNER_DIR = path.join(PUBLIC_DIR, 'banners');

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const API_HEADERS = { 'User-Agent': UA, Referer: 'https://www.bilibili.com/', Accept: 'application/json' };

// 一级分区：rid 用于展示，tids 是常见的二级分区 id 映射
const REGIONS = [
  { key: 'animation', name: '动画', icon: '🎬', tids: [1, 24, 25, 47, 210, 27] },
  { key: 'guochuang', name: '国创', icon: '🐉', tids: [153, 168, 169, 170] },
  { key: 'music', name: '音乐', icon: '🎵', tids: [3, 29, 30, 31, 59, 60, 130, 193, 243] },
  { key: 'dance', name: '舞蹈', icon: '💃', tids: [129, 154, 156, 198, 199, 200] },
  { key: 'game', name: '游戏', icon: '🎮', tids: [4, 17, 65, 121, 141, 171, 172, 173] },
  { key: 'knowledge', name: '知识', icon: '📖', tids: [36, 122, 124, 201, 207, 208, 209] },
  { key: 'digital', name: '科技', icon: '💻', tids: [188, 95, 230, 231, 232, 233] },
  { key: 'sports', name: '运动', icon: '⚽', tids: [234, 235, 236, 237, 238, 239, 240] },
  { key: 'life', name: '生活', icon: '🌱', tids: [160, 21, 138, 161, 162, 197, 226, 250] },
  { key: 'food', name: '美食', icon: '🍜', tids: [211] },
  { key: 'animal', name: '动物圈', icon: '🐾', tids: [217, 218] },
  { key: 'ghost', name: '鬼畜', icon: '🤪', tids: [119] },
  { key: 'fashion', name: '时尚', icon: '👗', tids: [155, 157, 158, 159, 224] },
  { key: 'news', name: '资讯', icon: '📰', tids: [202, 203, 204] },
  { key: 'ent', name: '娱乐', icon: '🎤', tids: [5, 71, 241, 242] },
  { key: 'cine', name: '影视', icon: '📽️', tids: [181, 182, 183, 184, 85] },
  { key: 'doc', name: '纪录片', icon: '🌍', tids: [177] },
];

const TID_MAP = new Map(REGIONS.flatMap((r) => r.tids.map((tid) => [tid, r])));

const SAMPLE_VIDEOS = [
  { name: 'v1.mp4', url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4' },
  { name: 'v2.mp4', url: 'https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4' },
  { name: 'v3.mp4', url: 'https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4' },
  { name: 'v4.mp4', url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4' },
  { name: 'v5.mp4', url: 'https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_2MB.mp4' },
  { name: 'v6.mp4', url: 'https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_2MB.mp4' },
  { name: 'v7.mp4', url: 'https://media.w3.org/2010/05/sintel/trailer.mp4' },
  { name: 'v8.mp4', url: 'https://media.w3.org/2010/05/bunny/trailer.mp4' },
  { name: 'v9.mp4', url: 'https://media.w3.org/2010/05/video/movie_300.mp4' },
  { name: 'v10.mp4', url: 'https://vjs.zencdn.net/v/oceans.mp4' },
];

const POPULAR_PAGES = 6; // 6 页 × 20 条

for (const dir of [DATA_DIR, COVER_DIR, AVATAR_DIR, VIDEO_DIR, BANNER_DIR]) fs.mkdirSync(dir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, opts = {}, retries = 2) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      lastErr = err;
      await sleep(800 * (i + 1));
    }
  }
  throw lastErr;
}

async function fetchJson(url) {
  const res = await fetchWithRetry(url, { headers: API_HEADERS });
  const json = await res.json();
  if (json.code !== 0) throw new Error(`bilibili api code=${json.code}`);
  return json.data;
}

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return { skipped: true };
  // Referer 仅对 B 站图床使用；其他站点（w3.org 等）会因防盗链拒绝带 Referer 的请求
  const isHdslb = /hdslb\.com/.test(url);
  const res = await fetchWithRetry(url, {
    headers: isHdslb ? { 'User-Agent': UA, Referer: 'https://www.bilibili.com/' } : { 'User-Agent': UA },
  });
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1024) throw new Error(`文件过小(${buf.length}B)，疑似失败`);
  fs.writeFileSync(dest, buf);
  return { size: buf.length };
}

async function pool(items, limit, worker) {
  const ret = [];
  let idx = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (idx < items.length) {
      const i = idx++;
      try {
        ret[i] = await worker(items[i], i);
      } catch (err) {
        ret[i] = { error: String(err.message || err) };
      }
    }
  });
  await Promise.all(runners);
  return ret;
}

const apiCount = { n: 0 };
async function bilibiliApi(url) {
  apiCount.n++;
  await sleep(300); // 温和限速，避免触发风控
  return fetchJson(url);
}

// ---------- 0. 示例视频 ----------
async function ensureSampleVideos() {
  console.log('[0/5] 检查示例视频...');
  for (const v of SAMPLE_VIDEOS) {
    try {
      const r = await download(v.url, path.join(VIDEO_DIR, v.name));
      console.log(`  ${v.name}: ${r.skipped ? '已存在' : `${(r.size / 1024 / 1024).toFixed(2)}MB`}`);
    } catch (err) {
      console.warn(`  ${v.name} 下载失败: ${err.message}（可忽略）`);
    }
  }
}

// ---------- 1. 热门榜多页 ----------
async function fetchPopular() {
  console.log('[1/5] 抓取热门榜...');
  const items = [];
  for (let pn = 1; pn <= POPULAR_PAGES; pn++) {
    try {
      const data = await bilibiliApi(`https://api.bilibili.com/x/web-interface/popular?ps=20&pn=${pn}`);
      items.push(...(data.list || []));
      console.log(`  第${pn}页: +${(data.list || []).length} 条`);
    } catch (err) {
      console.warn(`  第${pn}页失败: ${err.message}`);
    }
  }
  const seen = new Set();
  return items.filter((it) => {
    if (!it.bvid || seen.has(it.bvid)) return false;
    seen.add(it.bvid);
    return true;
  });
}

// ---------- 2. 组装 + 下载资源 ----------
function regionOf(item) {
  return TID_MAP.get(item.tid) || { key: 'other', name: '其他', icon: '🧭' };
}

async function buildVideos(items) {
  console.log('[2/5] 下载封面与头像...');
  console.log(`  去重后共 ${items.length} 个视频`);

  const videos = [];

  await pool(items, 5, async (item) => {
    const regionInfo = regionOf(item);
    const coverFile = `${item.bvid}.jpg`;
    try {
      await download(item.pic, path.join(COVER_DIR, coverFile));
    } catch (err) {
      console.warn(`  封面失败 ${item.bvid}: ${err.message}`);
      return;
    }
    const avatarFile = `${item.owner.mid}.jpg`;
    try {
      await download(item.owner.face, path.join(AVATAR_DIR, avatarFile));
    } catch { /* 头像失败使用兜底 */ }
    videos.push({
      id: item.bvid,
      aid: item.aid,
      title: item.title,
      cover: `/static/covers/${coverFile}`,
      duration: item.duration || 0,
      region: regionInfo.key,
      regionName: regionInfo.name,
      pubdate: new Date((item.pubdate || item.ctime || Date.now() / 1000) * 1000).toISOString(),
      desc: item.desc && item.desc !== '-' ? item.desc : `${item.owner.name} 的作品（${regionInfo.name}分区）`,
      owner: {
        mid: item.owner.mid,
        name: item.owner.name,
        face: `/static/avatars/${avatarFile}`,
        fans: 10000 + ((item.owner.mid * 7919) % 4800000),
      },
      stat: {
        play: item.stat?.view ?? 0,
        danmaku: item.stat?.danmaku ?? 0,
        reply: item.stat?.reply ?? 0,
        like: item.stat?.like ?? 0,
        coin: item.stat?.coin ?? 0,
        favorite: item.stat?.favorite ?? 0,
        share: item.stat?.share ?? 0,
      },
      tags: [regionInfo.name],
      videoUrl: null,
    });
  });

  // 首页推荐流：各分区轮询交错，模拟真实混排
  const byRegion = new Map();
  for (const v of videos) {
    if (!byRegion.has(v.region)) byRegion.set(v.region, []);
    byRegion.get(v.region).push(v);
  }
  const ordered = [];
  let added = true;
  while (added) {
    added = false;
    for (const key of byRegion.keys()) {
      const bucket = byRegion.get(key);
      if (bucket.length) {
        ordered.push(bucket.shift());
        added = true;
      }
    }
  }

  const localVideos = fs.readdirSync(VIDEO_DIR).filter((f) => f.endsWith('.mp4'));
  if (!localVideos.length) throw new Error('示例视频为空，无法继续');
  ordered.forEach((v, i) => {
    v.videoUrl = `/static/videos/${localVideos[i % localVideos.length]}`;
  });

  console.log(`  有效视频 ${ordered.length} 个`);
  return ordered;
}

// ---------- 3. 评论 / 标签 ----------
async function buildCommentsAndTags(videos) {
  console.log('[3/5] 抓取真实评论与标签...');
  const comments = {};
  await pool(videos, 4, async (v) => {
    try {
      const data = await bilibiliApi(`https://api.bilibili.com/x/v2/reply?type=1&oid=${v.aid}&sort=1&ps=8`);
      const list = [];
      for (const r of data.replies || []) {
        const face = `/static/avatars/${r.member.mid}.jpg`;
        try {
          await download(r.member.face, path.join(AVATAR_DIR, `${r.member.mid}.jpg`));
        } catch { /* 头像失败仍保留评论 */ }
        list.push({
          rpid: String(r.rpid),
          mid: r.member.mid,
          name: r.member.uname,
          face,
          content: r.content.message,
          like: r.like,
          time: new Date(r.ctime * 1000).toISOString(),
          isUp: r.member.mid === v.owner.mid,
          isSelf: false,
        });
      }
      if (list.length) comments[v.id] = list;
    } catch { /* 失败则回退到合成评论 */ }
  });
  const withComments = Object.keys(comments).length;

  await pool(videos, 4, async (v) => {
    try {
      const data = await bilibiliApi(`https://api.bilibili.com/x/tag/archive/tags?bvid=${v.id}`);
      const names = (data || []).map((t) => t.tag_name).filter(Boolean).slice(0, 6);
      if (names.length) v.tags = names;
    } catch { /* 保留分区名兜底 */ }
  });

  console.log(`  真实评论覆盖 ${withComments}/${videos.length} 个视频`);
  return comments;
}

// ---------- 4. 热搜 / banner / 分类 ----------
async function buildMisc(videos) {
  console.log('[4/5] 抓取热搜、生成 banner 与分类...');
  let hot = [];
  try {
    const data = await bilibiliApi('https://api.bilibili.com/x/web-interface/search/square?limit=10');
    hot = (data.trending?.list || []).slice(0, 10).map((x, i) => ({ rank: i + 1, keyword: x.show_name || x.keyword }));
  } catch (err) {
    console.warn(`  热搜失败: ${err.message}`);
  }
  if (!hot.length) {
    hot = videos.slice(0, 10).map((v, i) => ({ rank: i + 1, keyword: v.title.slice(0, 18) }));
  }

  const banners = [];
  const bannerSeeds = ['bili-a', 'bili-b', 'bili-c', 'bili-d'];
  const bannerTitles = videos.slice(0, 4);
  for (let i = 0; i < 4; i++) {
    const file = `b${i + 1}.jpg`;
    try {
      await download(`https://picsum.photos/seed/${bannerSeeds[i]}/960/330`, path.join(BANNER_DIR, file));
    } catch (err) {
      console.warn(`  banner${i + 1} 失败: ${err.message}`);
      continue;
    }
    banners.push({
      image: `/static/banners/${file}`,
      title: bannerTitles[i] ? bannerTitles[i].title.slice(0, 40) : 'bilibili 演示站点',
      videoId: bannerTitles[i] ? bannerTitles[i].id : videos[0].id,
    });
  }

  // “我”的头像与评论兜底头像池
  try {
    await download('https://picsum.photos/seed/bili-me/96/96', path.join(AVATAR_DIR, 'me.jpg'));
    await download('https://picsum.photos/seed/bili-pool/96/96', path.join(AVATAR_DIR, 'pool.jpg'));
  } catch (err) {
    console.warn(`  预置头像失败: ${err.message}`);
  }

  const categories = [
    { key: 'home', name: '首页', icon: '🏠' },
    { key: 'hot', name: '热门', icon: '🔥' },
    ...REGIONS.map(({ key, name, icon }) => ({ key, name, icon })),
    { key: 'other', name: '其他', icon: '🧭' },
  ];

  return { hot, banners, categories };
}

// ---------- main ----------
(async () => {
  console.log('[5/5] 开始抓取（依赖外网可达 bilibili.com / picsum.photos）');
  await ensureSampleVideos();
  const items = await fetchPopular();
  if (items.length < 40) throw new Error(`热门榜抓取过少(${items.length})，中止`);
  const videos = await buildVideos(items);
  const comments = await buildCommentsAndTags(videos);
  const { hot, banners, categories } = await buildMisc(videos);

  const write = (file, data) => fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));

  write('videos.json', videos);
  write('comments.json', comments);
  write('hot-search.json', hot);
  write('banners.json', banners);
  write('categories.json', categories);

  const regionStat = {};
  videos.forEach((v) => (regionStat[v.region] = (regionStat[v.region] || 0) + 1));

  console.log('\n==== 抓取完成 ====');
  console.log(`视频 ${videos.length} | 热搜 ${hot.length} | banner ${banners.length} | 分类 ${categories.length} | 评论视频 ${Object.keys(comments).length} | API 调用 ${apiCount.n} 次`);
  console.log('分区分布:', JSON.stringify(regionStat));
  console.log(`资源: 封面 ${fs.readdirSync(COVER_DIR).length} | 头像 ${fs.readdirSync(AVATAR_DIR).length} | 示例视频 ${fs.readdirSync(VIDEO_DIR).length}`);
})();
