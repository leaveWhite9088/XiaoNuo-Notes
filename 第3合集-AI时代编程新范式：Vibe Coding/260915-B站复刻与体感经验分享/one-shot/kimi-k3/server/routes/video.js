import { Router } from 'express';
import { videos } from '../data/videos.js';
import { getComments } from '../data/comments.js';

const router = Router();

// 视频详情 + 评论 + 相关推荐
router.get('/video/:bvid', (req, res) => {
  const v = videos.find((x) => x.bvid === req.params.bvid);
  if (!v) return res.status(404).json({ message: '视频不存在' });

  const related = videos
    .filter((x) => x.bvid !== v.bvid)
    .sort((a, b) => {
      const sa = (a.category === v.category ? 1 : 0) * 1e12 + a.views;
      const sb = (b.category === v.category ? 1 : 0) * 1e12 + b.views;
      return sb - sa;
    })
    .slice(0, 10)
    .map((x) => ({
      bvid: x.bvid,
      title: x.title,
      cover: x.cover,
      duration: x.duration,
      views: x.views,
      danmaku: x.danmaku,
      category: x.category,
      up: { mid: x.up.mid, name: x.up.name }
    }));

  res.json({
    ...v,
    comments: getComments(v.bvid),
    related
  });
});

export default router;
