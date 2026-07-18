const express = require('express');
const router = express.Router();
const { Bilibili } = require('../utils/bilibili');

router.get('/', async (req, res, next) => {
  try {
    const api = new Bilibili(req.session.cookies);
    const favorites = await api.getUserFavorites();
    res.json({ success: true, data: favorites });
  } catch (error) {
    res.status(401).json({ success: false, error: '需要登录' });
  }
});

router.get('/detail/:media_id', async (req, res, next) => {
  try {
    const { media_id } = req.params;
    const api = new Bilibili(req.session.cookies);
    const videos = await api.getFavoriteVideos(media_id);
    res.json({ success: true, data: videos });
  } catch (error) {
    next(error);
  }
});

router.post('/add', async (req, res, next) => {
  try {
    const { avid, addMediaIds, cancelMediaIds } = req.body;
    const api = new Bilibili(req.session.cookies);
    const result = await api.manageFavorite(avid, addMediaIds, cancelMediaIds);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(401).json({ success: false, error: '需要登录' });
  }
});

router.get('/folders', async (req, res, next) => {
  try {
    const api = new Bilibili(req.session.cookies);
    const folders = await api.getFavoriteFolders();
    res.json({ success: true, data: folders });
  } catch (error) {
    res.status(401).json({ success: false, error: '需要登录' });
  }
});

module.exports = router;
