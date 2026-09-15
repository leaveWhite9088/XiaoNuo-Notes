const express = require('express');
const router = express.Router();

/**
 * GET /api/up/:id
 * UP主信息 + 投稿列表
 */
router.get('/:id', (req, res) => {
  const { store } = req.app.locals;
  const up = store.upById[req.params.id];
  if (!up) return res.status(404).json({ error: 'up_not_found' });
  const videos = store.videos
    .filter((v) => v.upId === up.id)
    .map((v) => ({
      id: v.id,
      title: v.title,
      cover: v.cover,
      playCount: v.playCount,
      playCountLabel: formatCount(v.playCount),
      duration: v.duration,
      durationLabel: formatDuration(v.duration),
    }));
  res.json({ up, videos });
});

function formatCount(n) {
  if (n == null) return '0';
  if (n < 10000) return String(n);
  if (n < 1e8) return (n / 10000).toFixed(n < 1e5 ? 1 : 0).replace(/\.0$/, '') + '万';
  return (n / 1e8).toFixed(1).replace(/\.0$/, '') + '亿';
}
function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

module.exports = router;
