const express = require('express');
const router = express.Router();
const { Bilibili } = require('../utils/bilibili');

router.get('/', async (req, res, next) => {
  try {
    const { keyword, page = 1, pagesize = 20 } = req.query;
    const api = new Bilibili(req.session.cookies);
    const results = await api.search(keyword, page, pagesize);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

router.get('/suggestion', async (req, res, next) => {
  try {
    const { term } = req.query;
    const api = new Bilibili(req.session.cookies);
    const suggestions = await api.getSearchSuggestion(term);
    res.json({ success: true, data: suggestions });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
