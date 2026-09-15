import { Router } from 'express';
import { suggest, hotSearch } from '../services/searchService.js';
import { searchVideos } from '../services/videoService.js';

export const searchRouter = Router();

// GET /api/search/suggest?q=xxx
searchRouter.get('/suggest', (req, res) => {
  res.json({ code: 0, message: 'ok', data: suggest(req.query.q, req.query.limit) });
});

// GET /api/search/hot
searchRouter.get('/hot', (_req, res) => {
  res.json({ code: 0, message: 'ok', data: hotSearch() });
});

// GET /api/search?q=xxx&page=1&page_size=20
searchRouter.get('/', (req, res) => {
  const data = searchVideos(req.query.q, req.query.page, req.query.page_size);
  res.json({ code: 0, message: 'ok', data });
});
