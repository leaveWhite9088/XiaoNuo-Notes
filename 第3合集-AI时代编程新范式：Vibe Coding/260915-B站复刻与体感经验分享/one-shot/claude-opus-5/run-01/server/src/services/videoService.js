/**
 * 播放页业务逻辑：视频详情、相关推荐、评论、弹幕、互动计数。
 */
import * as videoRepo from '../repositories/videoRepository.js';
import { toCard } from './feedService.js';

function notFound(bvid) {
  const err = new Error(`稿件不存在: ${bvid}`);
  err.status = 404;
  return err;
}

export function getVideoDetail(bvid) {
  const video = videoRepo.findByBvid(bvid);
  if (!video) throw notFound(bvid);
  return {
    ...video,
    related: videoRepo.findRelated(bvid, 14).map(toCard),
  };
}

export function getComments(bvid, { page = 1, pageSize = 10 } = {}) {
  if (!videoRepo.findByBvid(bvid)) throw notFound(bvid);
  const all = videoRepo.listComments(bvid);
  const start = (page - 1) * pageSize;
  return {
    total: all.length,
    page,
    pageSize,
    hasMore: start + pageSize < all.length,
    items: all.slice(start, start + pageSize),
  };
}

export function getDanmaku(bvid) {
  if (!videoRepo.findByBvid(bvid)) throw notFound(bvid);
  return videoRepo.listDanmaku(bvid);
}

/**
 * 互动（点赞/投币/收藏/分享）。演示项目直接改内存计数，返回最新值。
 * @param {'like'|'coin'|'favorite'|'share'} action
 * @param {number} delta
 */
export function interact(bvid, action, delta = 1) {
  const video = videoRepo.findByBvid(bvid);
  if (!video) throw notFound(bvid);
  if (!(action in video.stats)) {
    const err = new Error(`不支持的互动类型: ${action}`);
    err.status = 400;
    throw err;
  }
  video.stats[action] = Math.max(0, video.stats[action] + delta);
  return { bvid, action, value: video.stats[action], stats: video.stats };
}

/** 发送弹幕：追加到该稿件的弹幕池并累加计数 */
export function sendDanmaku(bvid, { text, p = 0, color = '#ffffff', mode = 'scroll' }) {
  const video = videoRepo.findByBvid(bvid);
  if (!video) throw notFound(bvid);
  const content = String(text ?? '').trim();
  if (!content) {
    const err = new Error('弹幕内容不能为空');
    err.status = 400;
    throw err;
  }
  const list = videoRepo.listDanmaku(bvid);
  const item = {
    id: `${bvid}-d-user-${list.length}`,
    p: Math.min(0.99, Math.max(0, Number(p) || 0)),
    time: Math.floor((Number(p) || 0) * video.duration),
    text: content.slice(0, 60),
    color,
    mode,
    fontSize: 25,
    self: true,
  };
  list.push(item);
  video.stats.danmaku += 1;
  return item;
}
