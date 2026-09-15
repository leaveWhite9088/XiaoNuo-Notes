import { bindable, getDb } from '../db/sqlite.js';
import type { Banner, Category, Owner } from '../types.js';

/** 仓储层：分区 / 轮播 / 热搜 / UP主 等基础元数据 */
export const metaRepository = {
  // ---- 分区 ----
  allCategories(): Category[] {
    return getDb()
      .prepare('SELECT * FROM categories ORDER BY sort ASC')
      .all() as unknown as Category[];
  },

  categoryBySlug(slug: string): Category | undefined {
    return getDb().prepare('SELECT * FROM categories WHERE slug = ?').get(slug) as
      | Category
      | undefined;
  },

  insertCategories(rows: Category[]): void {
    const stmt = getDb().prepare(
      'INSERT OR REPLACE INTO categories (slug, name, rid, icon, sort) VALUES (?,?,?,?,?)',
    );
    for (const c of rows) stmt.run(c.slug, c.name, c.rid, c.icon, c.sort);
  },

  // ---- 轮播 ----
  banners(): Banner[] {
    return getDb()
      .prepare('SELECT * FROM banners ORDER BY sort ASC')
      .all() as unknown as Banner[];
  },

  insertBanners(rows: Banner[]): void {
    const stmt = getDb().prepare(
      'INSERT INTO banners (title, subtitle, image, link, sort) VALUES (?,?,?,?,?)',
    );
    for (const b of rows) stmt.run(b.title, b.subtitle, b.image, b.link, b.sort);
  },

  // ---- 热搜 ----
  hotSearches(limit = 10): string[] {
    return (
      getDb()
        .prepare('SELECT keyword FROM hot_searches ORDER BY sort ASC LIMIT ?')
        .all(limit) as unknown as { keyword: string }[]
    ).map((r) => r.keyword);
  },

  insertHotSearches(keywords: string[]): void {
    const stmt = getDb().prepare(
      'INSERT OR IGNORE INTO hot_searches (keyword, sort) VALUES (?, ?)',
    );
    keywords.forEach((k, i) => stmt.run(k, i));
  },

  // ---- UP 主 ----
  ownerByMid(mid: number): Owner | undefined {
    return getDb().prepare('SELECT * FROM owners WHERE mid = ?').get(mid) as Owner | undefined;
  },

  ownerByName(name: string, limit = 5): Owner[] {
    return getDb()
      .prepare('SELECT * FROM owners WHERE name LIKE ? ORDER BY videos DESC LIMIT ?')
      .all(`%${name}%`, limit) as unknown as Owner[];
  },

  insertOwners(rows: Owner[]): void {
    const stmt = getDb().prepare(
      'INSERT OR REPLACE INTO owners (mid, name, avatar, sign, fans, videos) VALUES (?,?,?,?,?,?)',
    );
    for (const o of rows) {
      stmt.run(...([o.mid, o.name, o.avatar, o.sign, o.fans, o.videos].map(bindable) as never[]));
    }
  },

  updateOwnerStats(mid: number, fans: number, videos: number): void {
    getDb().prepare('UPDATE owners SET fans = ?, videos = ? WHERE mid = ?').run(fans, videos, mid);
  },
};
