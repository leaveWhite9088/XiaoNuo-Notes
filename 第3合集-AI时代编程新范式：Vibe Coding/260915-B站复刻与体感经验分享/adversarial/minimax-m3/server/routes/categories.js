const express = require('express');
const router = express.Router();

/**
 * GET /api/categories
 * 返回所有一级 + 二级分区
 */
router.get('/', (req, res) => {
  const { store } = req.app.locals;
  res.json({ items: store.categories });
});

module.exports = router;
