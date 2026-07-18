import { Router } from 'express';
import { bilibiliApi } from '../services/bilibili-api';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/video/:bvid', async (req, res) => {
  try {
    const { bvid } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const sort = parseInt(req.query.sort as string) || 0;
    const comments = await bilibiliApi.getComments(bvid, page, sort);
    res.json({
      code: 0,
      message: 'success',
      data: comments
    });
  } catch (error: any) {
    res.status(500).json({
      code: -1,
      message: error.message || '获取评论失败',
      data: null
    });
  }
});

router.post('/video/:bvid', requireAuth, async (req, res) => {
  try {
    const { bvid } = req.params;
    const { content, replyId } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        code: -1,
        message: '评论内容不能为空',
        data: null
      });
    }

    const result = await bilibiliApi.sendComment(bvid, content.trim(), replyId);
    res.json({
      code: result.code,
      message: result.message,
      data: result.data
    });
  } catch (error: any) {
    res.status(500).json({
      code: -1,
      message: error.message || '发送评论失败',
      data: null
    });
  }
});

router.post('/:rpid/like', requireAuth, async (req, res) => {
  try {
    const { rpid } = req.params;
    const type = req.body.type === 'cancel' ? 'cancel' : 'add';
    const result = await bilibiliApi.likeComment(parseInt(rpid), type);
    res.json({
      code: result.code,
      message: result.code === 0 ? (type === 'add' ? '点赞成功' : '取消点赞') : '操作失败',
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