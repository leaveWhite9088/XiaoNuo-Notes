import { Router } from 'express';
import { bilibiliApi } from '../services/bilibili-api';

const router = Router();

router.get('/:bvid', async (req, res) => {
  const { bvid } = req.params;
  const videoInfo = await bilibiliApi.getVideoInfo(bvid);
  res.json({ code: 0, message: 'success', data: videoInfo });
});

router.get('/:bvid/play/:cid', async (req, res) => {
  const { bvid, cid } = req.params;
  const quality = req.query.quality ? parseInt(req.query.quality as string) : undefined;
  const playUrl = await bilibiliApi.getVideoPlayUrl(bvid, parseInt(cid), quality);
  res.json({ code: 0, message: 'success', data: playUrl });
});

router.get('/:bvid/related', async (req, res) => {
  const { bvid } = req.params;
  const related = await bilibiliApi.getRelatedVideos(bvid);
  res.json({ code: 0, message: 'success', data: related });
});

router.get('/search/:keyword', async (req, res) => {
  const { keyword } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const results = await bilibiliApi.searchVideos(keyword, page);
  res.json({ code: 0, message: 'success', data: results });
});

router.get('/popular', async (req, res) => {
  const ps = parseInt(req.query.ps as string) || 30;
  const popular = await bilibiliApi.getPopularVideos(ps);
  res.json({ code: 0, message: 'success', data: popular });
});

export default router;