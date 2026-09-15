// 一次性种子构建脚本：调用 B 站公开接口，抓取真实视频数据（封面/头像/标题/UP主/播放量）
// 输出到 server/data/*.json，作为后端数据层。之后后端不再依赖外网。
// 运行：npm run seed -w server
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data');

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  Referer: 'https://www.bilibili.com/',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      if (body.code !== 0) throw new Error(`bili code=${body.code}`);
      return body.data;
    } catch (e) {
      if (i === tries - 1) {
        console.warn(`  [skip] ${url} -> ${e.message}`);
        return null;
      }
      await sleep(600 * (i + 1));
    }
  }
  return null;
}

const CATEGORIES = [
  { id: 'tuijian', name: '推荐' },
  { id: 'hot', name: '热门' },
  { id: 'anime', name: '动画' },
  { id: 'music', name: '音乐' },
  { id: 'dance', name: '舞蹈' },
  { id: 'game', name: '游戏' },
  { id: 'film', name: '影视' },
  { id: 'knowledge', name: '知识' },
  { id: 'tech', name: '科技' },
  { id: 'life', name: '生活' },
  { id: 'food', name: '美食' },
  { id: 'animal', name: '动物' },
  { id: 'sports', name: '运动' },
  { id: 'car', name: '汽车' },
];

// ranking/v2 接口可用的 rid -> 一级分区（实测 2026-09）
const RID_TO_CAT = {
  1: 'anime',
  3: 'music',
  129: 'dance',
  4: 'game',
  23: 'film',
  36: 'knowledge',
  188: 'tech',
  160: 'life',
  211: 'food',
  217: 'animal',
  234: 'sports',
  223: 'car',
  17: 'hot',
};

// 用子分区 tname 关键词归入一级分区（处理 popular 混合流）
const TNAME_RULES = [
  ['anime', ['动画', '番剧', '国创', '手书', 'MAD', 'AMV', '特摄', '漫画', '同人']],
  ['music', ['音乐', '歌曲', 'MV', '演奏', '翻唱', '作曲', '听', 'LIVE', 'vocaloid']],
  ['dance', ['舞蹈', '宅舞', '编舞', '街舞', '舞']],
  ['game', ['游戏', '手游', '网游', '电竞', '单机', '主机', 'Steam', '攻略', '我的世界', '原神', '英雄联盟', '王者']],
  ['film', ['电影', '电视剧', '影视', '短片', '综艺', '纪录', '剧场']],
  ['knowledge', ['知识', '校园', '学习', '历史', '人文', '法律', '社会', '财经', '科学', '科普', '考研', '课堂']],
  ['tech', ['数码', '科技', '软件', '计算机', '机械', '人工智能', '家电', '极客', '编程', '硬件', '智能', '开发者']],
  ['food', ['美食', '烹饪', '烘焙', '料理', '吃播', '菜谱', '菜']],
  ['animal', ['动物', '宠物', '喵', '汪', '萌宠', '猫', '狗']],
  ['sports', ['运动', '健身', '跑步', '骑行', '篮球', '足球', '体育', '健身', '球']],
  ['car', ['汽车', '摩托', '改装', '试驾', '车']],
  ['life', ['生活', '日常', 'vlog', '手工', '绘画', '亲子', '旅行', '时尚', '美妆', '摄影', '装修', '情感']],
];

function classifyByTname(tname) {
  const s = String(tname || '').toLowerCase();
  for (const [cat, keys] of TNAME_RULES) {
    if (keys.some((k) => s.includes(k.toLowerCase()))) return cat;
  }
  return 'hot';
}

// 真实可播放的公开示例流（B 站正片流需 wbi+cookie，复刻 V0 用开放测试流）
const STREAMS = [
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://media.w3.org/2010/05/bunny/movie.mp4',
  'https://media.w3.org/2010/05/video/movie_300.mp4',
  'https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4',
  'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4',
];

const HOT_KEYWORDS = ['黑神话悟空', 'AI绘画', '原神', '鬼畜', '猫meme', '数码测评', '考研经验', '国创动画', '名场面', '宅舞'];

function normalize(item, source, catHint) {
  const owner = item.owner || {};
  const stat = item.stat || {};
  const pic = String(item.pic || '').replace(/^http:/, 'https:');
  const face = String(owner.face || 'https://i0.hdslb.com/bfs/face/member/noface.jpg').replace(/^http:/, 'https:');
  return {
    bvid: item.bvid,
    aid: item.aid,
    tid: item.tid,
    tname: item.tname || '',
    cat: catHint || classifyByTname(item.tname),
    title: String(item.title || '').trim(),
    pic,
    duration: item.duration || 0,
    pubdate: item.pubdate || Math.floor(Date.now() / 1000),
    desc: String(item.desc || item.dynamic || '').slice(0, 200),
    owner: { mid: owner.mid || 0, name: owner.name || '未知UP主', face },
    stat: {
      view: stat.view ?? 0,
      danmaku: stat.danmaku ?? 0,
      like: stat.like ?? 0,
      coin: stat.coin ?? 0,
      favorite: stat.favorite ?? 0,
      share: stat.share ?? 0,
      reply: stat.reply ?? 0,
    },
    source,
  };
}

async function main() {
  const byBvid = new Map();

  console.log('[seed] 拉取热门流 x/web-interface/popular ...');
  for (let pn = 1; pn <= 10; pn++) {
    const d = await getJSON(`https://api.bilibili.com/x/web-interface/popular?ps=20&pn=${pn}`);
    const list = d?.list || [];
    for (const it of list) {
      if (!it.bvid || byBvid.has(it.bvid)) continue;
      byBvid.set(it.bvid, normalize(it, 'popular'));
    }
    console.log(`  popular pn=${pn} got ${list.length}`);
    await sleep(200);
  }

  console.log('[seed] 拉取分区榜 x/web-interface/ranking/v2 ...');
  for (const [rid, cat] of Object.entries(RID_TO_CAT)) {
    const d = await getJSON(`https://api.bilibili.com/x/web-interface/ranking/v2?rid=${rid}&type=all`);
    const list = (d?.list || []).slice(0, 14);
    for (const it of list) {
      if (!it.bvid) continue;
      const rec = normalize(it, `ranking:${rid}`, cat);
      const prev = byBvid.get(it.bvid);
      if (prev) prev.cat = cat; // 榜单归属更准确
      else byBvid.set(it.bvid, rec);
    }
    console.log(`  ranking rid=${rid}(${cat}) got ${list.length}`);
    await sleep(200);
  }

  const videos = [...byBvid.values()].sort((a, b) => b.pubdate - a.pubdate);
  videos.forEach((v, i) => {
    v.id = i + 1;
    v.stream = STREAMS[i % STREAMS.length];
  });

  const counts = {};
  for (const v of videos) counts[v.cat] = (counts[v.cat] || 0) + 1;
  // 无数据的分区从筛选条中剔除，保证分类筛选始终有结果
  const categories = CATEGORIES.filter((c) => c.id === 'tuijian' || counts[c.id] > 0);
  categories.forEach((c) => {
    c.count = c.id === 'tuijian' ? videos.length : counts[c.id];
  });

  const write = (name, obj) => {
    writeFileSync(path.join(DATA_DIR, name), JSON.stringify(obj, null, 0));
    console.log(`[seed] 写出 data/${name}`);
  };
  write('videos.json', videos);
  write('categories.json', categories);
  write('hotwords.json', HOT_KEYWORDS);
  write(
    'meta.json',
    { generatedAt: new Date().toISOString(), total: videos.length, counts, streams: STREAMS.length }
  );
  console.log('[seed] 完成。分区分布:', JSON.stringify(counts));
}

main().catch((e) => {
  console.error('[seed] 失败:', e);
  process.exit(1);
});
