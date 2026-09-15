/**
 * 仓储层：只负责对内存数据集做查询，不关心 HTTP 语义。
 */
import { banners, buildComments, buildDanmaku, videoByBvid, videos } from '../data/dataset.js';

const SORTERS = {
  recommend: (a, b) => b.score - a.score,
  latest: (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  hot: (a, b) => b.stats.view - a.stats.view,
  danmaku: (a, b) => b.stats.danmaku - a.stats.danmaku,
};

/** 按分区 + 排序取列表（不分页） */
export function queryVideos({ channelId = 'all', sort = 'recommend' } = {}) {
  const base = channelId === 'all' ? videos : videos.filter((v) => v.channelId === channelId);
  const sorter = SORTERS[sort] ?? SORTERS.recommend;
  return [...base].sort(sorter);
}

export function findByBvid(bvid) {
  return videoByBvid.get(bvid) ?? null;
}

/** 相关推荐：同分区优先，其余用高播放量补齐 */
export function findRelated(bvid, limit = 12) {
  const current = videoByBvid.get(bvid);
  if (!current) return [];
  const sameChannel = videos.filter((v) => v.channelId === current.channelId && v.bvid !== bvid);
  const others = videos
    .filter((v) => v.channelId !== current.channelId)
    .sort((a, b) => b.stats.view - a.stats.view);
  return [...sameChannel, ...others].slice(0, limit);
}

/** 关键词检索：标题 / UP 主 / 标签 / 分区名 */
export function searchVideos(keyword) {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return [];
  const scoreOf = (v) => {
    const title = v.title.toLowerCase();
    let score = 0;
    if (title.includes(kw)) score += 100 - title.indexOf(kw);
    if (v.up.name.toLowerCase().includes(kw)) score += 60;
    if (v.channelName.includes(kw)) score += 40;
    if (v.tags.some((t) => t.toLowerCase().includes(kw))) score += 30;
    // 单字拆分匹配，让中文短词也能召回
    if (score === 0) {
      const hit = [...kw].filter((ch) => title.includes(ch)).length;
      if (hit >= Math.max(1, Math.ceil(kw.length * 0.6))) score += hit * 4;
    }
    return score;
  };
  return videos
    .map((v) => ({ video: v, score: scoreOf(v) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.video.stats.view - a.video.stats.view)
    .map((x) => x.video);
}

export function listBanners() {
  return banners;
}

export function listComments(bvid) {
  return buildComments(bvid);
}

export function listDanmaku(bvid) {
  return buildDanmaku(bvid);
}

export function totalCount() {
  return videos.length;
}
