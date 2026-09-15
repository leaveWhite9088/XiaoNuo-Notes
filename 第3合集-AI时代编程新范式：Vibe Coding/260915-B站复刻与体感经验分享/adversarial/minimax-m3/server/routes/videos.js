const express = require('express');
const router = express.Router();

/**
 * GET /api/videos
 * Query:
 *   category   - 分区 tid，可选；不传或 all 表示"全部"
 *   page       - 1-based 页码
 *   pageSize   - 默认 30
 *   sort       - 'default' | 'play' | 'danmaku' | 'new'
 * 返回 { items, total, page, pageSize, hasMore, category, categories }
 */
router.get('/', (req, res) => {
  const { store } = req.app.locals;
  const category = req.query.category || 'all';
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 30));
  const sort = req.query.sort || 'default';

  let list = store.videos.slice();
  if (category && category !== 'all') {
    list = list.filter((v) => v.category === category);
  }

  if (sort === 'play') {
    list.sort((a, b) => b.playCount - a.playCount);
  } else if (sort === 'danmaku') {
    list.sort((a, b) => b.danmakuCount - a.danmakuCount);
  } else if (sort === 'new') {
    list.sort((a, b) => b.publishTimestamp - a.publishTimestamp);
  }

  const total = list.length;
  const start = (page - 1) * pageSize;
  const items = list.slice(start, start + pageSize);

  res.json({
    items: items.map(decorateVideo).map(attachUp(store)),
    total,
    page,
    pageSize,
    hasMore: start + items.length < total,
    category,
    categories: store.categories,
  });
});

/**
 * GET /api/videos/:id
 * 视频详情：基本信息 + UP主 + 相关推荐
 */
router.get('/:id', (req, res) => {
  const { store } = req.app.locals;
  const v = store.videoById[req.params.id];
  if (!v) return res.status(404).json({ error: 'video_not_found' });
  const up = store.upById[v.upId] || null;
  // 相关推荐：同分区优先（按热度排），不足再用同 UP 主或其他分区补足到 12
  const sameCat = store.videos
    .filter((x) => x.category === v.category && x.id !== v.id)
    .sort((a, b) => b.playCount - a.playCount);
  const sameUp = store.videos.filter(
    (x) => x.upId === v.upId && x.id !== v.id && x.category !== v.category,
  );
  const others = store.videos.filter(
    (x) => x.id !== v.id && x.category !== v.category && x.upId !== v.upId,
  );
  const merged = [...sameCat];
  for (const x of sameUp) if (merged.length < 12 && !merged.includes(x)) merged.push(x);
  for (const x of others) if (merged.length < 12 && !merged.includes(x)) merged.push(x);
  const related = merged.slice(0, 12).map(decorateVideo).map(attachUp(store));
  res.json({
    video: decorateVideo(v),
    up,
    related,
  });
});

function decorateVideo(v) {
  return {
    id: v.id,
    title: v.title,
    cover: v.cover,
    duration: v.duration, // 秒
    durationLabel: formatDuration(v.duration),
    playCount: v.playCount,
    playCountLabel: formatCount(v.playCount),
    danmakuCount: v.danmakuCount,
    danmakuCountLabel: formatCount(v.danmakuCount),
    likeCount: v.likeCount,
    likeCountLabel: formatCount(v.likeCount),
    coinCount: v.coinCount,
    favoriteCount: v.favoriteCount,
    shareCount: v.shareCount,
    category: v.category,
    categoryName: v.categoryName,
    publishTimestamp: v.publishTimestamp,
    publishLabel: formatTimeAgo(v.publishTimestamp),
    description: v.description,
    src: v.src,
    upId: v.upId,
  };
}

function attachUp(store) {
  return (item) => ({ ...item, up: store.upById[item.upId] || null });
}

function formatDuration(sec) {
  if (!sec && sec !== 0) return '--';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatCount(n) {
  if (n == null) return '0';
  if (n < 10000) return String(n);
  if (n < 1e8) return (n / 10000).toFixed(n < 1e5 ? 1 : 0).replace(/\.0$/, '') + '万';
  return (n / 1e8).toFixed(1).replace(/\.0$/, '') + '亿';
}

function formatTimeAgo(ts) {
  if (!ts) return '';
  const diff = Math.max(0, Date.now() - ts);
  const min = Math.floor(diff / 60000);
  if (min < 1) return '刚刚';
  if (min < 60) return `${min}分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}小时前`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}天前`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}个月前`;
  return `${Math.floor(mo / 12)}年前`;
}

module.exports = router;
