import { all, get, run, transaction } from '../db/index.js';

/** 版权内容（PGC）仓储：番剧 / 国创 / 综艺 的真实封面与评分 */

export function replaceForCategory(categoryId, items = []) {
  transaction(() => {
    run('DELETE FROM pgc_items WHERE category_id = ?', [categoryId]);
    items.slice(0, 24).forEach((item, index) => {
      run(
        `INSERT INTO pgc_items
           (season_id, category_id, title, cover, horizontal_cover, rating, play_text,
            badge, badge_color, update_info, url, rank)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(season_id) DO UPDATE SET
           category_id = excluded.category_id,
           title = excluded.title,
           cover = excluded.cover,
           rating = excluded.rating,
           play_text = excluded.play_text,
           badge = excluded.badge,
           badge_color = excluded.badge_color,
           update_info = excluded.update_info,
           rank = excluded.rank`,
        [
          item.seasonId, categoryId, item.title, item.cover, item.horizontalCover ?? '',
          item.rating ?? '', item.playText ?? '', item.badge ?? '', item.badgeColor ?? '',
          item.updateInfo ?? '', item.url ?? '', index + 1,
        ],
      );
    });
  });
  return items.length;
}

export function findByCategory(categoryId, limit = 12) {
  return all(
    'SELECT * FROM pgc_items WHERE category_id = ? ORDER BY rank ASC LIMIT ?',
    [categoryId, limit],
  );
}

export function count() {
  return get('SELECT COUNT(*) AS n FROM pgc_items')?.n ?? 0;
}

export default { replaceForCategory, findByCategory, count };
