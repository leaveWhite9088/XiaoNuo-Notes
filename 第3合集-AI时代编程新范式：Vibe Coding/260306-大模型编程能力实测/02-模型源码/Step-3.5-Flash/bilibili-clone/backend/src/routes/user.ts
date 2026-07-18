import { Router } from 'express';
import { bilibiliApi } from '../services/bilibili-api';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/info', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userInfo = await bilibiliApi.getUserInfo();
    res.json({
      code: 0,
      message: 'success',
      data: userInfo
    });
  } catch (error: any) {
    res.status(500).json({
      code: -1,
      message: error.message || '获取用户信息失败',
      data: null
    });
  }
});

router.get('/:mid', async (req, res) => {
  try {
    const { mid } = req.params;
    const userInfo = await bilibiliApi.getUserInfo(parseInt(mid));
    res.json({
      code: 0,
      message: 'success',
      data: userInfo
    });
  } catch (error: any) {
    res.status(500).json({
      code: -1,
      message: error.message || '获取用户信息失败',
      data: null
    });
  }
});

router.get('/favorites', requireAuth, async (req: AuthRequest, res) => {
  try {
    const mid = req.user!.mid;
    const favorites = await bilibiliApi.getUserFavorites(mid);
    res.json({
      code: 0,
      message: 'success',
      data: favorites
    });
  } catch (error: any) {
    res.status(500).json({
      code: -1,
      message: error.message || '获取收藏夹失败',
      data: null
    });
  }
});

router.get('/favorites/:fid/videos', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { fid } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const videos = await bilibiliApi.getFavoriteVideos(parseInt(fid), page);
    res.json({
      code: 0,
      message: 'success',
      data: videos
    });
  } catch (error: any) {
    res.status(500).json({
      code: -1,
      message: error.message || '获取收藏视频失败',
      data: null
    });
  }
});

router.get('/favorites/check/:aid', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { aid } = req.params;
    const isFav = await bilibiliApi.isFavoriteVideo(parseInt(aid));
    res.json({
      code: 0,
      message: 'success',
      data: { isFavorite: isFav }
    });
  } catch (error: any) {
    res.status(500).json({
      code: -1,
      message: error.message || '检查收藏状态失败',
      data: null
    });
  }
});

router.post('/favorites/toggle', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { aid, fid } = req.body;

    if (!aid || !fid) {
      return res.status(400).json({
        code: -1,
        message: '参数不完整',
        data: null
      });
    }

    const result = await bilibiliApi.toggleFavorite(parseInt(aid), parseInt(fid));
    res.json({
      code: result.code,
      message: result.code === 0 ? '操作成功' : '操作失败',
      data: null
    });
  } catch (error: any) {
    res.status(500).json({
      code: -1,
      message: error.message || '操作失败',
      data: null
    });
  }
});

export default router;