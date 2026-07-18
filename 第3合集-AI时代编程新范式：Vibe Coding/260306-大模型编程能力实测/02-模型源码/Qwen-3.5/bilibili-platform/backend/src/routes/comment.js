const express = require('express');
const router = express.Router();
const { Bilibili } = require('../utils/bilibili');

router.get('/:bvid', async (req, res, next) => {
  try {
    const { bvid } = req.params;
    const api = new Bilibili(req.session.cookies);
    const comments = await api.getComments(bvid);
    res.json({ success: true, data: comments });
  } catch (error) {
    next(error);
  }
});

router.post('/send', async (req, res, next) => {
  try {
    const { bvid, message, replyId } = req.body;
    const api = new Bilibili(req.session.cookies);
    const result = await api.sendComment(bvid, message, replyId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(401).json({ success: false, error: '需要登录' });
  }
});

router.post('/reply', async (req, res, next) => {
  try {
    const { bvid, rootId, message } = req.body;
    const api = new Bilibili(req.session.cookies);
    const result = await api.replyComment(bvid, rootId, message);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(401).json({ success: false, error: '需要登录' });
  }
});

router.post('/like', async (req, res, next) => {
  try {
    const { bvid, rpid, action } = req.body;
    const api = new Bilibili(req.session.cookies);
    const result = await api.likeComment(bvid, rpid, action);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(401).json({ success: false, error: '需要登录' });
  }
});

module.exports = router;
