import { Router } from 'express';
import {
  getComments,
  getDanmaku,
  getVideoDetail,
  interact,
  sendDanmaku,
} from '../services/videoService.js';

const router = Router();

router.get('/videos/:bvid', (req, res, next) => {
  try {
    res.json({ code: 0, data: getVideoDetail(req.params.bvid) });
  } catch (err) {
    next(err);
  }
});

router.get('/videos/:bvid/comments', (req, res, next) => {
  try {
    const page = Number.parseInt(String(req.query.page ?? '1'), 10) || 1;
    res.json({ code: 0, data: getComments(req.params.bvid, { page, pageSize: 10 }) });
  } catch (err) {
    next(err);
  }
});

router.get('/videos/:bvid/danmaku', (req, res, next) => {
  try {
    res.json({ code: 0, data: getDanmaku(req.params.bvid) });
  } catch (err) {
    next(err);
  }
});

router.post('/videos/:bvid/danmaku', (req, res, next) => {
  try {
    res.json({ code: 0, data: sendDanmaku(req.params.bvid, req.body ?? {}) });
  } catch (err) {
    next(err);
  }
});

/** POST /api/videos/:bvid/interact { action: 'like' | 'coin' | 'favorite' | 'share', delta } */
router.post('/videos/:bvid/interact', (req, res, next) => {
  try {
    const { action, delta } = req.body ?? {};
    res.json({ code: 0, data: interact(req.params.bvid, action, Number(delta) || 1) });
  } catch (err) {
    next(err);
  }
});

export default router;
