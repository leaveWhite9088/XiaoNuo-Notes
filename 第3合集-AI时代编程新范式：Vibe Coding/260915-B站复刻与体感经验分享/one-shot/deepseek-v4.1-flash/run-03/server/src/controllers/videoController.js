import videoService from '../services/videoService.js';
import { ok } from './respond.js';
import asyncHandler from '../utils/asyncHandler.js';

/** 视频详情 / 评论 / 弹幕 / 历史 控制器 */

export const getDetail = asyncHandler(async (req, res) => {
  ok(res, await videoService.getDetail(req.params.bvid));
});

export const getRelated = asyncHandler(async (req, res) => {
  ok(res, videoService.getRelated(req.params.bvid, Number(req.query.limit) || 12));
});

export const getComments = asyncHandler(async (req, res) => {
  const { sort = 'hot', limit = 20 } = req.query;
  ok(res, videoService.getComments(req.params.bvid, { sort, limit: Number(limit) }));
});

export const postComment = asyncHandler(async (req, res) => {
  const { content, userName } = req.body || {};
  ok(res, videoService.addComment(req.params.bvid, { content, userName }));
});

export const postDanmaku = asyncHandler(async (req, res) => {
  const { content, timeMs, color } = req.body || {};
  ok(res, videoService.addDanmaku(req.params.bvid, { content, timeMs, color }));
});

export const postHistory = asyncHandler(async (req, res) => {
  const { progress = 0 } = req.body || {};
  ok(res, videoService.recordHistory(req.params.bvid, Number(progress) || 0));
});

export const getHistory = asyncHandler(async (req, res) => {
  ok(res, videoService.getHistory(Number(req.query.limit) || 12));
});

export default {
  getDetail, getRelated, getComments, postComment, postDanmaku, postHistory, getHistory,
};
