// 路由层：REST API
import { Router } from 'express';
import * as svc from '../services/videoService.js';

const router = Router();

// 分类（频道）列表
router.get('/categories', (_req, res) => {
  res.json({ code: 0, data: svc.getCategories() });
});

// 视频流：分类筛选 / 关键词搜索 / 分页 / 排序
router.get('/videos', (req, res) => {
  const { category, keyword, page, pageSize, sort } = req.query;
  const data = svc.listVideos({
    category,
    keyword,
    page: Number(page) || 1,
    pageSize: Math.min(Number(pageSize) || 20, 50),
    sort
  });
  res.json({ code: 0, data });
});

// 搜索建议
router.get('/search/suggestions', (req, res) => {
  res.json({ code: 0, data: svc.searchSuggestions(String(req.query.keyword || '')) });
});

// 视频详情
router.get('/videos/:id', (req, res) => {
  const v = svc.getVideo(req.params.id);
  if (!v) return res.status(404).json({ code: 40400, message: '视频不存在' });
  res.json({ code: 0, data: v });
});

// 相关推荐
router.get('/videos/:id/related', (req, res) => {
  res.json({ code: 0, data: svc.getRelated(req.params.id, Number(req.query.limit) || 8) });
});

// 点赞
router.post('/videos/:id/like', (req, res) => {
  const v = svc.likeVideo(req.params.id);
  if (!v) return res.status(404).json({ code: 40400, message: '视频不存在' });
  res.json({ code: 0, data: v });
});

export default router;
