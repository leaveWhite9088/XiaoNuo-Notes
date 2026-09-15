import { Router } from 'express';
import { getComments, addComment } from '../services/commentService.js';

export const commentRouter = Router();

// GET /api/comments/:videoId
commentRouter.get('/:videoId', (req, res) => {
  const data = getComments(req.params.videoId);
  if (!data) return res.status(404).json({ code: 404, message: `视频不存在: ${req.params.videoId}`, data: null });
  res.json({ code: 0, message: 'ok', data });
});

// POST /api/comments/:videoId  body: { content }
commentRouter.post('/:videoId', (req, res, next) => {
  try {
    const comment = addComment(req.params.videoId, { content: req.body?.content, name: req.body?.name });
    if (!comment) return res.status(404).json({ code: 404, message: `视频不存在: ${req.params.videoId}`, data: null });
    res.json({ code: 0, message: 'ok', data: comment });
  } catch (err) {
    next(err);
  }
});
