// 数据层（Repository）：加载 videos.json，向上层（路由/控制器）提供查询能力。
// 路由层不直接接触文件系统。
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../data/videos.json');

// 细分子分区 -> B 站首页一级频道 的映射
const CHANNEL_MAP = {
  单机游戏: '游戏',
  手机游戏: '游戏',
  电子竞技: '游戏',
  网络游戏: '游戏',
  数码: '科技',
  软件应用: '科技',
  科学科普: '知识',
  人文历史: '知识',
  校园学习: '知识',
  '社科·法律·心理': '知识',
  日常: '生活',
  手工: '生活',
  美食记录: '生活',
  美食侦探: '生活',
  社会: '生活',
  绘画: '生活',
  综合: '生活',
  搞笑: '鬼畜',
  小剧场: '鬼畜',
  鬼畜剧场: '鬼畜',
  动物二创: '鬼畜',
  影视杂谈: '影视',
  影视剪辑: '影视',
  综艺: '影视',
  音乐综合: '音乐',
  乐评盘点: '音乐',
  演奏: '音乐',
  国产动画: '动画',
  美妆护肤: '时尚',
  仿妆cos: '时尚',
  汽车生活: '汽车',
  篮球: '运动',
};

const SAMPLE_VIDEOS = ['/media/videos/bbb.mp4', '/media/videos/sintel.mp4', '/media/videos/jellyfish.mp4'];

let videos = [];
let byId = new Map();

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function load() {
  const raw = JSON.parse(readFileSync(DATA_FILE, 'utf8'));

  // P3-10：未映射的分区不再静默归入"生活"，而是归入"其他"并打印告警，
  // 提示维护者补充上方 CHANNEL_MAP（映射表为本文件内手工维护）。
  const unmapped = [...new Set(raw.videos.map((v) => v.category).filter((c) => !CHANNEL_MAP[c]))];
  if (unmapped.length) {
    console.warn(
      `[data-store] 警告：以下分区未在 CHANNEL_MAP 中映射，已归入"其他"频道：${unmapped.join('、')}。请维护 server/src/data-store.js 的 CHANNEL_MAP。`
    );
  }

  videos = raw.videos.map((v) => ({
    ...v,
    channel: CHANNEL_MAP[v.category] || '其他',
    // 真实 B 站视频流需要鉴权，V0 用本地样例视频轮流播放
    src: SAMPLE_VIDEOS[hash(v.id) % SAMPLE_VIDEOS.length],
  }));
  byId = new Map(videos.map((v) => [v.id, v]));
  return videos.length;
}

export function count() {
  return videos.length;
}

// ------- 查询接口（数据层出口） -------

export function getChannels() {
  const counter = new Map();
  for (const v of videos) counter.set(v.channel, (counter.get(v.channel) || 0) + 1);
  return [...counter.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getHotSearches(limit = 8) {
  // 从真实数据的高播放量视频中提取热搜词（取 UP 主名或标题前段）
  return [...videos]
    .sort((a, b) => b.stat.view - a.stat.view)
    .slice(0, limit * 3)
    .filter((v, i, arr) => arr.findIndex((x) => x.owner.name === v.owner.name) === i)
    .slice(0, limit)
    .map((v) => v.owner.name);
}

export function listVideos({ channel = '', keyword = '', page = 1, pageSize = 20 } = {}) {
  let result = videos;
  if (channel && channel !== '全部') result = result.filter((v) => v.channel === channel);
  if (keyword) {
    const kw = keyword.trim().toLowerCase();
    if (kw) {
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(kw) ||
          v.owner.name.toLowerCase().includes(kw) ||
          v.category.toLowerCase().includes(kw)
      );
    }
  }
  const total = result.length;
  const p = Math.max(1, Number(page) || 1);
  const size = Math.max(1, Number(pageSize) || 20);
  const start = (p - 1) * size;
  return { total, page: p, pageSize: size, hasMore: start + size < total, list: result.slice(start, start + size) };
}

export function getVideo(id) {
  return byId.get(id) || null;
}

export function getRelated(id, limit = 12) {
  const cur = byId.get(id);
  if (!cur) return [];
  const sameCat = videos.filter((v) => v.id !== id && (v.channel === cur.channel || v.owner.mid === cur.owner.mid));
  const others = videos.filter((v) => v.id !== id && !sameCat.includes(v));
  return [...sameCat, ...others].slice(0, limit);
}

export function suggest(keyword, limit = 8) {
  const kw = (keyword || '').trim().toLowerCase();
  if (!kw) return getHotSearches(limit);
  const seen = new Set();
  const out = [];
  for (const v of videos) {
    for (const cand of [v.title, v.owner.name, v.category, v.channel]) {
      if (cand.toLowerCase().includes(kw) && !seen.has(cand)) {
        seen.add(cand);
        out.push(cand);
        if (out.length >= limit) return out;
      }
    }
  }
  return out;
}
