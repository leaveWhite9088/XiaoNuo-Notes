import { Router } from 'express';
import { feedService } from '../services/feedService.js';
import { interactionService } from '../services/interactionService.js';
import { ok } from '../middleware/errorHandler.js';
import type { UserAction } from '../repositories/userRepo.js';

export const videosRouter = Router();

/** 首页信息流：/api/videos?channel=game&sort=recommend&page=1&seed=123 */
videosRouter.get('/', (req, res) => {
  ok(
    res,
    feedService.feed({
      channelId: req.query.channel as string | undefined,
      sort: req.query.sort as string | undefined,
      page: Number(req.query.page),
      pageSize: Number(req.query.pageSize),
      seed: Number(req.query.seed),
    }),
  );
});

videosRouter.get('/:bvid', (req, res) => {
  ok(res, feedService.detail(req.params.bvid));
});

videosRouter.get('/:bvid/related', (req, res) => {
  ok(res, feedService.related(req.params.bvid, Number(req.query.limit) || 12));
});

videosRouter.get('/:bvid/comments', (req, res) => {
  ok(res, interactionService.comments(req.params.bvid, String(req.query.sort ?? 'hot')));
});

videosRouter.get('/:bvid/danmaku', (req, res) => {
  ok(res, interactionService.danmaku(req.params.bvid));
});

/** 进入播放页时上报一次播放（播放量 +1） */
videosRouter.post('/:bvid/play', (req, res) => {
  ok(res, feedService.registerPlay(req.params.bvid));
});

/** 离开播放页时上报进度（只写观看历史，不计播放量） */
videosRouter.post('/:bvid/progress', (req, res) => {
  ok(res, feedService.saveProgress(req.params.bvid, Number(req.body?.progress) || 0));
});

const ACTIONS: UserAction[] = ['like', 'coin', 'favorite', 'watchlater'];

videosRouter.post('/:bvid/actions/:action', (req, res) => {
  const action = req.params.action as UserAction;
  if (!ACTIONS.includes(action)) {
    res.status(400).json({ code: 400, message: `不支持的操作: ${action}`, data: null });
    return;
  }
  ok(res, interactionService.toggle(req.params.bvid, action));
});

videosRouter.post('/:bvid/triple', (req, res) => {
  ok(res, interactionService.tripleAction(req.params.bvid));
});
