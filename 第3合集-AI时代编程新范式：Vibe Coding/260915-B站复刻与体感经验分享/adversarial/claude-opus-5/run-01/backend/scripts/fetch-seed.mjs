#!/usr/bin/env node
/**
 * 抓取真实的 B 站公开数据（热门 / 入站必刷 / 热搜榜），下载真实封面与头像，
 * 生成 backend/data/seed.json 供后端数据层导入。
 *
 * 用法: node backend/scripts/fetch-seed.mjs
 * 网络不可用时不会破坏已有 seed.json（写入前先写临时文件）。
 */
import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MEDIA = path.join(ROOT, 'media');
const DATA = path.join(ROOT, 'data');

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const HEADERS = { 'User-Agent': UA, Referer: 'https://www.bilibili.com/' };

const TARGET_VIDEOS = 140;

/** 首页分区导航（与 B 站主站分区保持一致的展示顺序） */
const CHANNELS = [
  { id: 'anime', name: '动画', icon: '🎬', color: '#fb7299' },
  { id: 'bangumi', name: '番剧', icon: '📺', color: '#ff85ad' },
  { id: 'guochuang', name: '国创', icon: '🐉', color: '#ff9c6e' },
  { id: 'music', name: '音乐', icon: '🎵', color: '#4ecdc4' },
  { id: 'dance', name: '舞蹈', icon: '💃', color: '#f9a8d4' },
  { id: 'game', name: '游戏', icon: '🎮', color: '#6fc8ff' },
  { id: 'knowledge', name: '知识', icon: '📚', color: '#7c9cff' },
  { id: 'tech', name: '科技数码', icon: '💻', color: '#5ac8fa' },
  { id: 'sports', name: '运动', icon: '🏀', color: '#ffb020' },
  { id: 'car', name: '汽车', icon: '🚗', color: '#8fb7ff' },
  { id: 'life', name: '生活', icon: '🌱', color: '#8ed36c' },
  { id: 'food', name: '美食', icon: '🍜', color: '#ff9f5a' },
  { id: 'animal', name: '动物圈', icon: '🐾', color: '#ffd166' },
  { id: 'kichiku', name: '鬼畜', icon: '🤡', color: '#c78fff' },
  { id: 'fashion', name: '时尚', icon: '👗', color: '#ff8fb1' },
  { id: 'ent', name: '娱乐', icon: '🎤', color: '#ff6b9d' },
  { id: 'cinephile', name: '影视', icon: '🎞️', color: '#9aa7ff' },
  { id: 'documentary', name: '纪录片', icon: '🎥', color: '#89d0a6' },
  { id: 'movie', name: '电影', icon: '🍿', color: '#ffa8a8' },
  { id: 'teleplay', name: '电视剧', icon: '📼', color: '#b0a4ff' },
];

/** B 站真实分区名 -> 首页频道 id */
const CHANNEL_MAP = {
  动画: 'anime', 动漫: 'anime', 'MAD·AMV': 'anime', 手办·模玩: 'anime', 综合: 'anime',
  番剧: 'bangumi', 连载动画: 'bangumi', 完结动画: 'bangumi',
  国创: 'guochuang', 国产动画: 'guochuang', 国产原创相关: 'guochuang',
  音乐: 'music', AI音乐: 'music', 音乐综合: 'music', 翻唱: 'music', 原创音乐: 'music', VOCALOID: 'music', 演奏: 'music', 音乐现场: 'music', MV: 'music',
  舞蹈: 'dance', 宅舞: 'dance', 街舞: 'dance', 舞蹈综合: 'dance', 明星舞蹈: 'dance',
  游戏: 'game', 单机游戏: 'game', 网络游戏: 'game', 电子竞技: 'game', 手机游戏: 'game', 桌游棋牌: 'game', GMV: 'game', 音游: 'game', Mugen: 'game',
  知识: 'knowledge', 科学科普: 'knowledge', 社科·法律·心理: 'knowledge', 人文历史: 'knowledge', 财经商业: 'knowledge', 校园学习: 'knowledge', 职业职场: 'knowledge', 设计创意: 'knowledge',
  科技: 'tech', 科技数码: 'tech', 数码: 'tech', 软件应用: 'tech', 计算机技术: 'tech', 工业·工程·机械: 'tech', 极客DIY: 'tech', 人工智能: 'tech',
  运动: 'sports', 体育运动: 'sports', 篮球: 'sports', 足球: 'sports', 健身: 'sports', 竞技体育: 'sports', 运动文化: 'sports', 运动综合: 'sports',
  汽车: 'car', 汽车生活: 'car', 汽车文化: 'car', 赛车: 'car', 智能出行: 'car',
  生活: 'life', 生活兴趣: 'life', 生活经验: 'life', 日常: 'life', 家居房产: 'life', 家装房产: 'life', 手工: 'life', 绘画: 'life', 亲子: 'life', 出行: 'life', 旅游出行: 'life', 三农: 'life', 健康: 'life', 情感: 'life', 公益: 'life', 户外潮流: 'life', vlog: 'life', VLOG: 'life',
  美食: 'food', 美食制作: 'food', 美食侦探: 'food', 美食测评: 'food', 田园美食: 'food', 美食记录: 'food',
  动物圈: 'animal', 动物: 'animal', 喵星人: 'animal', 汪星人: 'animal', 野生动物: 'animal', 小宠异宠: 'animal', 动物综合: 'animal',
  鬼畜: 'kichiku', 鬼畜调教: 'kichiku', 音MAD: 'kichiku', 人力VOCALOID: 'kichiku', 鬼畜剧场: 'kichiku', 小剧场: 'kichiku',
  时尚: 'fashion', 时尚美妆: 'fashion', 美妆护肤: 'fashion', 穿搭: 'fashion', 时尚潮流: 'fashion',
  娱乐: 'ent', 综艺: 'ent', 娱乐杂谈: 'ent', 粉丝创作: 'ent', 明星综合: 'ent', 资讯: 'ent',
  影视: 'cinephile', 影视杂谈: 'cinephile', 影视剪辑: 'cinephile', 短片: 'cinephile', 预告·资讯: 'cinephile',
  纪录片: 'documentary', 人文·历史: 'documentary', 科学·探索·自然: 'documentary', 军事: 'documentary', 社会·美食·旅行: 'documentary',
  电影: 'movie', 华语电影: 'movie', 欧美电影: 'movie', 日本电影: 'movie',
  电视剧: 'teleplay', 国产剧: 'teleplay', 海外剧: 'teleplay',
};

/** 演示用的真实可播放视频片段（CC / 开源片源） */
const SAMPLE_VIDEOS = [
  ['bbb', 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4'],
  ['sintel', 'https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_5MB.mp4'],
  ['jellyfish', 'https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_5MB.mp4'],
  ['bbb360', 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_2MB.mp4'],
  ['sintel360', 'https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_2MB.mp4'],
  ['jellyfish360', 'https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_2MB.mp4'],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(15000) });
      const json = await res.json();
      if (json.code === 0) return json.data;
      console.warn(`  ! ${url} -> code=${json.code} (${json.message}) 重试中`);
    } catch (err) {
      console.warn(`  ! ${url} -> ${err.message}`);
    }
    await sleep(1200 * (i + 1));
  }
  return null;
}

async function download(url, dest) {
  try {
    await fs.access(dest);
    return true; // 已存在，跳过
  } catch {}
  try {
    const res = await fetch(url.replace(/^http:/, 'https:'), {
      headers: HEADERS,
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok || !res.body) return false;
    await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
    return true;
  } catch (err) {
    console.warn(`  ! 下载失败 ${url}: ${err.message}`);
    return false;
  }
}

async function mapLimit(items, limit, fn) {
  const out = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const i = cursor++;
        out[i] = await fn(items[i], i);
      }
    }),
  );
  return out;
}

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

// ---------------------------------------------------------------- 采集

async function collectRawVideos() {
  const seen = new Map();
  const push = (list) => {
    for (const v of list || []) {
      if (v && v.bvid && !seen.has(v.bvid) && v.pic && v.owner) seen.set(v.bvid, v);
    }
  };

  for (let pn = 1; pn <= 5 && seen.size < TARGET_VIDEOS; pn++) {
    console.log(`· 拉取热门视频 第 ${pn} 页 (当前 ${seen.size})`);
    const data = await getJSON(`https://api.bilibili.com/x/web-interface/popular?ps=20&pn=${pn}`);
    push(data?.list);
    await sleep(800);
  }
  if (seen.size < TARGET_VIDEOS) {
    console.log(`· 拉取入站必刷 (当前 ${seen.size})`);
    const data = await getJSON(
      'https://api.bilibili.com/x/web-interface/popular/precious?page_size=100&page=1',
    );
    push(data?.list);
  }
  return [...seen.values()].slice(0, TARGET_VIDEOS);
}

async function collectHotSearch() {
  const data = await getJSON(
    'https://api.bilibili.com/x/web-interface/wbi/search/square?limit=10&platform=web',
  );
  const list = data?.trending?.list || [];
  return list.map((x, i) => ({ rank: i + 1, keyword: x.keyword, showName: x.show_name || x.keyword }));
}

// ---------------------------------------------------------------- 生成

const COMMENT_TEMPLATES = [
  '前排出售瓜子饮料花生毛巾～',
  'UP 主这期质量也太高了吧，已经三连！',
  '看完只想说一句：不愧是你。',
  '这个转场我倒回去看了八遍。',
  '本来只想看两分钟，结果看完了整期。',
  '给 UP 主的剪辑水平跪了 🧎',
  '标准的下饭视频，米饭都多吃了两碗。',
  '算法把我推到这里，感谢算法一次。',
  '弹幕护体，我先冲了。',
  '这期的 BGM 叫什么呀，好好听！',
  '每次 UP 更新都像过节一样。',
  '考研人路过，学累了来放松一下。',
  '已经二刷，还是好看。',
  '我不许还有人没看过这个视频。',
  '这波啊，这波是行为艺术。',
  '不知道该说什么，反正就是很牛。',
  '收藏夹吃灰第 999 个视频 +1。',
  '有被治愈到，谢谢 UP。',
  '硬核科普，建议收藏反复观看。',
  '啊这……属实有点上头了。',
];

const DANMAKU_TEMPLATES = [
  '前方高能', '哈哈哈哈哈哈', 'awsl', '爷青回', '这也太顶了吧', '2333333',
  '泪目', '有一说一，确实', '我裂开了', '经典', '名场面', '妙啊',
  '梦开始的地方', '打卡', '弹幕护体', '开始表演', '离谱', '好家伙',
  '这波不亏', '一键三连', '高能预警', '笑不活了', 'UP 主加油', '课代表来了',
];

function buildComments(video, ownerPool) {
  const n = 4 + (hash(video.bvid) % 5);
  const out = [];
  for (let i = 0; i < n; i++) {
    const seed = hash(video.bvid + '#' + i);
    const u = ownerPool[seed % ownerPool.length];
    out.push({
      id: `${video.bvid}-c${i}`,
      bvid: video.bvid,
      mid: u.mid,
      like: (seed % 4200) + 12,
      reply_count: seed % 7,
      content: COMMENT_TEMPLATES[seed % COMMENT_TEMPLATES.length],
      ctime: video.pubdate + 600 * (i + 1) + (seed % 86400),
    });
  }
  return out.sort((a, b) => b.like - a.like);
}

function buildDanmaku(video) {
  const n = 14 + (hash(video.bvid + 'd') % 10);
  const out = [];
  for (let i = 0; i < n; i++) {
    const seed = hash(video.bvid + 'dm' + i);
    out.push({
      id: `${video.bvid}-d${i}`,
      bvid: video.bvid,
      time: Number(((seed % 1000) / 100).toFixed(1)), // 演示片源约 10s
      mode: seed % 9 === 0 ? 'top' : 'scroll',
      color: seed % 11 === 0 ? '#fb7299' : seed % 7 === 0 ? '#ffd93d' : '#ffffff',
      text: DANMAKU_TEMPLATES[seed % DANMAKU_TEMPLATES.length],
    });
  }
  return out.sort((a, b) => a.time - b.time);
}

async function main() {
  await Promise.all([
    fs.mkdir(path.join(MEDIA, 'covers'), { recursive: true }),
    fs.mkdir(path.join(MEDIA, 'avatars'), { recursive: true }),
    fs.mkdir(path.join(MEDIA, 'videos'), { recursive: true }),
    fs.mkdir(DATA, { recursive: true }),
  ]);

  console.log('==> 采集视频列表');
  const raw = await collectRawVideos();
  if (raw.length === 0) {
    console.error('没有拿到任何视频数据，终止（已有 seed.json 保持不变）');
    process.exit(1);
  }
  console.log(`    共 ${raw.length} 条`);

  console.log('==> 采集热搜榜');
  const hotSearches = (await collectHotSearch()) || [];
  console.log(`    共 ${hotSearches.length} 条`);

  console.log('==> 下载演示片源');
  await mapLimit(SAMPLE_VIDEOS, 3, async ([name, url]) => {
    const ok = await download(url, path.join(MEDIA, 'videos', `${name}.mp4`));
    console.log(`    ${ok ? '✓' : '✗'} ${name}.mp4`);
  });
  const availableClips = [];
  for (const [name] of SAMPLE_VIDEOS) {
    try {
      const st = await fs.stat(path.join(MEDIA, 'videos', `${name}.mp4`));
      if (st.size > 100000) availableClips.push(`${name}.mp4`);
    } catch {}
  }
  if (availableClips.length === 0) throw new Error('没有可用的演示片源');

  console.log('==> 下载封面 / 头像（真实图片）');
  const okCover = new Set();
  await mapLimit(raw, 8, async (v) => {
    if (await download(v.pic, path.join(MEDIA, 'covers', `${v.bvid}.jpg`))) okCover.add(v.bvid);
  });
  const owners = new Map();
  for (const v of raw) {
    if (!owners.has(v.owner.mid)) owners.set(v.owner.mid, v.owner);
  }
  await mapLimit([...owners.values()], 8, async (o) => {
    await download(o.face, path.join(MEDIA, 'avatars', `${o.mid}.jpg`));
  });
  console.log(`    封面 ${okCover.size}/${raw.length}，UP 主 ${owners.size}`);

  const videos = raw.filter((v) => okCover.has(v.bvid));

  // 频道归属：优先真实分区映射，未命中的按 hash 均匀落到频道里，保证每个 tab 都有内容
  const counts = Object.fromEntries(CHANNELS.map((c) => [c.id, 0]));
  const assigned = videos.map((v) => {
    const realName = v.tnamev2 || v.tname || '';
    const parentName = v.pid_name_v2 || '';
    const id = CHANNEL_MAP[realName] || CHANNEL_MAP[parentName] || null;
    if (id) counts[id]++;
    return { v, id, realName: realName || parentName || '综合' };
  });
  const MIN_PER_CHANNEL = 5;
  for (const item of assigned) {
    if (item.id) continue;
    const hungry = CHANNELS.filter((c) => counts[c.id] < MIN_PER_CHANNEL);
    const pool = hungry.length ? hungry : CHANNELS;
    const pick = pool[hash(item.v.bvid) % pool.length];
    item.id = pick.id;
    counts[pick.id]++;
  }
  // 仍然稀疏的频道：从最大的频道里挪一部分过去（演示数据平衡，README 中已注明）
  for (const c of CHANNELS) {
    while (counts[c.id] < MIN_PER_CHANNEL) {
      const richest = CHANNELS.reduce((a, b) => (counts[a.id] >= counts[b.id] ? a : b));
      if (counts[richest.id] <= MIN_PER_CHANNEL) break;
      const donor = assigned.find((x) => x.id === richest.id);
      if (!donor) break;
      counts[richest.id]--;
      donor.id = c.id;
      counts[c.id]++;
    }
  }

  const ownerList = [...owners.values()].map((o) => ({
    mid: o.mid,
    name: o.name,
    face: `/media/avatars/${o.mid}.jpg`,
    sign: '',
    fans: 10000 + (hash(String(o.mid)) % 3_000_000),
    videoCount: 20 + (hash(String(o.mid) + 'v') % 800),
    level: 4 + (hash(String(o.mid) + 'l') % 3),
  }));

  const seedVideos = assigned.map(({ v, id, realName }, index) => {
    const h = hash(v.bvid);
    return {
      bvid: v.bvid,
      aid: v.aid,
      cid: v.cid,
      title: v.title,
      desc: (v.desc || '').slice(0, 400),
      cover: `/media/covers/${v.bvid}.jpg`,
      playUrl: `/media/videos/${availableClips[index % availableClips.length]}`,
      duration: v.duration,
      pubdate: v.pubdate,
      channelId: id,
      partitionName: realName,
      ownerMid: v.owner.mid,
      view: v.stat?.view ?? 0,
      danmaku: v.stat?.danmaku ?? 0,
      reply: v.stat?.reply ?? 0,
      favorite: v.stat?.favorite ?? 0,
      coin: v.stat?.coin ?? 0,
      share: v.stat?.share ?? 0,
      like: v.stat?.like ?? 0,
      copyright: v.copyright ?? 1,
      pubLocation: v.pub_location || '',
      width: v.dimension?.width || 1920,
      height: v.dimension?.height || 1080,
      hotScore: (v.stat?.view ?? 0) + (v.stat?.like ?? 0) * 5 + (h % 1000),
      tags: [realName, v.pid_name_v2 || '热门', h % 2 ? '热门推荐' : '每周必看'].filter(Boolean),
    };
  });

  const comments = seedVideos.flatMap((v) => buildComments(v, ownerList));
  const danmaku = seedVideos.flatMap((v) => buildDanmaku(v));

  const banners = [...seedVideos]
    .sort((a, b) => b.view - a.view)
    .slice(0, 6)
    .map((v, i) => ({
      id: `banner-${i + 1}`,
      bvid: v.bvid,
      title: v.title,
      image: v.cover,
      badge: ['热门', '独家', '新番', '热议', '必看', '活动'][i % 6],
    }));

  const seed = {
    generatedAt: new Date().toISOString(),
    source: 'bilibili public web API (popular / precious / search-square)',
    channels: CHANNELS,
    owners: ownerList,
    videos: seedVideos,
    comments,
    danmaku,
    banners,
    hotSearches,
  };

  const dest = path.join(DATA, 'seed.json');
  await fs.writeFile(dest + '.tmp', JSON.stringify(seed, null, 2));
  await fs.rename(dest + '.tmp', dest);
  console.log(
    `==> 写入 ${path.relative(process.cwd(), dest)}: ${seedVideos.length} 视频 / ${ownerList.length} UP 主 / ${comments.length} 评论 / ${danmaku.length} 弹幕`,
  );
  console.log('    频道分布:', Object.entries(counts).map(([k, n]) => `${k}:${n}`).join(' '));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
