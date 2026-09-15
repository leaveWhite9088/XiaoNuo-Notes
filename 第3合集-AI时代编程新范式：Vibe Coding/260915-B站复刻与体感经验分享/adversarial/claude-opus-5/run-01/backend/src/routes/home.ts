import { Router } from 'express';
import { feedService } from '../services/feedService.js';
import { interactionService } from '../services/interactionService.js';
import { ok } from '../middleware/errorHandler.js';

export const homeRouter = Router();

/** 分区导航（含每个分区的视频数，用于筛选 tab） */
homeRouter.get('/channels', (_req, res) => {
  ok(res, feedService.channels());
});

homeRouter.get('/banners', (_req, res) => {
  ok(res, feedService.banners());
});

/** 首页一次性初始化：导航 + 轮播 + 轮播右侧精选位（信息流与热搜由各自的查询单独获取，避免重复请求） */
homeRouter.get('/bootstrap', (_req, res) => {
  ok(res, {
    channels: feedService.channels(),
    banners: feedService.banners(),
    featured: feedService.featured(4),
  });
});

homeRouter.get('/up/:mid/videos', (req, res) => {
  ok(
    res,
    feedService.ownerVideos(
      Number(req.params.mid),
      Number(req.query.limit) || 6,
      req.query.exclude as string | undefined,
    ),
  );
});

/** 顶栏悬浮面板用到的个人数据 */
homeRouter.get('/me/watchlater', (_req, res) => ok(res, interactionService.watchLater()));
homeRouter.get('/me/favorites', (_req, res) => ok(res, interactionService.favorites()));
homeRouter.get('/me/history', (_req, res) => ok(res, interactionService.history()));
