import { all, get, run, transaction } from '../db/index.js';

/** 热搜 / 搜索历史 / 观看记录 仓储 */

export function replaceHotSearches(items = []) {
  transaction(() => {
    run('DELETE FROM hot_searches');
    items.forEach((item, index) => {
      run(
        'INSERT INTO hot_searches (keyword, tag, heat, sort_order) VALUES (?, ?, ?, ?)',
        [item.keyword, item.tag ?? '', item.heat ?? 0, index + 1],
      );
    });
  });
  return items.length;
}

export function findHotSearches(limit = 10) {
  return all('SELECT * FROM hot_searches ORDER BY sort_order ASC LIMIT ?', [limit]);
}

/** 关键词建议：热搜优先 + 命中标题的联想 */
export function suggestByKeyword(keyword, limit = 10) {
  const like = `${keyword}%`;
  const contains = `%${keyword}%`;
  return all(
    `SELECT keyword, tag, heat, 'hot' AS source FROM hot_searches
       WHERE keyword LIKE ?
     UNION
     SELECT DISTINCT title AS keyword, '视频' AS tag, COALESCE(view, 0) AS heat, 'video' AS source
       FROM videos v LEFT JOIN video_stats s ON s.bvid = v.bvid
       WHERE v.title LIKE ?
     UNION
     SELECT DISTINCT owner_name AS keyword, 'UP主' AS tag, 0 AS heat, 'up' AS source
       FROM videos WHERE owner_name LIKE ?
     LIMIT ?`,
    [contains, contains, like, limit],
  );
}

export function logSearch(keyword) {
  run('INSERT INTO search_logs (keyword, created_at) VALUES (?, ?)', [keyword, Date.now()]);
}

export function recentSearches(limit = 8) {
  return all(
    'SELECT keyword, MAX(created_at) AS at FROM search_logs GROUP BY keyword ORDER BY at DESC LIMIT ?',
    [limit],
  );
}

export function clearSearchLogs() {
  run('DELETE FROM search_logs');
}

/* ------------------------- 观看历史 / 收藏 ------------------------- */

export function upsertHistory({ bvid, title, cover, progress = 0, duration = 0 }) {
  run(
    `INSERT INTO watch_history (bvid, title, cover, progress, duration, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(bvid) DO UPDATE SET
       progress = excluded.progress, updated_at = excluded.updated_at`,
    [bvid, title, cover, progress, duration, Date.now()],
  );
}

export function findHistory(limit = 12) {
  return all('SELECT * FROM watch_history ORDER BY updated_at DESC LIMIT ?', [limit]);
}

export function addFavorite(bvid) {
  run(
    'INSERT INTO favorites (bvid, created_at) VALUES (?, ?) ON CONFLICT(bvid) DO NOTHING',
    [bvid, Date.now()],
  );
  return get('SELECT COUNT(*) AS n FROM favorites')?.n ?? 0;
}

export function removeFavorite(bvid) {
  run('DELETE FROM favorites WHERE bvid = ?', [bvid]);
  return get('SELECT COUNT(*) AS n FROM favorites')?.n ?? 0;
}

export function favoriteCount() {
  return get('SELECT COUNT(*) AS n FROM favorites')?.n ?? 0;
}

export function isFavorite(bvid) {
  return Boolean(get('SELECT 1 AS ok FROM favorites WHERE bvid = ?', [bvid]));
}

export function trendingKeywords(limit = 8) {
  return all(
    'SELECT keyword, COUNT(*) AS n FROM search_logs GROUP BY keyword ORDER BY n DESC LIMIT ?',
    [limit],
  );
}

export default {
  replaceHotSearches, findHotSearches, suggestByKeyword, logSearch, recentSearches,
  clearSearchLogs, upsertHistory, findHistory, addFavorite, removeFavorite, favoriteCount,
  isFavorite, trendingKeywords,
};
