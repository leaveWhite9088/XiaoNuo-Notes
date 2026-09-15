const express = require('express');
const router = express.Router();

/**
 * GET /api/ranking
 * 全站热播榜（右侧栏用）
 */
router.get('/', (req, res) => {
  const { store } = req.app.locals;
  res.json({ items: store.ranking });
});

module.exports = router;
