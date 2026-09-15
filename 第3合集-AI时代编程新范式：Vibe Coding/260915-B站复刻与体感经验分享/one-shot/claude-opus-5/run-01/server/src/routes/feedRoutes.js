import { Router } from 'express';
import { getBanners, getFeed } from '../services/feedService.js';
import { getNavConfig, listNavChannels } from '../repositories/channelRepository.js';

const router = Router();

/** 顶部导航 + 分区 + 排序方式 + 热搜，前端启动时拉一次 */
router.get('/config', (req, res) => {
  res.json({ code: 0, data: getNavConfig() });
});

router.get('/channels', (req, res) => {
  res.json({ code: 0, data: listNavChannels() });
});

router.get('/banners', (req, res) => {
  res.json({ code: 0, data: getBanners() });
});

/** GET /api/feed?channel=game&sort=hot&page=1&pageSize=20&refresh=2 */
router.get('/feed', (req, res, next) => {
  try {
    const data = getFeed({
      channelId: req.query.channel ? String(req.query.channel) : 'all',
      sort: req.query.sort ? String(req.query.sort) : 'recommend',
      page: toInt(req.query.page, 1),
      pageSize: Math.min(60, toInt(req.query.pageSize, 20)),
      refresh: toInt(req.query.refresh, 0),
    });
    res.json({ code: 0, data });
  } catch (err) {
    next(err);
  }
});

function toInt(value, fallback) {
  const n = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export default router;
