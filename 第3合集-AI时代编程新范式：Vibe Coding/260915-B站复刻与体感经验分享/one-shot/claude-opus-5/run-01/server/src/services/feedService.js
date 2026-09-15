/**
 * 首页信息流业务逻辑：分区筛选、排序、分页、"换一换"。
 */
import * as videoRepo from '../repositories/videoRepository.js';
import { findChannel } from '../repositories/channelRepository.js';

export function toCard(video) {
  return {
    bvid: video.bvid,
    title: video.title,
    cover: video.cover,
    duration: video.duration,
    publishedAt: video.publishedAt,
    channelId: video.channelId,
    channelName: video.channelName,
    up: video.up,
    stats: { view: video.stats.view, danmaku: video.stats.danmaku },
    previewUrl: video.videoUrl,
  };
}

/**
 * @param {{channelId?: string, sort?: string, page?: number, pageSize?: number, refresh?: number}} params
 */
export function getFeed({ channelId = 'all', sort = 'recommend', page = 1, pageSize = 20, refresh = 0 } = {}) {
  const channel = findChannel(channelId);
  if (!channel) {
    const err = new Error(`未知分区: ${channelId}`);
    err.status = 404;
    throw err;
  }

  const all = videoRepo.queryVideos({ channelId, sort });
  // "换一换"：整体旋转列表，得到一批不同的内容但保持稳定可复现
  const offset = (refresh * pageSize) % Math.max(1, all.length);
  const rotated = offset ? [...all.slice(offset), ...all.slice(0, offset)] : all;

  const start = (page - 1) * pageSize;
  const items = rotated.slice(start, start + pageSize).map(toCard);

  return {
    channel,
    sort,
    page,
    pageSize,
    total: all.length,
    hasMore: start + pageSize < all.length,
    items,
  };
}

export function getBanners() {
  return videoRepo.listBanners();
}
