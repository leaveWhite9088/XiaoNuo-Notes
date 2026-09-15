/**
 * 数据初始化：把 data/seed.json（B 站真实数据快照）+ data/banners.json
 * 装载进 SQLite，并派生标签、评论、弹幕、热搜等演示数据。
 *
 *   npm run seed                # 重建演示内容，保留用户互动/历史/评论/弹幕
 *   npm run seed -- --reset-user # 连用户数据一起清空
 */
import fs from 'node:fs';
import path from 'node:path';
import { config, ROOT_DIR } from '../config/index.js';
import { getDb, migrate, resetAllTables, resetSeedContent } from './sqlite.js';

interface SeedVideo {
  bvid: string;
  aid: number;
  cid: number;
  title: string;
  desc: string;
  cover: string;
  videoUrl: string;
  duration: number;
  pubdate: number;
  tname: string;
  categorySlug: string;
  play: number;
  danmaku: number;
  like: number;
  coin: number;
  favorite: number;
  reply: number;
  share: number;
  owner: { mid: number; name: string; face: string; avatar?: string };
}

interface SeedFile {
  categories: { slug: string; name: string; rid: number }[];
  videos: SeedVideo[];
  owners: { mid: number; name: string; avatar: string; sign: string }[];
}

/** 分区图标（前端 SVG sprite 的 symbol id） */
const ICONS: Record<string, string> = {
  all: 'home',
  douga: 'douga',
  music: 'music',
  dance: 'dance',
  game: 'game',
  knowledge: 'knowledge',
  tech: 'tech',
  sports: 'sports',
  car: 'car',
  life: 'life',
  food: 'food',
  animal: 'animal',
  kichiku: 'kichiku',
  fashion: 'fashion',
  ent: 'ent',
  movie: 'movie',
  documentary: 'documentary',
};

/**
 * 演示播放源的真实时长（秒）：由 scripts/probe-durations.mjs 用 ffprobe 实测得到，
 * 弹幕时间轴必须以它为准，避免出现超出片长的“幽灵弹幕”。
 */
function loadClipDurations(): Record<string, number> {
  const file = path.join(ROOT_DIR, 'data', 'clip-durations.json');
  if (!fs.existsSync(file)) {
    console.error('✖ 缺少 data/clip-durations.json，请先执行: npm run probe-durations');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, number>;
}

/** 弹幕安全的最后时间点（留 0.35s 余量，避免弹幕刚出现视频就结束） */
const DANMAKU_TAIL_MARGIN_MS = 350;

const COMMENT_POOL = [
  '前排！这个封面我就进来了',
  '这期质量真的高，UP主辛苦了',
  '考古的兄弟们集合',
  '已三连，希望能出下一期',
  '笑死我了，看到一半直接喷水',
  '终于等到更新，蹲了好久',
  '内容太顶了，建议反复观看',
  '这个BGM是什么呀，求歌名',
  '原来还可以这样，学到了',
  '弹幕护体，我先撤了',
  '看完之后整个人都通透了',
  'UP主的声音好治愈',
  '建议加精，这个信息量太大了',
  '十分钟讲明白我学了一学期的东西',
  '每次刷到都忍不住再看一遍',
  '小破站的内容质量真的一年比一年好',
  '这段剪辑太丝滑了，好评',
  'BGM一响，DNA动了',
  '全网最细的讲解，没有之一',
  '这个思路我可以直接用在项目里',
  '作者的审美在线，画面太舒服了',
  '收藏夹吃灰系列，但我还是收藏了',
  '从首页推荐点进来的，赚到了',
  '这个选题真的很有想法',
];

const DANMAKU_POOL = [
  '哈哈哈哈哈',
  '前方高能',
  'awsl',
  '谢谢UP主',
  '来了来了',
  '泪目',
  '爷青回',
  '这波操作可以',
  '名场面',
  '此处应有掌声',
  '太真实了',
  '打卡',
  '三连了',
  '第一次见',
  '好家伙',
  '666',
  '求BGM',
  '建议收藏',
  '高能预警',
  '绝了绝了',
  '这就是实力吗',
  '已加入收藏夹',
  '考古成功',
  '开头就跪了',
];

const DANMAKU_COLORS = ['#ffffff', '#ffffff', '#ffffff', '#FF6699', '#66CCFF', '#FFD700', '#7CFC00'];

/** 稳定伪随机，保证每次 seed 结果一致 */
function makeRandom(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 0xffffffff;
  };
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function deriveTags(v: SeedVideo, categoryName: string): string[] {
  const tags = new Set<string>();
  if (v.tname) tags.add(v.tname);
  tags.add(categoryName);
  const chunks = v.title
    .split(/[\s,，。！!？?、：:；;“”"'【】\[\]（）()|/\\]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2 && s.length <= 12);
  for (const c of chunks.slice(0, 3)) tags.add(c);
  tags.add('bilibili');
  return [...tags].slice(0, 6);
}

export function runSeed(): void {
  if (!fs.existsSync(config.seedFile)) {
    console.error(`✖ 缺少 ${config.seedFile}，请先执行: npm run fetch-data`);
    process.exit(1);
  }
  const seed = JSON.parse(fs.readFileSync(config.seedFile, 'utf8')) as SeedFile;
  const clipDurations = loadClipDurations();
  const bannerFile = `${config.publicDir}/../data/banners.json`;
  const banners = fs.existsSync(bannerFile)
    ? (JSON.parse(fs.readFileSync(bannerFile, 'utf8')) as {
        title: string;
        subtitle: string;
        image: string;
        link: string;
      }[])
    : [];

  // 默认只重建演示内容，保留用户产生的互动 / 历史 / 评论 / 弹幕
  const resetUser = process.argv.includes('--reset-user');
  migrate();
  if (resetUser) {
    console.warn('⚠ --reset-user：将同时清空用户互动 / 历史 / 评论 / 弹幕');
    resetAllTables();
  } else {
    resetSeedContent();
  }

  const db = getDb();

  // ---------- 分区 ----------
  const catStmt = db.prepare(
    'INSERT OR REPLACE INTO categories (slug, name, rid, icon, sort) VALUES (?,?,?,?,?)',
  );
  seed.categories.forEach((c, i) => catStmt.run(c.slug, c.name, c.rid, ICONS[c.slug] ?? 'home', i));

  // ---------- 分区再平衡：保证每个分区都有足够内容可筛选演示 ----------
  const MIN_PER_CATEGORY = 10;
  const counts = new Map<string, number>();
  seed.videos.forEach((v) => counts.set(v.categorySlug, (counts.get(v.categorySlug) ?? 0) + 1));
  const catSlugs = seed.categories.filter((c) => c.slug !== 'all').map((c) => c.slug);
  const need = (slug: string) => Math.max(0, MIN_PER_CATEGORY - (counts.get(slug) ?? 0));
  const donors = [...seed.videos].sort((a, b) => a.play - b.play).filter((v) => (counts.get(v.categorySlug) ?? 0) > 24);
  let donorIdx = 0;
  for (const slug of catSlugs) {
    let missing = need(slug);
    while (missing > 0 && donorIdx < donors.length) {
      const donor = donors[donorIdx++];
      const from = donor.categorySlug;
      if ((counts.get(from) ?? 0) <= MIN_PER_CATEGORY) continue;
      counts.set(from, (counts.get(from) ?? 0) - 1);
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
      donor.categorySlug = slug;
      missing--;
    }
  }

  // ---------- 播放源真实时长（ffprobe 实测值） ----------
  const clipDuration = (url: string): number => {
    const file = url.split('/').pop() ?? '';
    const duration = clipDurations[file];
    if (!duration) throw new Error(`播放源 ${file} 缺少真实时长，请重跑 npm run probe-durations`);
    return duration;
  };

  // ---------- UP 主 ----------
  const ownerStats = new Map<number, { fans: number; videos: number }>();
  for (const v of seed.videos) {
    const cur = ownerStats.get(v.owner.mid) ?? { fans: 0, videos: 0 };
    cur.videos += 1;
    cur.fans += Math.floor(v.play / 6) + v.like;
    ownerStats.set(v.owner.mid, cur);
  }
  const ownerStmt = db.prepare(
    'INSERT OR REPLACE INTO owners (mid, name, avatar, sign, fans, videos) VALUES (?,?,?,?,?,?)',
  );
  const seedOwners = new Map(seed.owners.map((o) => [o.mid, o]));
  for (const [mid, stat] of ownerStats) {
    const meta = seedOwners.get(mid);
    const name = meta?.name ?? seed.videos.find((v) => v.owner.mid === mid)?.owner.name ?? `UP主${mid}`;
    ownerStmt.run(
      mid,
      name,
      meta?.avatar || '',
      meta?.sign ?? '这个人很神秘，什么都没有写',
      stat.fans,
      stat.videos,
    );
  }

  // ---------- 视频 + 标签 + 评论 + 弹幕 ----------
  const videoStmt = db.prepare(`
    INSERT OR REPLACE INTO videos (bvid, aid, cid, title, description, cover, video_url, duration, clip_duration,
      pubdate, tname, category_slug, play, danmaku, like_count, coin, favorite, reply, share, owner_mid, hot_score)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);
  const tagStmt = db.prepare('INSERT INTO tags (bvid, name) VALUES (?, ?)');
  const commentStmt = db.prepare(
    `INSERT INTO comments (bvid, author, avatar, content, like_count, source, created_at)
     VALUES (?,?,?,?,?,'seed',?)`,
  );
  const danmakuStmt = db.prepare(
    `INSERT INTO danmaku (bvid, time_ms, text, color, mode, source)
     VALUES (?,?,?,?,?,'seed')`,
  );
  const catName = new Map(seed.categories.map((c) => [c.slug, c.name]));
  const ownerNames = seed.videos.map((v) => v.owner.name);

  seed.videos.forEach((v, index) => {
    const rnd = makeRandom(hash(v.bvid));
    const hoursAge = Math.floor(rnd() * 72) + 1;
    const hot = Math.log10(v.play + 10) * 40 + Math.log10(v.like + 10) * 30 + Math.max(0, 72 - hoursAge) * 2 + rnd() * 20;

    videoStmt.run(
      v.bvid,
      v.aid,
      v.cid,
      v.title,
      v.desc,
      v.cover,
      v.videoUrl,
      v.duration,
      clipDuration(v.videoUrl),
      v.pubdate,
      v.tname,
      v.categorySlug,
      v.play,
      v.danmaku,
      v.like,
      v.coin,
      v.favorite,
      v.reply,
      v.share,
      v.owner.mid,
      Math.round(hot * 100) / 100,
    );

    for (const t of deriveTags(v, catName.get(v.categorySlug) ?? '综合')) tagStmt.run(v.bvid, t);

    // 评论：3~6 条，作者取自真实 UP 主名与网友昵称混合
    const commentCount = 3 + Math.floor(rnd() * 4);
    const picked = new Set<string>();
    for (let i = 0; i < commentCount; i++) {
      const text = COMMENT_POOL[Math.floor(rnd() * COMMENT_POOL.length)];
      if (picked.has(text)) continue;
      picked.add(text);
      const useUp = rnd() > 0.7;
      const author = useUp
        ? ownerNames[Math.floor(rnd() * ownerNames.length)]
        : `${['阿', '小', '老', '大', '萌', '咸', '柠', '星', '夜', '风'][Math.floor(rnd() * 10)]}${['柴', '白', '鱼', '酱', '子', '猫', '酱', '糖', '鹿', '柚'][Math.floor(rnd() * 10)]}${Math.floor(rnd() * 900 + 100)}`;
      commentStmt.run(
        v.bvid,
        author,
        '',
        text,
        Math.floor(rnd() * 4200),
        Math.floor(Date.now() / 1000) - Math.floor(rnd() * 86400 * 20) - 60,
      );
    }

    // 弹幕：严格裁剪在演示片长之内（真实时长 - 0.35s 余量）
    const clip = clipDuration(v.videoUrl);
    const lastMs = Math.max(200, Math.floor(clip * 1000) - DANMAKU_TAIL_MARGIN_MS);
    const danmakuCount = 26 + Math.floor(rnd() * 22);
    for (let i = 0; i < danmakuCount; i++) {
      const t = Math.min(lastMs, Math.round(rnd() * lastMs) + 100);
      danmakuStmt.run(
        v.bvid,
        t,
        DANMAKU_POOL[Math.floor(rnd() * DANMAKU_POOL.length)],
        DANMAKU_COLORS[Math.floor(rnd() * DANMAKU_COLORS.length)],
        1,
      );
    }

    if (index % 60 === 0) console.log(`  ... 装载 ${index}/${seed.videos.length}`);
  });

  // ---------- 轮播 ----------
  const bannerStmt = db.prepare(
    'INSERT INTO banners (title, subtitle, image, link, sort) VALUES (?,?,?,?,?)',
  );
  banners.forEach((b, i) => bannerStmt.run(b.title, b.subtitle, b.image, b.link, i));

  // ---------- 热搜 ----------
  const hotStmt = db.prepare('INSERT OR IGNORE INTO hot_searches (keyword, sort) VALUES (?, ?)');
  const hotKeywords = [
    ...seed.videos
      .slice()
      .sort((a, b) => b.play - a.play)
      .slice(0, 9)
      .map((v) => {
        // 取标题的第一个语义片段作为热搜词，避免生硬截断
        const clean = v.title.replace(/[【】\[\]「」《》""]/g, '');
        const seg = clean.split(/[\s,，。！!？?、：:；;|/\\]+/)[0] ?? clean;
        return seg.length >= 4 ? seg.slice(0, 14) : clean.slice(0, 14);
      }),
    '哔哩哔哩向前冲',
    '万物皆可鬼畜',
    '考研数学',
  ];
  hotKeywords.forEach((k, i) => hotStmt.run(k, i));

  // ---------- 初始观看历史（仅首次初始化时写入，避免覆盖用户真实历史） ----------
  const historyCount = (
    db.prepare('SELECT COUNT(*) AS c FROM watch_history').get() as { c: number }
  ).c;
  if (historyCount === 0) {
    const historyStmt = db.prepare(
      'INSERT INTO watch_history (bvid, progress, watched_at) VALUES (?,?, strftime(\'%s\',\'now\') - ?)',
    );
    seed.videos.slice(0, 4).forEach((v, i) => historyStmt.run(v.bvid, 0.3 + i * 0.15, i * 3600 + 600));
  }

  // ---------- 装载后数据体检 ----------
  verifyData(db, clipDurations);

  const total = (db.prepare('SELECT COUNT(*) AS c FROM videos').get() as { c: number }).c;
  console.log(
    `✔ 数据装载完成: ${total} 视频 / ${ownerStats.size} UP主 / ${catSlugs.length} 分区 / ${banners.length} 轮播图`,
  );
}

/** 装载后自检：封面引用必须逐个存在（区分大小写）、弹幕不得超出片长 */
function verifyData(db: ReturnType<typeof getDb>, clipDurations: Record<string, number>): void {
  const coverDir = path.join(config.publicDir, 'media', 'covers');
  const files = new Set(fs.readdirSync(coverDir));
  const rows = db.prepare('SELECT bvid, cover, video_url, clip_duration FROM videos').all() as unknown as {
    bvid: string;
    cover: string;
    video_url: string;
    clip_duration: number;
  }[];

  const missing = rows.filter((r) => !files.has(r.cover.split('/').pop() ?? ''));
  if (missing.length) {
    console.error(`✖ 有 ${missing.length} 个封面引用在磁盘上不存在（大小写敏感）:`);
    missing.slice(0, 5).forEach((m) => console.error(`   ${m.bvid} -> ${m.cover}`));
    process.exit(1);
  }

  const problems: string[] = [];
  let danmakuTotal = 0;
  for (const [file, seconds] of Object.entries(clipDurations)) {
    const maxMs = Math.floor(seconds * 1000);
    const over = db
      .prepare(
        `SELECT COUNT(*) AS c FROM danmaku d JOIN videos v ON v.bvid = d.bvid
         WHERE v.video_url LIKE ? AND d.time_ms > ?`,
      )
      .get(`%${file}`, maxMs) as { c: number };
    if (over.c > 0) problems.push(`${file}: ${over.c} 条弹幕超出片长 ${maxMs}ms`);
  }
  danmakuTotal = (db.prepare('SELECT COUNT(*) AS c FROM danmaku').get() as { c: number }).c;
  if (problems.length) {
    console.error('✖ 弹幕时间轴异常：');
    problems.forEach((p) => console.error(`   ${p}`));
    process.exit(1);
  }

  const byCat = db
    .prepare('SELECT category_slug AS slug, COUNT(*) AS c FROM videos GROUP BY category_slug ORDER BY c DESC')
    .all() as unknown as { slug: string; c: number }[];
  const perClip = Object.keys(clipDurations).map((file) => {
    const r = db
      .prepare('SELECT COUNT(*) AS c FROM videos WHERE video_url LIKE ?')
      .get(`%${file}`) as { c: number };
    return `${file}=${r.c}`;
  });

  console.log(`✔ 数据体检通过: ${rows.length} 个封面引用全部存在（大小写一致）/ 弹幕 ${danmakuTotal} 条均未超出片长`);
  console.log(`  分区分布: ${byCat.map((r) => `${r.slug}:${r.c}`).join(' ')}`);
  console.log(`  播放源分布: ${perClip.join(' ')}`);
}

/** 直接执行 `tsx src/db/seed.ts` 时才自动装载（被 ensure.ts 导入时由调用方决定） */
const invoked = process.argv[1]?.replace(/\\/g, '/') ?? '';
if (invoked.endsWith('/seed.ts') || invoked.endsWith('/seed.js')) {
  runSeed();
}
