/**
 * 数据集构建层：把 content.js 的语料 + channels.js 的分区配置，
 * 组装成内存里的"数据库"（users / videos / comments / danmaku / banners）。
 * 使用固定 seed 的伪随机数，保证每次启动数据一致。
 */
import { createRandom, makeBvid } from '../utils/random.js';
import { channels } from './channels.js';
import {
  commentPool,
  danmakuPool,
  descTemplates,
  tagPool,
  titlesByChannel,
  upNames,
  viewerNames,
} from './content.js';

const SEED = 20260909;
const COVER_COUNT = 120;
const AVATAR_COUNT = 48;
const CLIP_COUNT = 6;
const VIDEOS_PER_CHANNEL = 9;

const rng = createRandom(SEED);
const NOW = Date.UTC(2026, 8, 12, 12, 0, 0); // 2026-09-12，固定"当前时间"让相对时间稳定

const coverUrl = (i) => `/media/covers/cover-${(i % COVER_COUNT) + 1}.jpg`;
const avatarUrl = (i) => `/media/avatars/avatar-${(i % AVATAR_COUNT) + 1}.jpg`;
const clipUrl = (i) => `/media/videos/clip-${(i % CLIP_COUNT) + 1}.mp4`;

/* ------------------------------------------------------------------ UP 主 */

const users = upNames.map((name, i) => ({
  mid: 100000 + i * 137,
  name,
  avatar: avatarUrl(i),
  followers: rng.int(12, 980) * 1000 + rng.int(0, 999),
  level: rng.int(4, 6),
  sign: rng.pick([
    '一个还在努力的内容创作者',
    '更新随缘，质量优先',
    '商务合作请私信，谢谢大家',
    '记录值得记录的事',
    '每周四晚 20:00 更新',
    '用镜头讲点有意思的东西',
  ]),
  isVip: rng.chance(0.45),
}));

/* ------------------------------------------------------------------ 视频 */

let coverCursor = 0;
let clipCursor = 0;

/** 生成一条视频记录 */
function buildVideo(channel, title, indexInChannel, globalIndex) {
  const up = users[(globalIndex * 7 + indexInChannel) % users.length];
  const duration = rng.int(62, 3600); // 1 分钟到 1 小时
  const view = rng.int(3, 3200) * 1000 + rng.int(0, 999);
  const danmakuCount = Math.max(12, Math.floor(view * (rng.int(3, 22) / 1000)));
  const like = Math.floor(view * (rng.int(30, 130) / 1000));
  const publishedAt = NOW - rng.int(1, 60 * 24 * 40) * 60 * 1000; // 40 天内

  return {
    bvid: makeBvid(rng),
    aid: 900000000 + globalIndex * 7919,
    title,
    cover: coverUrl(coverCursor++),
    duration,
    publishedAt: new Date(publishedAt).toISOString(),
    channelId: channel.id,
    channelName: channel.name,
    subChannel: rng.pick(channel.desc.split(' / ')),
    tags: rng.sample(tagPool, rng.int(3, 5)),
    desc: rng.pick(descTemplates),
    videoUrl: clipUrl(clipCursor++),
    copyright: rng.chance(0.75) ? '自制' : '转载',
    up: { mid: up.mid, name: up.name, avatar: up.avatar, followers: up.followers },
    stats: {
      view,
      danmaku: danmakuCount,
      like,
      coin: Math.floor(like * 0.42),
      favorite: Math.floor(like * 0.55),
      share: Math.floor(like * 0.11),
      reply: Math.floor(like * 0.08) + 12,
    },
    /** 推荐权重，用于"综合推荐"排序与"换一换" */
    score: rng.int(1, 1000),
  };
}

/** @type {any[]} */
export const videos = [];

channels.forEach((channel, ci) => {
  const pool = titlesByChannel[channel.id] ?? [];
  for (let i = 0; i < VIDEOS_PER_CHANNEL; i += 1) {
    const base = pool[i % pool.length];
    // 标题池不够长时加上分 P / 合集式后缀，避免完全重复
    const title = i < pool.length ? base : `${base}（P${Math.floor(i / pool.length) + 1}）`;
    videos.push(buildVideo(channel, title, i, ci * VIDEOS_PER_CHANNEL + i));
  }
});

export const videoByBvid = new Map(videos.map((v) => [v.bvid, v]));

/* ------------------------------------------------------------------ 评论 */

/** 评论惰性生成并缓存 */
const commentCache = new Map();

export function buildComments(bvid) {
  if (commentCache.has(bvid)) return commentCache.get(bvid);
  const local = createRandom(hash(bvid));
  const total = local.int(8, 16);
  const list = [];
  for (let i = 0; i < total; i += 1) {
    const nameIndex = local.int(0, viewerNames.length - 1);
    const replies = [];
    if (local.chance(0.35)) {
      const replyCount = local.int(1, 2);
      for (let r = 0; r < replyCount; r += 1) {
        const rIndex = local.int(0, viewerNames.length - 1);
        replies.push({
          id: `${bvid}-c${i}-r${r}`,
          user: { name: viewerNames[rIndex], avatar: avatarUrl(rIndex + 5), level: local.int(2, 6) },
          content: local.pick([
            '同感，我也是这么想的',
            '哈哈哈哈哈说得太对了',
            '楼上说到我心坎里了',
            '补充一点：这个细节在 3:21 也出现过',
            '一起蹲下一期',
          ]),
          likes: local.int(1, 320),
          publishedAt: new Date(NOW - local.int(30, 4000) * 60 * 1000).toISOString(),
        });
      }
    }
    list.push({
      id: `${bvid}-c${i}`,
      user: {
        name: viewerNames[nameIndex],
        avatar: avatarUrl(nameIndex + 11),
        level: local.int(3, 6),
        isVip: local.chance(0.3),
      },
      content: local.pick(commentPool),
      likes: local.int(12, 9800),
      dislikes: local.int(0, 30),
      publishedAt: new Date(NOW - local.int(20, 8000) * 60 * 1000).toISOString(),
      top: i === 0,
      replies,
    });
  }
  list.sort((a, b) => (a.top ? -1 : b.top ? 1 : b.likes - a.likes));
  commentCache.set(bvid, list);
  return list;
}

/* ------------------------------------------------------------------ 弹幕 */

const danmakuCache = new Map();
const DANMAKU_COLORS = ['#ffffff', '#ffffff', '#ffffff', '#ff7f24', '#66ccff', '#ffd700', '#7ac943'];

/**
 * 弹幕的 p 字段是"进度百分比(0~1)"，前端按播放器真实时长换算，
 * 这样即使演示片源只有 10 秒，弹幕也能均匀铺满整条进度条。
 */
export function buildDanmaku(bvid) {
  if (danmakuCache.has(bvid)) return danmakuCache.get(bvid);
  const local = createRandom(hash(bvid) + 31);
  const video = videoByBvid.get(bvid);
  const count = 32;
  const list = [];
  for (let i = 0; i < count; i += 1) {
    const p = Math.min(0.98, (i / count) + local.next() * (0.8 / count));
    list.push({
      id: `${bvid}-d${i}`,
      p,
      time: Math.floor(p * (video?.duration ?? 300)),
      text: local.pick(danmakuPool),
      color: local.pick(DANMAKU_COLORS),
      mode: local.chance(0.08) ? 'top' : 'scroll',
      fontSize: local.chance(0.15) ? 30 : 25,
    });
  }
  danmakuCache.set(bvid, list);
  return list;
}

/* ------------------------------------------------------------------ 轮播 */

export const banners = [1, 2, 3, 4, 5].map((n, i) => {
  const video = videos[i * 13 + 4];
  return {
    id: `banner-${n}`,
    image: `/media/banners/banner-${n}.jpg`,
    title: video.title,
    subTitle: ['活动', '独家', '新番', '专题', '限时'][i] + ' · ' + video.channelName,
    bvid: video.bvid,
  };
});

/* ------------------------------------------------------------------ 工具 */

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const datasetMeta = {
  seed: SEED,
  videoCount: videos.length,
  channelCount: channels.length,
  generatedAt: new Date(NOW).toISOString(),
};
