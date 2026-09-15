import { all, get, run, transaction } from '../db/index.js';

/** 分区仓储 */

export function findAll() {
  return all('SELECT * FROM categories ORDER BY sort_order ASC');
}

export function findNav() {
  return all('SELECT * FROM categories WHERE is_nav = 1 ORDER BY sort_order ASC');
}

export function findFilters() {
  return all('SELECT * FROM categories WHERE is_filter = 1 ORDER BY sort_order ASC');
}

export function findBySlug(slug) {
  return get('SELECT * FROM categories WHERE slug = ?', [slug]);
}

export function findById(id) {
  return get('SELECT * FROM categories WHERE id = ?', [id]);
}

export function upsertMany(categories = []) {
  transaction(() => {
    for (const c of categories) {
      run(
        `INSERT INTO categories (slug, name, rid, icon, accent, intro, sort_order, is_nav, is_filter)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(slug) DO UPDATE SET
           name = excluded.name,
           rid = excluded.rid,
           icon = excluded.icon,
           accent = excluded.accent,
           intro = excluded.intro,
           sort_order = excluded.sort_order,
           is_nav = excluded.is_nav,
           is_filter = excluded.is_filter`,
        [
          c.slug, c.name, c.rid ?? null, c.icon ?? '', c.accent ?? '', c.intro ?? '',
          c.sortOrder ?? 0, c.isNav ? 1 : 0, c.isFilter === false ? 0 : 1,
        ],
      );
    }
  });
  return categories.length;
}

/** 每个分区下的视频数量，用于筛选条角标 */
export function countByCategory() {
  const rows = all(
    `SELECT c.id, c.slug, COUNT(v.bvid) AS total
     FROM categories c LEFT JOIN videos v ON v.category_id = c.id
     GROUP BY c.id`,
  );
  return Object.fromEntries(rows.map((r) => [r.slug, r.total]));
}

export default { findAll, findNav, findFilters, findBySlug, findById, upsertMany, countByCategory };
