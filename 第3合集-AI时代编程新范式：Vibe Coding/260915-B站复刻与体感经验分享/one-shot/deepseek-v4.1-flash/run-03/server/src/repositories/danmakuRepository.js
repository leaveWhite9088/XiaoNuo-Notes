import { all, get, run, transaction } from '../db/index.js';

/** 弹幕仓储 */

export function findByBvid(bvid, limit = 300) {
  return all(
    'SELECT time_ms AS timeMs, content, color, mode FROM danmaku WHERE bvid = ? ORDER BY time_ms ASC LIMIT ?',
    [bvid, limit],
  );
}

export function insertMany(items = []) {
  transaction(() => {
    const stmt = `INSERT INTO danmaku (bvid, time_ms, content, color, mode) VALUES (?, ?, ?, ?, ?)`;
    for (const d of items) {
      run(stmt, [d.bvid, d.timeMs, d.content, d.color ?? '#FFFFFF', d.mode ?? 1]);
    }
  });
  return items.length;
}

export function clear() {
  run('DELETE FROM danmaku');
}

export function count() {
  return get('SELECT COUNT(*) AS n FROM danmaku')?.n ?? 0;
}

export default { findByBvid, insertMany, clear, count };
