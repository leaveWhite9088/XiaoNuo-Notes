/**
 * 数据导入脚本（ETL）：
 *   抽取 Extract —— B站公开接口（排行榜 / 热门 / 热搜 / 评论 / 弹幕）
 *   转换 Transform —— 归一化字段、计算热度、生成轮播与排行
 *   装载 Load      —— 写入 SQLite
 *
 * 用法:
 *   npm run seed            正常导入（已有数据时跳过）
 *   npm run seed -- --force 清空后重新导入
 */
import fs from 'node:fs';
import path from 'node:path';
import { CATEGORIES, TID_TO_SLUG, PGC_ZONES } from '../src/db/categories.js';
import config, { ROOT_DIR } from '../src/config/index.js';
import { getDB, run, get, transaction } from '../src/db/index.js';
import categoryRepository from '../src/repositories/categoryRepository.js';
import videoRepository from '../src/repositories/videoRepository.js';
import userRepository from '../src/repositories/userRepository.js';
import bannerRepository from '../src/repositories/bannerRepository.js';
import commentRepository from '../src/repositories/commentRepository.js';
import danmakuRepository from '../src/repositories/danmakuRepository.js';
import pgcRepository from '../src/repositories/pgcRepository.js';
import searchRepository from '../src/repositories/searchRepository.js';
import bilibiliClient from '../src/services/bilibiliClient.js';
import { fetchJSON, fetchJSONWithRetry, sleep } from '../src/utils/http.js';
import { parseDanmakuXML, parseDanmakuProtobuf } from '../src/utils/danmaku.js';
import { createLogger } from '../src/utils/logger.js';

const log = createLogger('seed');
const force = process.argv.includes('--force');
/** --refresh 忽略原始数据缓存，强制重新抓取上游 */
const refresh = process.argv.includes('--refresh');

/* ------------------------------ 工具 ------------------------------ */

/** 并发受限的批量执行，避免触发上游限流 */
async function mapLimit(items, limit, worker) {
  const results = [];
  let index = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = index++;
      try {
        results[current] = await worker(items[current], current);
      } catch (err) {
        log.warn(`任务失败 [${current}] ${err.message}`);
        results[current] = null;
      }
    }
  });
  await Promise.all(runners);
  return results;
}

function computeScore(stat = {}) {
  const view = stat.view || 0;
  const like = stat.like || 0;
  const coin = stat.coin || 0;
  const favorite = stat.favorite || 0;
  const reply = stat.reply || 0;
  const danmaku = stat.danmaku || 0;
  // 加权热度：互动权重远高于播放，贴近 B站“综合排序”的手感
  const raw = view * 1 + like * 3 + coin * 10 + favorite * 8 + reply * 20 + danmaku * 4;
  return Math.round(raw / 100) / 10;
}

/** 从视频标题提取标签：命中分区名 / 常见词则作为标签 */
const TAG_DICT = [
  '直播', '解说', '评测', '开箱', '教程', '攻略', '整活', '高能', '沙雕', '搞笑',
  '动画', '游戏', '音乐', '舞蹈', '美食', '旅行', 'vlog', '手书', '混剪', '翻唱',
  'AI', '编程', '考研', '科普', '历史', '数码', '手机', '相机', '汽车', '穿搭',
  '健身', '萌宠', '猫', '狗', '电影', '电视剧', '综艺', '纪录片', '鬼畜', 'MAD',
];

function extractTags(title = '', tname = '') {
  const tags = new Set();
  if (tname) tags.add(tname);
  for (const word of TAG_DICT) {
    if (title.includes(word)) tags.add(word);
  }
  return [...tags].slice(0, 6);
}

/** 视频 -> DB 记录（categoryId 由上层决定：排行榜分区优先，其次二级 tid 映射） */
function toRecord(item, categoryId) {
  const owner = item.owner || {};
  return {
    bvid: item.bvid,
    aid: item.aid,
    cid: item.cid ?? null,
    title: (item.title || '').trim(),
    description: (item.desc || '').slice(0, 300),
    cover: item.pic || '',
    duration: item.duration || 0,
    categoryId,
    tags: extractTags(item.title, item.tname),
    ownerMid: owner.mid,
    ownerName: owner.name,
    ownerFace: owner.face,
    pubdate: item.pubdate || 0,
    stats: {
      view: item.stat?.view || 0,
      danmaku: item.stat?.danmaku || 0,
      reply: item.stat?.reply || 0,
      favorite: item.stat?.favorite || 0,
      coin: item.stat?.coin || 0,
      share: item.stat?.share || 0,
      likeCount: item.stat?.like || 0,
      score: computeScore(item.stat),
    },
  };
}

/* ------------------------------ Extract ------------------------------ */

/**
 * 分区排行抓取：B站限流较敏感，这里做「校验 code + 退避重试」，
 * 避免把限流当成「该分区没有内容」。
 */
async function rankingFor(rid, { retries = 5 } = {}) {
  let lastError = 'unknown';
  for (let i = 0; i < retries; i += 1) {
    try {
      const res = await fetchJSON(
        `https://api.bilibili.com/x/web-interface/ranking/v2?rid=${rid}&type=all`,
      );
      if (res.code === 0 && Array.isArray(res.data?.list) && res.data.list.length) {
        return res.data.list;
      }
      lastError = `code=${res.code} ${res.message || ''}`;
    } catch (err) {
      lastError = err.message;
    }
    await sleep(800 * (i + 1));
  }
  throw new Error(`排行榜重试 ${retries} 次仍失败: ${lastError}`);
}

/**
 * 原始数据落盘缓存。
 * B站对连续抓取有风控（-352/-412），把每次成功抓到的原始响应累积保存，
 * 后续 seed 直接复用，既避免重复抓取，也保证多次运行之间数据只增不减。
 */
const RAW_FILE = path.join(ROOT_DIR, 'data', 'raw-seed.json');

function loadRawCache() {
  try {
    return JSON.parse(fs.readFileSync(RAW_FILE, 'utf8'));
  } catch {
    return { rankings: {}, popular: [], hotSearches: [], pgc: {} };
  }
}

function saveRawCache(cache) {
  cache.updatedAt = new Date().toISOString();
  fs.mkdirSync(path.dirname(RAW_FILE), { recursive: true });
  fs.writeFileSync(RAW_FILE, JSON.stringify(cache));
  const size = (fs.statSync(RAW_FILE).size / 1024 / 1024).toFixed(2);
  log.info(`原始数据已缓存 → data/raw-seed.json (${size}MB)`);
}

async function extractVideos() {
  const cache = loadRawCache();
  const byBvid = new Map();
  const rankingByCategory = new Map();
  const failures = [];
  let fromCache = 0;
  let fetched = 0;

  // ---- ① 分区排行榜（缓存优先） ----
  log.info('① 抓取分区排行榜 ...');
  for (const cat of CATEGORIES) {
    const cached = cache.rankings[cat.slug];
    if (Array.isArray(cached) && cached.length && !refresh) {
      rankingByCategory.set(cat.slug, cached.map((it) => it.bvid));
      for (const item of cached) {
        if (!item.bvid || byBvid.has(item.bvid)) continue;
        byBvid.set(item.bvid, { item, categorySlug: cat.slug });
      }
      fromCache += 1;
      log.info(`   · ${cat.name.padEnd(5)} 排行 ${cached.length} 条（缓存）`);
      continue;
    }

    try {
      const items = await rankingFor(cat.rid, { retries: 3 });
      cache.rankings[cat.slug] = items;
      rankingByCategory.set(cat.slug, items.map((it) => it.bvid));
      for (const item of items) {
        if (!item.bvid || byBvid.has(item.bvid)) continue;
        byBvid.set(item.bvid, { item, categorySlug: cat.slug });
      }
      fetched += 1;
      log.info(`   · ${cat.name.padEnd(5)} 排行 ${items.length} 条`);
    } catch (err) {
      failures.push(cat.name);
      log.warn(`   · ${cat.name} 抓取失败: ${err.message}`);
    }
    await sleep(2500);
  }
  saveRawCache(cache);

  if (failures.length) {
    log.warn(`本次未取到数据的排行分区：${failures.join('、')}（缓存/热点映射仍会补充内容）`);
  }

  // ② 全站热门 / 每周必看 / 入站必刷（缓存累积，作为二级分区映射的主要来源）
  log.info('② 抓取全站热门与精选合集 ...');
  if (!refresh) {
    for (const item of cache.popular) {
      if (!item.bvid || byBvid.has(item.bvid)) continue;
      byBvid.set(item.bvid, { item, categorySlug: null });
    }
    log.info(`   · 复用缓存热门 ${cache.popular.length} 条`);
  }

  const popularSources = [
    ...Array.from({ length: 5 }, (_, i) => ({
      name: `热门第 ${i + 1} 页`,
      url: `https://api.bilibili.com/x/web-interface/popular?ps=50&pn=${i + 1}`,
    })),
    { name: '入站必刷', url: 'https://api.bilibili.com/x/web-interface/popular/precious?page_size=50&page=1' },
    { name: '每周必看', url: 'https://api.bilibili.com/x/web-interface/popular/series/one?number=1' },
  ];

  const freshPopular = [];
  for (const source of popularSources) {
    try {
      const res = await fetchJSON(source.url);
      const list = res.data?.list || [];
      for (const item of list) {
        freshPopular.push(item);
        if (!item.bvid || byBvid.has(item.bvid)) continue;
        byBvid.set(item.bvid, { item, categorySlug: null });
      }
      log.info(`   · ${source.name} +${list.length}（累计 ${byBvid.size}）`);
    } catch (err) {
      log.warn(`   · ${source.name} 失败: ${err.message}`);
    }
    await sleep(1200);
  }

  // 合并去重后写回缓存
  const popularMap = new Map(cache.popular.map((it) => [it.bvid, it]));
  for (const item of freshPopular) if (item?.bvid) popularMap.set(item.bvid, item);
  cache.popular = [...popularMap.values()];
  saveRawCache(cache);

  log.info(`③ 抽取完成：去重后 ${byBvid.size} 个视频（排行缓存 ${fromCache} 个分区 / 本次新抓 ${fetched} 个）`);
  return { byBvid, rankingByCategory };
}

async function extractHotSearches() {
  log.info('④ 抓取真实热搜 ...');
  const cache = loadRawCache();
  if (cache.hotSearches?.length && !refresh) {
    log.info(`   · 复用缓存热搜 ${cache.hotSearches.length} 条`);
    return cache.hotSearches;
  }
  try {
    const res = await fetchJSON('https://s.search.bilibili.com/main/hotword');
    const list = (res.list || [])
      .map((it, i) => ({
        keyword: (it.show_name || it.keyword || '').trim(),
        tag: i < 3 ? '热' : '',
        heat: it.heat_score || 0,
      }))
      .filter((it) => it.keyword);
    if (list.length) {
      cache.hotSearches = list.slice(0, 10);
      saveRawCache(cache);
      return cache.hotSearches;
    }
  } catch (err) {
    log.warn(`热搜接口失败: ${err.message}`);
  }
  // 兜底：从分区名生成
  return CATEGORIES.slice(0, 10).map((c) => ({ keyword: c.name, tag: '', heat: 0 }));
}

/** 首页二级导航图（真实 banner 图来自首页 SSR，此处从视频封面派生保证可用） */
function buildBanners(videos) {
  return videos.slice(0, 8).map((v, i) => ({
    title: v.title.slice(0, 40),
    subtitle: `${v.ownerName} · ${v.stats.viewText || ''}`,
    image: `${v.cover.split('@')[0]}@976w_550h_1c`,
    link: `/video/${v.bvid}`,
    bvid: v.bvid,
    badge: i === 0 ? '正在热播' : i < 3 ? '热门推荐' : '精选',
  }));
}

async function extractComments(records, limit = 30) {
  log.info(`⑨ 抓取真实评论（前 ${limit} 个视频）...`);
  const cache = loadRawCache();
  cache.comments = cache.comments || {};
  const targets = records.slice(0, limit).filter((r) => r.aid);
  let total = 0;

  await mapLimit(targets, 3, async (rec) => {
    let rows = cache.comments[rec.bvid];
    if (!rows) {
      try {
        const { replies } = await bilibiliClient.replies({ aid: rec.aid, ps: 20, sort: 2 });
        rows = replies
          .filter((r) => r?.content?.message)
          .map((r) => ({
            bvid: rec.bvid,
            mid: r.mid,
            userName: r.member?.uname || '哔哩哔哩用户',
            userFace: r.member?.avatar || '',
            content: r.content.message.slice(0, 300),
            likeCount: r.like || 0,
            replyCount: r.rcount || 0,
            location: r.reply_control?.location || '',
            ctime: r.ctime || 0,
          }));
        cache.comments[rec.bvid] = rows;
      } catch (err) {
        log.warn(`   · 评论抓取失败 ${rec.bvid}: ${err.message}`);
        rows = [];
      }
      await sleep(500);
    }
    if (rows.length) {
      commentRepository.insertMany(rows);
      total += rows.length;
    }
  });

  saveRawCache(cache);
  log.info(`   · 共写入 ${total} 条真实评论`);
  return total;
}

async function extractDanmaku(records, limit = 30) {
  log.info(`⑧ 抓取真实弹幕（前 ${limit} 个视频）...`);
  const cache = loadRawCache();
  cache.danmaku = cache.danmaku || {};
  const targets = records.slice(0, limit).filter((r) => r.cid);
  let total = 0;
  let failed = 0;

  await mapLimit(targets, 2, async (rec) => {
    let list = cache.danmaku[rec.bvid];
    if (!list) {
      list = [];
      // 主通道：新版 protobuf 分段弹幕（拉 2 段 ≈ 12 分钟，足够演示）
      for (const segment of [1, 2]) {
        try {
          const res = await fetch(
            `https://api.bilibili.com/x/v2/dm/web/seg.so?type=1&oid=${rec.cid}&segment_index=${segment}`,
            {
              headers: {
                'User-Agent': config.upstream.userAgent,
                Referer: config.upstream.referer,
                Accept: '*/*',
              },
            },
          );
          if (!res.ok) continue;
          list = list.concat(parseDanmakuProtobuf(Buffer.from(await res.arrayBuffer())));
        } catch (err) {
          log.warn(`   · 弹幕分段失败 ${rec.bvid} #${segment}: ${err.message}`);
        }
        await sleep(400);
      }

      // 兜底通道：旧版 deflate XML（部分视频只有旧接口可用）
      if (!list.length) {
        try {
          const res = await fetch(`https://api.bilibili.com/x/v1/dm/list.so?oid=${rec.cid}`, {
            headers: {
              'User-Agent': config.upstream.userAgent,
              Referer: config.upstream.referer,
              Accept: '*/*',
            },
          });
          list = await parseDanmakuXML(Buffer.from(await res.arrayBuffer()));
        } catch {
          /* 交给外层统计 */
        }
      }
      cache.danmaku[rec.bvid] = list;
      await sleep(400);
    }

    const picked = list.slice(0, 300).map((d) => ({ bvid: rec.bvid, ...d }));
    if (picked.length) {
      danmakuRepository.insertMany(picked);
      total += picked.length;
    } else {
      failed += 1;
    }
  });

  saveRawCache(cache);
  log.info(`   · 共写入 ${total} 条真实弹幕（${failed} 个视频无弹幕）`);
  return total;
}

/**
 * 可播放性探测：版权 / 付费内容没有 playurl 地址，提前标记可以让首页把这类
 * 视频排到后面，避免用户点进详情页却播不了。结果累积缓存在 raw-seed.json。
 */
async function probePlayable(records) {
  const cache = loadRawCache();
  cache.probe = cache.probe || {};
  const targets = records.filter((r) => r.cid);
  const pending = targets.filter((r) => cache.probe[r.bvid] === undefined);

  log.info(`⑩ 播放地址探测：${targets.length} 个视频（待探测 ${pending.length}）...`);
  if (!pending.length) {
    for (const rec of targets) rec.playable = cache.probe[rec.bvid] ? 1 : 0;
    videoRepository.bulkUpsert(records);
    log.info('   · 全部命中缓存');
    return;
  }

  let ok = 0;
  let blocked = 0;
  await mapLimit(pending, 3, async (rec) => {
    try {
      const res = await fetchJSON(
        `https://api.bilibili.com/x/player/playurl?bvid=${rec.bvid}&cid=${rec.cid}` +
          '&qn=16&fnval=1&fnver=0&platform=html5&high_quality=1',
      );
      const playable = res.code === 0 && Boolean(res.data?.durl?.[0]?.url);
      cache.probe[rec.bvid] = playable ? 1 : 0;
      if (playable) ok += 1;
      else blocked += 1;
    } catch {
      cache.probe[rec.bvid] = 0;
      blocked += 1;
    }
    await sleep(150);
  });

  for (const rec of targets) rec.playable = cache.probe[rec.bvid] ? 1 : 0;
  videoRepository.bulkUpsert(records);
  saveRawCache(cache);
  log.info(`   · 可播放 ${ok} 个 · 版权/不可播 ${blocked} 个`);
}

/* ------------------------------ Load ------------------------------ */

function resetTables() {
  for (const table of [
    'ranking', 'danmaku', 'comments', 'video_stats', 'videos', 'users',
    'banners', 'hot_searches', 'search_logs', 'watch_history', 'favorites', 'pgc_items',
  ]) {
    run(`DELETE FROM ${table}`);
  }
  run("DELETE FROM sqlite_sequence WHERE name IN ('banners','comments','danmaku','ranking','hot_searches')");
  log.info('已清空旧数据');
}

async function main() {
  const started = Date.now();
  getDB();

  const existing = get('SELECT COUNT(*) AS n FROM videos')?.n ?? 0;
  if (existing > 0 && !force) {
    log.info(`数据库已有 ${existing} 个视频，跳过导入（如需重建请执行 npm run seed -- --force）`);
    return;
  }
  if (force) resetTables();

  // 1. 分区
  categoryRepository.upsertMany(CATEGORIES);
  log.info(`写入分区 ${CATEGORIES.length} 个`);

  // 2. 视频
  const { byBvid, rankingByCategory } = await extractVideos();
  const rawItems = [...byBvid.values()];

  const slugToId = Object.fromEntries(
    categoryRepository.findAll().map((c) => [c.slug, c.id]),
  );

  const records = rawItems
    .map(({ item, categorySlug }) => {
      // 分区归属优先级：排行榜所在分区 > 二级 tid 映射 > 兜底
      const slug = categorySlug || TID_TO_SLUG[item.tid] || 'life';
      return toRecord(item, slugToId[slug] ?? slugToId.life ?? null);
    })
    .filter((r) => r.bvid && r.title && r.cover);

  records.sort((a, b) => b.stats.score - a.stats.score);

  // 分层抽样：每个分区先保底 28 条，再按热度补足总量，
  // 避免「全站热门」把冷门分区挤空，保证每个筛选 tab 都有内容。
  const PER_CATEGORY = Number(process.env.SEED_PER_CATEGORY ?? 28);
  const TOTAL_LIMIT = Number(process.env.SEED_TOTAL ?? 420);
  const pickedBvids = new Set();
  const stratify = [];

  for (const cat of CATEGORIES) {
    const catId = slugToId[cat.slug];
    const bucket = records.filter((r) => r.categoryId === catId && !pickedBvids.has(r.bvid));
    for (const rec of bucket.slice(0, PER_CATEGORY)) {
      pickedBvids.add(rec.bvid);
      stratify.push(rec);
    }
  }
  for (const rec of records) {
    if (stratify.length >= TOTAL_LIMIT) break;
    if (pickedBvids.has(rec.bvid)) continue;
    pickedBvids.add(rec.bvid);
    stratify.push(rec);
  }

  const limited = stratify.slice(0, TOTAL_LIMIT);
  videoRepository.bulkUpsert(limited);
  log.info(`写入视频 ${limited.length} 个（分层抽样：每分区保底 ${PER_CATEGORY} 条）`);

  // 3. UP主
  userRepository.syncFromVideos();
  log.info(`同步 UP主 ${get('SELECT COUNT(*) AS n FROM users')?.n ?? 0} 位`);

  // 4. 排行
  for (const cat of CATEGORIES) {
    const bvids = rankingByCategory.get(cat.slug) || [];
    const catId = slugToId[cat.slug];
    if (!catId) continue;
    const items = bvids
      .map((bvid) => limited.find((v) => v.bvid === bvid))
      .filter(Boolean)
      .slice(0, 10)
      .map((v) => ({ bvid: v.bvid, score: v.stats.score }));
    if (items.length) videoRepository.replaceRanking(catId, items);
  }
  log.info('写入分区排行');

  // 5. 轮播
  bannerRepository.replaceAll(buildBanners(limited));
  log.info(`写入首页轮播 ${limited.length >= 8 ? 8 : limited.length} 张`);

  // 6. 热搜
  const hotSearches = await extractHotSearches();
  searchRepository.replaceHotSearches(hotSearches);
  log.info(`写入热搜 ${hotSearches.length} 条`);

  // 7. 版权内容（番剧/国创/综艺）
  await extractPGC(slugToId);

  // 8. 评论 / 弹幕：优先抓热度最高的视频（首页首屏点进去的就是它们）
  const byHot = [...limited].sort((a, b) => b.stats.score - a.stats.score);
  await extractDanmaku(byHot, Number(process.env.SEED_DANMAKU ?? 36));
  await extractComments(byHot, Number(process.env.SEED_COMMENTS ?? 36));

  // 9. 兜底：给没有评论/弹幕的视频补一批可读内容，保证详情页不空
  //    热度前 160 补「评论 + 弹幕」，其余只补弹幕（评论保持以真实内容为主）
  fillMissingInteractions(byHot.slice(0, 160));
  fillMissingInteractions(byHot.slice(160), { withComments: false });

  // 10. 播放地址探测（把版权内容标记出来，保证点击即可播的主链路）
  if (process.env.SEED_PROBE !== '0') await probePlayable(limited);

  const cost = ((Date.now() - started) / 1000).toFixed(1);
  const stats = videoRepository.stats();
  log.info(`导入完成，用时 ${cost}s`);
  log.info(
    `最终数据: 视频 ${stats.videos} · 分区 ${stats.categories} · UP主 ${stats.users}` +
    ` · 评论 ${stats.comments} · 轮播 ${stats.banners} · 弹幕 ${danmakuRepository.count()}`,
  );
}

/** 版权内容（番剧/国创/综艺）：排行榜接口不覆盖，改用 PGC 季榜补充真实封面 */
async function extractPGC(slugToId) {
  log.info('⑦ 抓取版权内容季榜（番剧 / 国创 / 综艺）...');
  const cache = loadRawCache();
  let total = 0;
  for (const zone of PGC_ZONES) {
    let items = cache.pgc[zone.slug];
    if (!items?.length || refresh) {
      try {
        const res = await fetchJSON(
          `https://api.bilibili.com/pgc/season/rank/web/list?season_type=${zone.seasonType}&day=3`,
        );
        const list = res.data?.list || [];
        items = list.map((it, i) => ({
          seasonId: it.season_id,
          title: it.title,
          cover: it.cover,
          horizontalCover: it.ss_horizontal_cover || '',
          rating: it.rating || '',
          playText: it.icon_font?.text || '',
          badge: it.badge || '',
          badgeColor: it.badge_info?.bg_color || '#FB7299',
          updateInfo: it.desc || '',
          url: `https://www.bilibili.com/bangumi/play/ss${it.season_id}`,
          rank: i + 1,
        })).filter((it) => it.seasonId && it.title);
        cache.pgc[zone.slug] = items;
      } catch (err) {
        log.warn(`   · ${zone.name} 季榜失败: ${err.message}`);
        items = items || [];
      }
      await sleep(800);
    }
    if (items?.length) {
      pgcRepository.replaceForCategory(slugToId[zone.slug], items);
      total += items.length;
      log.info(`   · ${zone.name} 季榜 ${items.length} 条`);
    }
  }
  saveRawCache(cache);
  return total;
}

/**
 * 为没有互动数据的视频合成“观感内容”（真实评论/弹幕抓取数量有限）。
 * 这些内容由真实视频的标签与标题派生，仅用于填充详情页，不影响真实播放。
 */
function fillMissingInteractions(records, { withComments = true } = {}) {
  const TEMPLATES = [
    '这个也太顶了吧，一键三连了！',
    '前排占座，等了好久终于更新了',
    'UP主的声音好治愈，循环播放中',
    '笑死我了，全程高能哈哈哈哈',
    '讲得真清楚，学到了，感谢UP主',
    '画质和剪辑都很用心，收藏了慢慢看',
    '半夜刷到这个，笑到睡不着',
    '什么时候出下一期？已经等不及了',
    '看完了，感觉很有收获，推荐给大家',
    '这个BGM是什么呀，好带感',
    '泪目了，想起了自己的经历',
    '细节做得太到位了，反复看了三遍',
  ];
  const DANMAKU_TEMPLATES = [
    '前方高能', '哈哈哈哈哈', '这个可以', '一整个爱住', '有被笑到', '泪目',
    '好家伙', '双厨狂喜', '一键三连', '名场面', '考古成功', '谢谢UP主',
    '画质好评', '爷青回', '这个角度绝了', '学到了学到了',
  ];
  const NAMES = [
    '爱吃菠萝的小熊', '摸鱼选手', '夜行者', '橘猫很忙', '路人甲',
    '今天也要加油', '咸鱼翻身', '追番小分队', '键盘侠客', '一杯冰美式',
  ];

  let commentsAdded = 0;
  let danmakuAdded = 0;

  transaction(() => {
    records.forEach((rec, idx) => {
      const hasComments = withComments
        ? (get('SELECT COUNT(*) AS n FROM comments WHERE bvid = ?', [rec.bvid])?.n ?? 0)
        : 1;
      if (!hasComments) {
        const rows = Array.from({ length: 8 }, (_, i) => ({
          bvid: rec.bvid,
          mid: 900000000 + idx * 10 + i,
          userName: NAMES[(idx + i) % NAMES.length],
          userFace: '',
          content: TEMPLATES[(idx * 3 + i) % TEMPLATES.length],
          likeCount: Math.max(1, Math.round((rec.stats.view / 1000) / (i + 1))),
          replyCount: i % 3,
          location: ['北京', '上海', '广东', '浙江', '四川', '江苏'][(idx + i) % 6],
          ctime: Math.floor(Date.now() / 1000) - (i + 1) * 3600,
        }));
        commentRepository.insertMany(rows);
        commentsAdded += rows.length;
      }

      const hasDanmaku = get('SELECT COUNT(*) AS n FROM danmaku WHERE bvid = ?', [rec.bvid])?.n ?? 0;
      if (!hasDanmaku && rec.duration > 0) {
        const rows = Array.from({ length: 12 }, (_, i) => ({
          bvid: rec.bvid,
          timeMs: Math.round((rec.duration * 1000 * (i + 0.5)) / 12),
          content: DANMAKU_TEMPLATES[(idx + i) % DANMAKU_TEMPLATES.length],
          color: '#FFFFFF',
          mode: 1,
        }));
        danmakuRepository.insertMany(rows);
        danmakuAdded += rows.length;
      }
    });
  });

  log.info(`兜底内容：补充评论 ${commentsAdded} 条 · 弹幕 ${danmakuAdded} 条`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    log.error(err.stack || err.message);
    process.exit(1);
  });
