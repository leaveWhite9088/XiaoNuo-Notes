const express = require('express');
const { searchVideos, suggest } = require('../services/videoService');

const router = express.Router();

// GET /api/search?keyword=xx
router.get('/search', (req, res) => {
  const keyword = (req.query.keyword || req.query.q || '').trim();
  const items = searchVideos(keyword);
  res.json({ code: 0, data: { keyword, total: items.length, items } });
});

// GET /api/search/suggest?q=xx
router.get('/search/suggest', (req, res) => {
  const q = (req.query.q || '').trim();
  res.json({ code: 0, data: suggest(q) });
});

module.exports = router;
