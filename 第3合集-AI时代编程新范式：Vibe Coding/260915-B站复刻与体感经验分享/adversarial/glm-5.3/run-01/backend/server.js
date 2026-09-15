/**
 * 哔哩哔哩首页复刻 —— 后端服务（端口固定 5802）。
 *
 * 职责：
 *  1. 数据 API：首页 feed / 分类筛选 / 视频详情(含相关推荐) / 搜索 / 搜索建议 / 排行榜
 *  2. 静态媒体：/media/covers、/media/faces、/media/videos（真实封面、头像与可播放示例片段）
 *
 * 数据来自 backend/data/videos.json（由 scripts/fetch-data.mjs 抓取的 B 站真实排行榜快照）。
 * 评论与弹幕为本地合成内容（B 站相关接口需要登录态，见 README 简化项）。
 */
import express from 'express';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PORT = 5802;
const ROOT = path.dirname(fileURLToPath(import.meta.url));

const { items: RAW_ITEMS = [], fetchedAt } = JSON.parse(await readFile(path.join(ROOT, 'data', 'videos.json'), 'utf8'));
const ITEMS = RAW_ITEMS.filter((it) => it.cover && it.ownerFace && it.playUrl);
const byId = new Map(ITEMS.map((it) => [it.bvid, it]));
console.log(`[data] 载入 ${ITEMS.length} 条视频快照（抓取于 ${fetchedAt}）`);

/* ---------------- 排序策略（确定性，保证分页稳定） ---------------- */
const byView = (a, b) => b.stat.view - a.stat.view;
const FEED_ORDERS = {
  recommend: (list) => [...list].sort((a, b) => a.hotRank - b.hotRank || byView(a, b)),
  hot: (list) => [...list].sort(byView),
};
const feedOrdered = (category) => {
  if (category && category !== 'recommend' && category !== 'hot') {
    return ITEMS.filter((it) => it.region === category).sort(byView);
  }
  return (FEED_ORDERS[category] ?? FEED_ORDERS.recommend)(ITEMS);
};

/* ---------------- 分类定义 ---------------- */
const PSEUDO_CATEGORIES = [
  { key: 'recommend', label: '推荐' },
  { key: 'hot', label: '热门' },
];
const regionCategories = [...new Map(ITEMS.map((it) => [it.region, it])).values()]
  .map((it) => ({ key: it.region, label: it.regionLabel }))
  .sort((a, b) => {
    const chips = ['anime', 'music', 'dance', 'game', 'knowledge', 'food', 'life', 'ent'];
    return chips.indexOf(a.key) - chips.indexOf(b.key);
  });

/* ---------------- 搜索建议 ---------------- */
const SUGGEST_SOURCE = ITEMS.flatMap((it) => [
  { text: it.title.slice(0, 24), weight: it.stat.view },
  { text: it.owner.name, weight: Math.floor(it.stat.view / 10) },
  { text: it.tname, weight: Math.floor(it.stat.view / 20) },
]).filter((s) => s.text.trim().length >= 1);

/* ---------------- 评论 / 弹幕合成（确定性伪随机） ---------------- */
function hash32(s) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const COMMENT_POOL = [
  '前方高能预警，注意脚下',
  '这期质量真的高，三连了',
  '蹲一个下集，UP 加更！',
  '看完了，浑身舒坦',
  '名场面，先码后看',
  'BGM 一响，DNA 动了',
  '开头以为一般，后面直接封神',
  '跪着看完的，太强了',
  '这个转场丝滑得离谱',
  '每天一遍，防止抑郁',
  '夹带私货警告（狗头）',
  '这运镜是用了心的',
  '考古成功，居然刷到了',
  '字幕组辛苦了',
  '妈妈问我为什么跪着看手机',
  '泪目，最后一秒破防了',
  '进度条撑住啊，别走',
  '弹幕里全是人才',
  '已投币，UP 拿去恰饭吧',
  '这期收藏了，慢慢品',
  '反复观看第 N 遍',
  '细节拉满，二刷发现好多彩蛋',
  '一路快进着看完，还是回来补票',
  '前排围观，沙发是我',
  '结尾太仓促了吧，意难平',
  '画质 progres，耳朵怀孕',
  '这就是青春啊',
  '看完只想说： respect',
];
const DANMAKU_POOL = [
  '前方高能', '哈哈哈哈哈', '此处应有掌声', '名场面打卡', '泪目', 'DD 是第一生产力',
  '保护UP主', '三连走起', '这波在大气层', '有内味了', '爷青回', 'DNA 动了',
  '好活当赏', '标记一下，回头再看', '进度条别走', '良心作品', '镇站之宝预定',
  '一秒都不能快进', '这运镜绝了', '耳朵怀孕了', '前方泪目预警', '打卡', 'awsl',
  '弹幕护体', '课代表来了', '蹲后续', '110 万播放预定', '这才是 B 站该有的样子',
];
const TIMEAGO_POOL = ['3分钟前', '22分钟前', '1小时前', '3小时前', '8小时前', '1天前', '2天前', '6天前', '1周前', '3周前', '1个月前'];

function synthesizeComments(video, count = 20) {
  const rand = mulberry32(hash32(video.bvid));
  const authors = [...new Map(ITEMS.map((i) => [i.owner.mid, i.owner])).values()];
  const list = [];
  for (let i = 0; i < count; i++) {
    const author = authors[Math.floor(rand() * authors.length)];
    const likes = Math.floor(rand() ** 3 * 8000);
    list.push({
      id: `${video.bvid}-c${i}`,
      user: { name: author.name, face: `/media/faces/${author.mid}.webp` },
      content: COMMENT_POOL[Math.floor(rand() * COMMENT_POOL.length)],
      time: TIMEAGO_POOL[Math.floor(rand() * TIMEAGO_POOL.length)],
      likes,
      liked: false,
      replyCount: Math.floor(rand() * 40),
    });
  }
  return list.sort((a, b) => b.likes - a.likes);
}

function danmakuPool(video, count = 30) {
  const rand = mulberry32(hash32(video.bvid + 'dm'));
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push({ time: Math.floor(rand() * 50), text: DANMAKU_POOL[Math.floor(rand() * DANMAKU_POOL.length)] });
  }
  return out.sort((a, b) => a.time - b.time);
}

/* ---------------- 对外视图（裁剪字段） ---------------- */
const cardView = (it) => ({
  bvid: it.bvid,
  title: it.title,
  cover: it.cover,
  duration: it.duration,
  pubdate: it.pubdate,
  region: it.region,
  regionLabel: it.regionLabel,
  tname: it.tname,
  owner: it.owner,
  stat: { view: it.stat.view, danmaku: it.stat.danmaku, like: it.stat.like },
  playUrl: it.playUrl,
});

/* ---------------- App ---------------- */
export function createApp() {
  const app = express();
  app.use((req, _res, next) => {
    console.log(`[api] ${req.method} ${req.originalUrl}`);
    next();
  });
  app.use('/media', express.static(path.join(ROOT, 'public'), { maxAge: '7d' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true, port: PORT, videos: ITEMS.length, fetchedAt }));

  app.get('/api/categories', (_req, res) => {
    res.json({ chips: [...PSEUDO_CATEGORIES, ...regionCategories.filter((c) => CHIP_KEYS.includes(c.key))], menu: regionCategories.filter((c) => !CHIP_KEYS.includes(c.key)) });
  });

  app.get('/api/feed', (req, res) => {
    const category = String(req.query.category || 'recommend');
    const pagesize = Math.min(Math.max(parseInt(req.query.pagesize) || 30, 1), 50);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const ordered = feedOrdered(category);
    const start = (page - 1) * pagesize;
    const slice = ordered.slice(start, start + pagesize);
    res.json({ category, page, pagesize, total: ordered.length, hasMore: start + pagesize < ordered.length, list: slice.map(cardView) });
  });

  app.get('/api/video/:id', (req, res) => {
    const it = byId.get(req.params.id);
    if (!it) return res.status(404).json({ code: 404, message: '视频不存在' });
    const sameRegion = ITEMS.filter((o) => o.region === it.region && o.bvid !== it.bvid).sort(byView);
    const others = ITEMS.filter((o) => o.region !== it.region && o.bvid !== it.bvid).sort(byView);
    const related = [...sameRegion, ...others].slice(0, 12).map(cardView);
    res.json({
      video: {
        ...cardView(it),
        desc: it.desc,
        aid: it.aid,
        stat: it.stat,
        owner: { ...it.owner, face: it.ownerFace },
      },
      related,
      comments: synthesizeComments(it),
      danmaku: danmakuPool(it),
      totalComments: it.stat.reply,
    });
  });

  app.get('/api/suggest', (req, res) => {
    const q = String(req.query.q || '').trim().toLowerCase();
    if (!q) {
      const trend = [...ITEMS].sort(byView).slice(0, 10).map((it, i) => ({
        text: it.title.slice(0, 20),
        heat: it.stat.view,
        rank: i + 1,
        type: 'trend',
      }));
      return res.json({ q, list: trend });
    }
    const seen = new Set();
    const list = SUGGEST_SOURCE.filter((s) => {
      if (seen.has(s.text)) return false;
      if (!s.text.toLowerCase().includes(q)) return false;
      seen.add(s.text);
      return true;
    })
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10)
      .map((s) => ({ text: s.text, type: 'match' }));
    res.json({ q, list });
  });

  app.get('/api/search', (req, res) => {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ q, list: [], total: 0 });
    const lower = q.toLowerCase();
    const hits = ITEMS.filter(
      (it) =>
        it.title.toLowerCase().includes(lower) ||
        it.owner.name.toLowerCase().includes(lower) ||
        it.tname.toLowerCase().includes(lower) ||
        it.regionLabel.includes(q),
    ).sort(byView);
    const pagesize = Math.min(Math.max(parseInt(req.query.pagesize) || 30, 1), 50);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const start = (page - 1) * pagesize;
    res.json({ q, page, pagesize, total: hits.length, hasMore: start + pagesize < hits.length, list: hits.slice(start, start + pagesize).map(cardView) });
  });

  app.get('/api/rank', (req, res) => {
    const category = String(req.query.category || 'all');
    const pool = category === 'all' ? ITEMS : ITEMS.filter((it) => it.region === category);
    res.json({ list: [...pool].sort((a, b) => b.stat.like - a.stat.like).slice(0, 10).map((it) => ({ bvid: it.bvid, title: it.title, cover: it.cover, owner: it.owner.name, view: it.stat.view, like: it.stat.like })) });
  });

  app.use((_req, res) => res.status(404).json({ code: 404, message: 'not found' }));

  return app;
}

const CHIP_KEYS = ['anime', 'music', 'dance', 'game', 'knowledge', 'food', 'life', 'ent'];

// 直接运行时监听固定端口 5802（可用 PORT 覆盖）；被测试 import 时不监听
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const port = Number(process.env.PORT) || 5802;
  createApp().listen(port, () => {
    console.log(`[bili-clone-backend] http://localhost:${port}  (API: /api/*, 媒体: /media/*)`);
  });
}
