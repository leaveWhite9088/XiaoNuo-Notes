const express = require('express');
const router = express.Router();
const { Bilibili } = require('../utils/bilibili');

router.get('/detail/:bvid', async (req, res, next) => {
  try {
    const { bvid } = req.params;
    const api = new Bilibili(req.session.cookies);
    const detail = await api.getVideoDetail(bvid);
    res.json({ success: true, data: detail });
  } catch (error) {
    next(error);
  }
});

router.get('/recommend', async (req, res, next) => {
  try {
    const api = new Bilibili(req.session.cookies);
    const videos = await api.getRecommendVideos();
    res.json({ success: true, data: videos });
  } catch (error) {
    next(error);
  }
});

router.get('/popular', async (req, res, next) => {
  try {
    const api = new Bilibili(req.session.cookies);
    const videos = await api.getPopularVideos();
    res.json({ success: true, data: videos });
  } catch (error) {
    next(error);
  }
});

router.get('/region/:rid', async (req, res, next) => {
  try {
    const { rid } = req.params;
    const api = new Bilibili(req.session.cookies);
    const videos = await api.getRegionVideos(rid);
    res.json({ success: true, data: videos });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
