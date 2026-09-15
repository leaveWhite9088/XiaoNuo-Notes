// 路由层：/api 全部 HTTP 端点
import { Router } from 'express';
import * as service from '../services/videoService.js';

const router = Router();

router.get('/health', (_req, res) => res.json(service.health()));

router.get('/categories', (_req, res) => res.json({ code: 0, data: service.categories() }));

router.get('/feed', (req, res) => {
  const { cat, page, size } = req.query;
  res.json({ code: 0, data: service.getFeed({ cat, page, size }) });
});

router.get('/video/:id', (req, res) => {
  const data = service.getDetail(req.params.id);
  if (!data) return res.status(404).json({ code: -404, message: '视频不存在' });
  res.json({ code: 0, data });
});

router.get('/search/suggest', async (req, res) => {
  const data = await service.suggest(req.query.kw ?? '');
  res.json({ code: 0, data });
});

router.get('/search', (req, res) => {
  const { q, page } = req.query;
  res.json({ code: 0, data: service.search(q, Number(page) || 1) });
});

export default router;
