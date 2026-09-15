/**
 * 数据采集脚本（离线运行一次，产出 data/seed.json + public/media 下的真实图片/视频）
 *
 * 数据来源：B 站公开 web 接口（popular / newlist），仅用于本地演示数据快照。
 * 媒体资源下载到本地，避免运行时依赖外网与防盗链。
 *
 *   node scripts/fetch-data.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MEDIA = path.join(ROOT, 'public', 'media');
const DATA_DIR = path.join(ROOT, 'data');

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const HEADERS = { 'User-Agent': UA, Referer: 'https://www.bilibili.com/' };

/** 首页「分区」导航 + 卡片筛选用的真实分区 rid */
export const CATEGORIES = [
  { slug: 'all', name: '全部', rid: 0 },
  { slug: 'douga', name: '动画', rid: 1 },
  { slug: 'music', name: '音乐', rid: 3 },
  { slug: 'dance', name: '舞蹈', rid: 129 },
  { slug: 'game', name: '游戏', rid: 4 },
  { slug: 'knowledge', name: '知识', rid: 36 },
  { slug: 'tech', name: '科技', rid: 188 },
  { slug: 'sports', name: '运动', rid: 234 },
  { slug: 'car', name: '汽车', rid: 223 },
  { slug: 'life', name: '生活', rid: 160 },
  { slug: 'food', name: '美食', rid: 211 },
  { slug: 'animal', name: '动物', rid: 217 },
  { slug: 'kichiku', name: '鬼畜', rid: 119 },
  { slug: 'fashion', name: '时尚', rid: 155 },
  { slug: 'ent', name: '娱乐', rid: 5 },
  { slug: 'movie', name: '影视', rid: 181 },
  { slug: 'documentary', name: '纪录片', rid: 177 },
];

const SAMPLE_VIDEOS = [
  { file: 'sample-1.mp4', url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4' },
  { file: 'sample-2.mp4', url: 'https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_5MB.mp4' },
  { file: 'sample-3.mp4', url: 'https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_5MB.mp4' },
  { file: 'sample-4.mp4', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
  { file: 'sample-5.mp4', url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4' },
  { file: 'sample-6.mp4', url: 'https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      const json = await res.json();
      if (json.code === 0) return json.data;
      console.warn(`  ! api code=${json.code} ${json.message} :: ${url}`);
      return null;
    } catch (err) {
      await sleep(400 * (i + 1));
    }
  }
  return null;
}

async function download(url, dest, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 512) throw new Error(`too small: ${buf.length}`);
      fs.writeFileSync(dest, buf);
      return buf.length;
    } catch (err) {
      if (i === retries - 1) {
        console.warn(`  ! download failed ${url} :: ${err.message}`);
        return 0;
      }
      await sleep(300 * (i + 1));
    }
  }
  return 0;
}

/** 有限并发 */
async function pool(items, limit, worker) {
  const queue = [...items];
  let done = 0;
  const runners = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      await worker(item);
      done++;
      if (done % 25 === 0) console.log(`  ... ${done}/${items.length}`);
    }
  });
  await Promise.all(runners);
}

const norm = (pic) => (pic.startsWith('//') ? `https:${pic}` : pic.replace(/^http:/, 'https:'));
const thumb = (pic) => `${norm(pic)}@440w_275h_1c.webp`;
const avatarThumb = (face) => `${norm(face)}@120w_120h_1c.webp`;

function mapVideo(raw, categorySlug) {
  const stat = raw.stat ?? {};
  return {
    bvid: raw.bvid,
    aid: raw.aid,
    cid: raw.cid,
    title: raw.title,
    desc: (raw.desc || '').trim() || `${raw.title} —— 来自「${raw.tname || '综合'}」分区的演示视频。`,
    coverUrl: norm(raw.pic),
    duration: raw.duration ?? 0,
    pubdate: raw.pubdate ?? raw.ctime ?? Math.floor(Date.now() / 1000),
    tname: raw.tname || '综合',
    categorySlug,
    play: stat.view ?? 0,
    danmaku: stat.danmaku ?? 0,
    like: stat.like ?? 0,
    coin: stat.coin ?? 0,
    favorite: stat.favorite ?? 0,
    reply: stat.reply ?? 0,
    share: stat.share ?? 0,
    owner: {
      mid: raw.owner?.mid ?? 0,
      name: raw.owner?.name ?? '匿名UP主',
      face: raw.owner?.face ?? '',
    },
  };
}

async function main() {
  fs.mkdirSync(path.join(MEDIA, 'covers'), { recursive: true });
  fs.mkdirSync(path.join(MEDIA, 'avatars'), { recursive: true });
  fs.mkdirSync(path.join(MEDIA, 'videos'), { recursive: true });
  fs.mkdirSync(DATA_DIR, { recursive: true });

  const byBvid = new Map();

  console.log('▸ 拉取综合热门(popular)...');
  for (const pn of [1, 2]) {
    const data = await getJson(
      `https://api.bilibili.com/x/web-interface/popular?ps=50&pn=${pn}`,
    );
    for (const item of data?.list ?? []) {
      if (item.bvid && !byBvid.has(item.bvid)) {
        byBvid.set(item.bvid, mapVideo(item, guessSlug(item.tname)));
      }
    }
    await sleep(250);
  }
  console.log(`  综合池: ${byBvid.size}`);

  console.log('▸ 拉取各分区最新(newlist)...');
  for (const cat of CATEGORIES) {
    if (cat.rid === 0) continue;
    const data = await getJson(
      `https://api.bilibili.com/x/web-interface/newlist?rid=${cat.rid}&ps=12&pn=1&type=0`,
    );
    for (const item of data?.archives ?? []) {
      if (!item.bvid) continue;
      const existing = byBvid.get(item.bvid);
      if (existing) {
        existing.categorySlug = cat.slug;
      } else {
        byBvid.set(item.bvid, mapVideo(item, cat.slug));
      }
    }
    await sleep(200);
  }
  const videos = [...byBvid.values()];
  console.log(`▸ 视频总数: ${videos.length}`);

  // ---------- 真实封面 ----------
  // 命名 {bvid 小写}-{aid}.webp：B 站存在仅大小写不同的 BV 号，直接用 bvid 命名会在
  // macOS/Windows（大小写不敏感）互相覆盖，在 Linux 又会 404。aid 是数字，可保证唯一。
  console.log('▸ 下载视频封面...');
  await pool(videos, 8, async (v) => {
    const name = `${v.bvid.toLowerCase()}-${v.aid}.webp`;
    const dest = path.join(MEDIA, 'covers', name);
    const size = await download(thumb(v.coverUrl), dest);
    v.cover = size ? `/media/covers/${name}` : '';
  });
  const noCover = videos.filter((v) => !v.cover).length;
  console.log(`  封面完成, 失败 ${noCover}`);

  // ---------- 真实 UP 主头像 ----------
  const owners = new Map();
  for (const v of videos) {
    if (v.owner.mid && !owners.has(v.owner.mid)) owners.set(v.owner.mid, v.owner);
  }
  const ownerList = [...owners.values()].slice(0, 60);
  console.log(`▸ 下载 UP 主头像 x${ownerList.length}...`);
  await pool(ownerList, 8, async (o) => {
    if (!o.face) {
      o.avatar = '';
      return;
    }
    const dest = path.join(MEDIA, 'avatars', `${o.mid}.webp`);
    const size = await download(avatarThumb(o.face), dest);
    o.avatar = size ? `/media/avatars/${o.mid}.webp` : '';
  });

  // ---------- 演示播放源（真实 mp4 文件） ----------
  console.log('▸ 下载演示播放源...');
  const playable = [];
  for (const s of SAMPLE_VIDEOS) {
    const dest = path.join(MEDIA, 'videos', s.file);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 100000) {
      playable.push(`/media/videos/${s.file}`);
      continue;
    }
    const size = await download(s.url, dest);
    if (size) playable.push(`/media/videos/${s.file}`);
  }
  console.log(`  可用播放源: ${playable.length}`);

  // 为每个视频分配一个本地播放源，让全站详情页都能真的播
  videos.forEach((v, i) => {
    v.videoUrl = playable.length ? playable[i % playable.length] : '';
    v.cover = v.cover || '/media/covers/placeholder.webp';
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    source: 'api.bilibili.com (popular + newlist)',
    categories: CATEGORIES,
    videos,
    owners: ownerList.map((o) => ({
      mid: o.mid,
      name: o.name,
      avatar: o.avatar || '',
      sign: '这个人很神秘，什么都没有写',
    })),
  };

  fs.writeFileSync(path.join(DATA_DIR, 'seed.json'), JSON.stringify(payload, null, 2));
  console.log(`✔ 写入 data/seed.json (${videos.length} 视频 / ${ownerList.length} UP主)`);
}

function guessSlug(tname) {
  const hit = CATEGORIES.find((c) => c.name === tname);
  if (hit) return hit.slug;
  const table = {
    日常: 'life',
    搞笑: 'ent',
    综艺: 'ent',
    电影: 'movie',
    电视剧: 'movie',
    影视杂谈: 'movie',
    单机游戏: 'game',
    网络游戏: 'game',
    电子竞技: 'game',
    手机游戏: 'game',
    科学科普: 'knowledge',
    社科人文: 'knowledge',
    财经商业: 'knowledge',
    校园学习: 'knowledge',
    职业职场: 'knowledge',
    数码: 'tech',
    软件应用: 'tech',
    计算机技术: 'tech',
    机械: 'tech',
    健身: 'sports',
    竞技体育: 'sports',
    篮球: 'sports',
    足球: 'sports',
    美食制作: 'food',
    美食侦探: 'food',
    喵星人: 'animal',
    汪星人: 'animal',
    动物综合: 'animal',
    鬼畜调教: 'kichiku',
    音MAD: 'kichiku',
    美妆护肤: 'fashion',
    穿搭: 'fashion',
    时尚潮流: 'fashion',
    音乐综合: 'music',
    原创音乐: 'music',
    翻唱: 'music',
    演奏: 'music',
    宅舞: 'dance',
    舞蹈综合: 'dance',
    动画综合: 'douga',
    'MAD·AMV': 'douga',
    手办·模玩: 'douga',
    纪录片: 'documentary',
    人文历史: 'documentary',
    汽车生活: 'car',
    汽车知识: 'car',
    摩托车: 'car',
  };
  return table[tname] || 'life';
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
