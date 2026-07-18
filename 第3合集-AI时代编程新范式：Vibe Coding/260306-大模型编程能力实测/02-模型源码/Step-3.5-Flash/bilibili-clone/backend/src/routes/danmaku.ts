import { Router } from 'express';
import { bilibiliApi } from '../services/bilibili-api';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/video/:bvid', async (req, res) => {
  try {
    const { bvid } = req.params;
    const { cid } = req.query;

    if (!cid) {
      return res.status(400).json({
        code: -1,
        message: '缺少cid参数',
        data: null
      });
    }

    const danmakuList = await bilibiliApi.getDanmaku(bvid, parseInt(cid as string));
    res.json({
      code: 0,
      message: 'success',
      data: danmakuList
    });
  } catch (error: any) {
    res.status(500).json({
      code: -1,
      message: error.message || '获取弹幕失败',
      data: null
    });
  }
});

router.post('/video/:bvid', requireAuth, async (req, res) => {
  try {
    const { bvid } = req.params;
    const { cid, content, time, color } = req.body;

    if (!cid || !content || time === undefined) {
      return res.status(400).json({
        code: -1,
        message: '参数不完整',
        data: null
      });
    }

    const result = await bilibiliApi.sendDanmaku(bvid, parseInt(cid), content, time, color);
    res.json({
      code: result.code,
      message: result.message,
      data: result.data
    });
  } catch (error: any) {
    res.status(500).json({
      code: -1,
      message: error.message || '发送弹幕失败',
      data: null
    });
  }
});

export default router;