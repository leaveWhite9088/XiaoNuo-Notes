import { Router } from 'express';
import { videos, recommended, CATEGORIES } from '../data/videos.js';

const router = Router();

const cardOf = (v) => ({
  bvid: v.bvid,
  title: v.title,
  cover: v.cover,
  duration: v.duration,
  views: v.views,
  danmaku: v.danmaku,
  pubdate: v.pubdate,
  category: v.category,
  up: { mid: v.up.mid, name: v.up.name }
});

router.get('/categories', (req, res) => {
  res.json({ list: ['推荐', '热门', ...CATEGORIES] });
});

// 首页视频流：支持分类筛选 / 关键词搜索 / 分页
router.get('/feed', (req, res) => {
  const { category = '推荐', q = '', page = '1', pageSize = '12' } = req.query;
  const p = Math.max(1, parseInt(page, 10) || 1);
  const size = Math.min(24, Math.max(1, parseInt(pageSize, 10) || 12));

  let list;
  if (q.trim()) {
    const kw = q.trim().toLowerCase();
    list = videos.filter(
      (v) =>
        v.title.toLowerCase().includes(kw) ||
        v.up.name.toLowerCase().includes(kw) ||
        v.category.includes(kw) ||
        v.tags.some((t) => t.toLowerCase().includes(kw))
    );
  } else if (category === '热门') {
    list = [...videos].sort((a, b) => b.views - a.views);
  } else if (category === '推荐') {
    list = recommended;
  } else {
    list = videos.filter((v) => v.category === category);
  }

  const total = list.length;
  const items = list.slice((p - 1) * size, p * size).map(cardOf);
  res.json({ list: items, total, page: p, hasMore: p * size < total });
});

export default router;
