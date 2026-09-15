import { Router } from 'express';
import { videos } from '../data/videos.js';

const router = Router();

const HOT_SEARCHES = [
  '四月新番', 'AI编程', '红烧肉', '速通', '戏腔翻唱',
  '折叠屏', '租房改造', '川藏线', '年度十佳电影', '量子力学'
];

// 搜索建议：空关键词返回热搜榜，否则按标题/UP主/标签匹配
router.get('/search/suggest', (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  if (!q) {
    return res.json({ type: 'hot', list: HOT_SEARCHES });
  }
  const matched = [];
  for (const v of videos) {
    if (matched.length >= 8) break;
    if (
      v.title.toLowerCase().includes(q) ||
      v.up.name.toLowerCase().includes(q) ||
      v.tags.some((t) => t.toLowerCase().includes(q))
    ) {
      if (!matched.includes(v.title)) matched.push(v.title);
    }
  }
  res.json({ type: 'suggest', list: matched });
});

export default router;
