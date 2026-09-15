const express = require('express');
const router = express.Router();

/**
 * GET /api/search
 * Query: q
 * 返回搜索建议（视频 + UP主 + 热搜词）
 */
router.get('/', (req, res) => {
  const { store } = req.app.locals;
  const q = (req.query.q || '').trim();
  if (!q) {
    return res.json({ q, suggestions: [], videos: [], ups: [], hot: store.hotSearches });
  }
  const lower = q.toLowerCase();
  const videos = store.videos
    .filter(
      (v) =>
        v.title.toLowerCase().includes(lower) ||
        (v.description || '').toLowerCase().includes(lower),
    )
    .slice(0, 8)
    .map((v) => ({
      id: v.id,
      title: v.title,
      cover: v.cover,
      playCount: v.playCount,
      playCountLabel: formatCount(v.playCount),
      category: v.category,
      categoryName: v.categoryName,
    }));
  const ups = store.ups
    .filter((u) => u.name.toLowerCase().includes(lower) || (u.sign || '').toLowerCase().includes(lower))
    .slice(0, 5)
    .map((u) => ({ id: u.id, name: u.name, avatar: u.avatar, followerCount: u.followerCount, followerCountLabel: formatCount(u.followerCount), sign: u.sign }));
  // 搜索建议：热搜词 + 标题前缀
  const suggestions = [];
  for (const h of store.hotSearches) {
    if (h.toLowerCase().includes(lower)) suggestions.push(h);
    if (suggestions.length >= 6) break;
  }
  for (const v of store.videos) {
    if (v.title.toLowerCase().includes(lower)) {
      suggestions.push(v.title);
    }
    if (suggestions.length >= 10) break;
  }
  res.json({ q, suggestions: Array.from(new Set(suggestions)).slice(0, 10), videos, ups });
});

function formatCount(n) {
  if (n == null) return '0';
  if (n < 10000) return String(n);
  if (n < 1e8) return (n / 10000).toFixed(n < 1e5 ? 1 : 0).replace(/\.0$/, '') + '万';
  return (n / 1e8).toFixed(1).replace(/\.0$/, '') + '亿';
}

module.exports = router;
