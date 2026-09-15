const express = require('express');
const { queryVideos, getVideoById, getRelated } = require('../services/videoService');
const { banners } = require('../data/videos');

const router = express.Router();

// GET /api/videos?category=xx&page=1&pageSize=10
router.get('/videos', (req, res) => {
  const { category = '推荐', page = 1, pageSize = 10 } = req.query;
  const result = queryVideos({
    category,
    page: Math.max(1, parseInt(page, 10) || 1),
    pageSize: Math.min(30, Math.max(1, parseInt(pageSize, 10) || 10)),
  });
  res.json({ code: 0, data: result });
});

// GET /api/videos/:id  （含相关推荐）
router.get('/videos/:id', (req, res) => {
  const video = getVideoById(req.params.id);
  if (!video) {
    return res.status(404).json({ code: 404, message: '视频不存在' });
  }
  res.json({ code: 0, data: { video, related: getRelated(video.id) } });
});

// GET /api/banners
router.get('/banners', (req, res) => {
  res.json({ code: 0, data: banners });
});

module.exports = router;
