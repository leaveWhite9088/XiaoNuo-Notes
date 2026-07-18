const express = require('express');
const router = express.Router();
const { Bilibili } = require('../utils/bilibili');

router.get('/:bvid', async (req, res, next) => {
  try {
    const { bvid } = req.params;
    const api = new Bilibili(req.session.cookies);
    const danmaku = await api.getDanmaku(bvid);
    res.json({ success: true, data: danmaku });
  } catch (error) {
    next(error);
  }
});

router.post('/send', async (req, res, next) => {
  try {
    const { bvid, content, progress, mode, color, fontsize } = req.body;
    const api = new Bilibili(req.session.cookies);
    const result = await api.sendDanmaku(bvid, content, progress, mode, color, fontsize);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(401).json({ success: false, error: '需要登录' });
  }
});

router.get('/config/:bvid', async (req, res, next) => {
  try {
    const { bvid } = req.params;
    const api = new Bilibili(req.session.cookies);
    const config = await api.getDanmakuConfig(bvid);
    res.json({ success: true, data: config });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
