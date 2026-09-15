import playService from '../services/playService.js';
import { ok } from './respond.js';
import asyncHandler from '../utils/asyncHandler.js';
import config from '../config/index.js';

/** 播放控制器：播放信息 + 流代理 */

export const getPlayInfo = asyncHandler(async (req, res) => {
  const qn = Number(req.query.qn) || config.play.defaultQuality;
  ok(res, await playService.resolvePlayInfo(req.params.bvid, qn));
});

export const stream = asyncHandler(async (req, res) => {
  const qn = Number(req.query.qn) || config.play.defaultQuality;
  await playService.proxyStream(req.params.bvid, qn, req, res);
});

export default { getPlayInfo, stream };
