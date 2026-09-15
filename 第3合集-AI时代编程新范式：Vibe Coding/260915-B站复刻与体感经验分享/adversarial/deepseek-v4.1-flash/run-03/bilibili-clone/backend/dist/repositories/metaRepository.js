import { bindable, getDb } from '../db/sqlite.js';
/** 仓储层：分区 / 轮播 / 热搜 / UP主 等基础元数据 */
export const metaRepository = {
    // ---- 分区 ----
    allCategories() {
        return getDb()
            .prepare('SELECT * FROM categories ORDER BY sort ASC')
            .all();
    },
    categoryBySlug(slug) {
        return getDb().prepare('SELECT * FROM categories WHERE slug = ?').get(slug);
    },
    insertCategories(rows) {
        const stmt = getDb().prepare('INSERT OR REPLACE INTO categories (slug, name, rid, icon, sort) VALUES (?,?,?,?,?)');
        for (const c of rows)
            stmt.run(c.slug, c.name, c.rid, c.icon, c.sort);
    },
    // ---- 轮播 ----
    banners() {
        return getDb()
            .prepare('SELECT * FROM banners ORDER BY sort ASC')
            .all();
    },
    insertBanners(rows) {
        const stmt = getDb().prepare('INSERT INTO banners (title, subtitle, image, link, sort) VALUES (?,?,?,?,?)');
        for (const b of rows)
            stmt.run(b.title, b.subtitle, b.image, b.link, b.sort);
    },
    // ---- 热搜 ----
    hotSearches(limit = 10) {
        return getDb()
            .prepare('SELECT keyword FROM hot_searches ORDER BY sort ASC LIMIT ?')
            .all(limit).map((r) => r.keyword);
    },
    insertHotSearches(keywords) {
        const stmt = getDb().prepare('INSERT OR IGNORE INTO hot_searches (keyword, sort) VALUES (?, ?)');
        keywords.forEach((k, i) => stmt.run(k, i));
    },
    // ---- UP 主 ----
    ownerByMid(mid) {
        return getDb().prepare('SELECT * FROM owners WHERE mid = ?').get(mid);
    },
    ownerByName(name, limit = 5) {
        return getDb()
            .prepare('SELECT * FROM owners WHERE name LIKE ? ORDER BY videos DESC LIMIT ?')
            .all(`%${name}%`, limit);
    },
    insertOwners(rows) {
        const stmt = getDb().prepare('INSERT OR REPLACE INTO owners (mid, name, avatar, sign, fans, videos) VALUES (?,?,?,?,?,?)');
        for (const o of rows) {
            stmt.run(...[o.mid, o.name, o.avatar, o.sign, o.fans, o.videos].map(bindable));
        }
    },
    updateOwnerStats(mid, fans, videos) {
        getDb().prepare('UPDATE owners SET fans = ?, videos = ? WHERE mid = ?').run(fans, videos, mid);
    },
};
//# sourceMappingURL=metaRepository.js.map