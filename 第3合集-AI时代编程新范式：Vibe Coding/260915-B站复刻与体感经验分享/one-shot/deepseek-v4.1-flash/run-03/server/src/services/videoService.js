import videoRepository from '../repositories/videoRepository.js';
import commentRepository from '../repositories/commentRepository.js';
import danmakuRepository from '../repositories/danmakuRepository.js';
import userRepository from '../repositories/userRepository.js';
import searchRepository from '../repositories/searchRepository.js';
import bilibiliClient from './bilibiliClient.js';
import ApiError from '../utils/ApiError.js';
import { createLogger } from '../utils/logger.js';
import { toVideoDTO, toVideoList, toCommentDTO, toUserDTO } from './mappers.js';

const log = createLogger('video-service');

/**
 * 视频服务：详情聚合、相关推荐、评论、弹幕、cid 补全。
 */

export function getByBvid(bvid) {
  const row = videoRepository.findByBvid(bvid);
  if (!row) throw ApiError.notFound(`视频 ${bvid} 不存在`);
  return toVideoDTO(row);
}

/**
 * 详情页聚合：视频 + UP主 + 相关推荐 + 热门评论 + 弹幕。
 * cid 缺失时（seed 未覆盖）实时回源补全并写回数据库。
 */
export async function getDetail(bvid) {
  let video = getByBvid(bvid);

  if (!video.cid) {
    try {
      const upstream = await bilibiliClient.view(bvid);
      videoRepository.updateCid(bvid, upstream.cid, upstream.aid);
      video = { ...video, cid: upstream.cid, aid: upstream.aid };
      log.info(`补全 cid：${bvid} -> ${upstream.cid}`);
    } catch (err) {
      log.warn(`cid 补全失败 ${bvid}: ${err.message}`);
    }
  }

  const owner = video.owner?.mid ? toUserDTO(userRepository.findByMid(video.owner.mid)) : null;
  const related = toVideoList(
    videoRepository.findRelated(bvid, video.category?.id, 12),
  );
  const comments = commentRepository
    .findByBvid(bvid, { limit: 20, sort: 'hot' })
    .map(toCommentDTO);
  const commentTotal = commentRepository.countByBvid(bvid);
  const danmaku = danmakuRepository.findByBvid(bvid, 200);

  return {
    video,
    owner: owner || {
      mid: video.owner.mid,
      name: video.owner.name,
      face: video.owner.face,
      sign: '',
      follower: 0,
      followerText: '0',
      level: 6,
      vip: false,
      archiveCount: 0,
    },
    related,
    comments,
    commentTotal,
    danmaku,
    // UP主其它作品（同分区、同作者优先）
    ownerVideos: toVideoList(
      videoRepository
        .findFeed({ categoryId: video.category?.id, sort: 'hot', page: 1, pageSize: 24 })
        .filter((v) => v.owner_mid === video.owner.mid)
        .slice(0, 8),
    ),
  };
}

export function getRelated(bvid, limit = 12) {
  const video = getByBvid(bvid);
  return toVideoList(videoRepository.findRelated(bvid, video.category?.id, limit));
}

export function getComments(bvid, { sort = 'hot', limit = 20 } = {}) {
  return {
    list: commentRepository.findByBvid(bvid, { limit, sort }).map(toCommentDTO),
    total: commentRepository.countByBvid(bvid),
  };
}

/** 新增一条本地评论（演示发表评论链路） */
export function addComment(bvid, { content, userName = '我', mid = 0 }) {
  if (!content || !content.trim()) throw ApiError.badRequest('评论内容不能为空');
  getByBvid(bvid);
  const ctime = Math.floor(Date.now() / 1000);
  commentRepository.insertMany([
    { bvid, mid, userName, userFace: '', content: content.trim(), likeCount: 0, ctime, location: '本机' },
  ]);
  return commentRepository.findByBvid(bvid, { limit: 1, sort: 'new' }).map(toCommentDTO)[0];
}

export function addDanmaku(bvid, { content, timeMs = 0, color = '#FFFFFF' }) {
  if (!content || !content.trim()) throw ApiError.badRequest('弹幕内容不能为空');
  getByBvid(bvid);
  danmakuRepository.insertMany([{ bvid, timeMs, content: content.trim(), color }]);
  return { ok: true, content: content.trim(), timeMs, color };
}

export function recordHistory(bvid, progress = 0) {
  const video = getByBvid(bvid);
  searchRepository.upsertHistory({
    bvid,
    title: video.title,
    cover: video.cover,
    progress,
    duration: video.duration,
  });
  return { ok: true };
}

export function getHistory(limit = 12) {
  return searchRepository.findHistory(limit).map((row) => ({
    bvid: row.bvid,
    title: row.title,
    cover: row.cover,
    progress: row.progress,
    duration: row.duration,
    progressPercent: row.duration ? Math.min(100, Math.round((row.progress / row.duration) * 100)) : 0,
    updatedAt: row.updated_at,
  }));
}

export default {
  getByBvid, getDetail, getRelated, getComments, addComment, addDanmaku,
  recordHistory, getHistory,
};
