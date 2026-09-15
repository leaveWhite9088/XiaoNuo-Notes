// 服务层：DTO 组装 + 真实搜索建议代理（失败回退本地数据）
import {
  listFeed,
  getVideo,
  relatedVideos,
  searchVideos,
  localSuggestions,
  listCategories,
} from '../repositories/videoRepository.js';
import { meta } from '../db.js';

const BILI_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

function toCard(v) {
  return {
    id: v.id,
    bvid: v.bvid,
    title: v.title,
    pic: v.pic,
    duration: v.duration,
    cat: v.cat,
    tname: v.tname,
    pubdate: v.pubdate,
    stream: v.stream,
    owner: { name: v.owner.name, face: v.owner.face, mid: v.owner.mid },
    stat: { view: v.stat.view, danmaku: v.stat.danmaku, like: v.stat.like, reply: v.stat.reply },
  };
}

function toDetail(v) {
  return {
    ...toCard(v),
    desc: v.desc,
    stream: v.stream,
    stat: { ...v.stat },
  };
}

const COMMENT_POOL = [
  '前排支持！这个制作质量真的顶',
  'UP主更新比我的论文进度快多了',
  'DNA 动了，爷青回',
  '三连了，下次能不能出个 4K 版',
  '看哭了，2026 年还有人做这种内容',
  '好家伙，这数据我上我也行（狗头）',
  '课代表总结：三分钟处是高光',
  '从新人报到，已经追了三期',
  '弹幕护体，名场面打卡',
  '感谢搬运，找原版找了好久',
  '这剪辑节奏教科书级别',
  '第一次付费支持，值',
];

function commentsFor(v) {
  const n = 5 + (v.aid % 4);
  const out = [];
  for (let i = 0; i < n; i++) {
    const p = COMMENT_POOL[(v.aid + i * 5) % COMMENT_POOL.length];
    out.push({
      id: v.id * 100 + i,
      uname: `用户${String((v.aid * (i + 3)) % 99999).padStart(5, '0')}`,
      level: 1 + ((v.aid + i) % 6),
      content: p,
      like: (v.aid * (i + 7)) % 900,
      ctime: v.pubdate + (i + 1) * 3600,
    });
  }
  return out;
}

export function getFeed({ cat, page = 1, size = 24 } = {}) {
  const r = listFeed({ cat, page, size });
  return { ...r, list: r.list.map(toCard) };
}

export function getDetail(idOrBvid) {
  const v = getVideo(idOrBvid);
  if (!v) return null;
  return {
    video: toDetail(v),
    related: relatedVideos(v).map(toCard),
    comments: commentsFor(v),
  };
}

export function search(q, page = 1, size = 20) {
  const all = searchVideos(q);
  const p = Math.max(1, Math.floor(Number(page)) || 1);
  const start = (p - 1) * size;
  return {
    list: all.slice(start, start + size).map(toCard),
    total: all.length,
    page: p,
    hasMore: start + size < all.length,
  };
}

const stripEm = (s) => String(s || '').replace(/<\/?em[^>]*>/g, '');

/**
 * 从真实 suggest 响应提取建议词。
 * 实测（2026-09 curl 核验）result 位于顶层且为 {tag:[...]}；
 * 同时兼容历史/变体形状：result 在 data 下、或 result 为数组（取首元素）。
 */
function extractSuggestTags(body) {
  let payload = body?.result ?? body?.data?.result;
  if (Array.isArray(payload)) payload = payload[0];
  const tags = payload?.tag;
  return Array.isArray(tags) ? tags : [];
}

/** 搜索建议：优先真实 B 站 suggest 接口，超时/失败回退本地 */
export async function suggest(kw) {
  const q = String(kw || '').trim();
  if (!q) return { items: localSuggestions(''), live: false };
  try {
    const url = `https://s.search.bilibili.com/main/suggest?term=${encodeURIComponent(q)}&action=0`;
    const res = await fetch(url, {
      headers: { 'User-Agent': BILI_UA, Referer: 'https://www.bilibili.com/' },
      signal: AbortSignal.timeout(2500),
    });
    const body = await res.json();
    const tags = body?.code === 0 ? extractSuggestTags(body) : [];
    const items = tags
      .map((t) => ({ text: stripEm(t.name || t.value), kind: 'bili' }))
      .filter((t) => t.text)
      .slice(0, 10);
    if (!items.length) throw new Error('empty');
    return { items, live: true };
  } catch {
    return { items: localSuggestions(q), live: false };
  }
}

export function categories() {
  return listCategories();
}

export function health() {
  return { ok: true, dataset: { total: meta.total, generatedAt: meta.generatedAt, streams: meta.streams } };
}
