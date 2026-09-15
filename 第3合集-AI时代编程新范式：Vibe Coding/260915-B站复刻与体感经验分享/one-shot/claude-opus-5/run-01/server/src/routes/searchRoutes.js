import { Router } from 'express';
import { getHotSearches, search, suggest } from '../services/searchService.js';

const router = Router();

router.get('/search/suggest', (req, res) => {
  const keyword = String(req.query.keyword ?? req.query.q ?? '');
  res.json({ code: 0, data: suggest(keyword) });
});

router.get('/search/hot', (req, res) => {
  res.json({ code: 0, data: getHotSearches() });
});

router.get('/search', (req, res) => {
  const keyword = String(req.query.keyword ?? req.query.q ?? '');
  const page = Number.parseInt(String(req.query.page ?? '1'), 10) || 1;
  const order = String(req.query.order ?? 'totalrank');
  res.json({ code: 0, data: search({ keyword, page, pageSize: 20, order }) });
});

export default router;
