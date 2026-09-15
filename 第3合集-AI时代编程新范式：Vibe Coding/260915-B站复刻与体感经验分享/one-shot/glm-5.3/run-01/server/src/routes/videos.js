import { Router } from 'express';
import { listFeed, getVideo, getRelated } from '../services/videoService.js';

export const videoRouter = Router();

// GET /api/feed?region=home|hot|<分区key>&page=1&page_size=20
videoRouter.get('/', (req, res) => {
  const data = listFeed({
    region: String(req.query.region || 'home'),
    page: req.query.page,
    pageSize: req.query.page_size,
  });
  res.json({ code: 0, message: 'ok', data });
});

// GET /api/video/:id/related?limit=10
videoRouter.get('/:id/related', (req, res) => {
  res.json({ code: 0, message: 'ok', data: getRelated(req.params.id, req.query.limit) });
});

// GET /api/video/:id
videoRouter.get('/:id', (req, res) => {
  const video = getVideo(req.params.id);
  if (!video) return res.status(404).json({ code: 404, message: `视频不存在: ${req.params.id}`, data: null });
  res.json({ code: 0, message: 'ok', data: video });
});
