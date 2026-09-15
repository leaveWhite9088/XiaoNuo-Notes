import { bindable, getDb } from '../db/sqlite.js';
/**
 * 仓储层：只负责 SQL 与行数据，不含业务规则。
 */
const CARD_SELECT = `
  SELECT v.*, o.name AS owner_name, o.avatar AS owner_avatar
  FROM videos v
  LEFT JOIN owners o ON o.mid = v.owner_mid
`;
const ORDER_BY = {
    default: 'v.hot_score DESC, v.play DESC',
    play: 'v.play DESC',
    newest: 'v.pubdate DESC',
    danmaku: 'v.danmaku DESC',
};
export const videoRepository = {
    findFeed(query) {
        const page = Math.max(1, query.page ?? 1);
        const pageSize = Math.max(1, query.pageSize ?? 24);
        const where = [];
        const params = [];
        if (query.category && query.category !== 'all') {
            where.push('v.category_slug = ?');
            params.push(query.category);
        }
        if (query.keyword) {
            where.push('(v.title LIKE ? OR v.description LIKE ? OR o.name LIKE ? OR v.tname LIKE ?)');
            const like = `%${query.keyword}%`;
            params.push(like, like, like, like);
        }
        if (query.ownerMid) {
            where.push('v.owner_mid = ?');
            params.push(query.ownerMid);
        }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
        const orderBy = ORDER_BY[query.sort ?? 'default'] ?? ORDER_BY.default;
        const db = getDb();
        const total = db
            .prepare(`SELECT COUNT(*) AS c FROM videos v LEFT JOIN owners o ON o.mid = v.owner_mid ${whereSql}`)
            .get(...params).c;
        const list = db
            .prepare(`${CARD_SELECT} ${whereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
            .all(...params, pageSize, (page - 1) * pageSize);
        return { list, total, page, pageSize, hasMore: page * pageSize < total };
    },
    findByBvid(bvid) {
        return getDb().prepare(`${CARD_SELECT} WHERE v.bvid = ?`).get(bvid);
    },
    findManyByBvids(bvids) {
        if (!bvids.length)
            return [];
        const marks = bvids.map(() => '?').join(',');
        return getDb()
            .prepare(`${CARD_SELECT} WHERE v.bvid IN (${marks})`)
            .all(...bvids);
    },
    findRelated(bvid, categorySlug, limit = 12) {
        return getDb()
            .prepare(`${CARD_SELECT} WHERE v.bvid != ? AND (v.category_slug = ? OR v.owner_mid = (SELECT owner_mid FROM videos WHERE bvid = ?))
         ORDER BY v.hot_score DESC LIMIT ?`)
            .all(bvid, categorySlug, bvid, limit);
    },
    ranking(limit = 10, category = 'all') {
        const where = category === 'all' ? '' : 'WHERE v.category_slug = ?';
        const params = category === 'all' ? [] : [category];
        return getDb()
            .prepare(`${CARD_SELECT} ${where} ORDER BY v.play DESC LIMIT ?`)
            .all(...params, limit);
    },
    tags(bvid) {
        const rows = getDb()
            .prepare('SELECT name FROM tags WHERE bvid = ?')
            .all(bvid);
        return rows.map((r) => r.name);
    },
    totalCount() {
        return getDb().prepare('SELECT COUNT(*) AS c FROM videos').get().c;
    },
    countByCategory(slug) {
        if (slug === 'all')
            return this.totalCount();
        return getDb().prepare('SELECT COUNT(*) AS c FROM videos WHERE category_slug = ?').get(slug).c;
    },
    /** 搜索建议用的标题匹配（SQL 只在仓储层出现） */
    suggestByTitle(keyword, limit = 10) {
        if (!keyword)
            return [];
        return getDb()
            .prepare(`SELECT v.bvid, v.title, v.cover, v.play, o.name AS ownerName
         FROM videos v LEFT JOIN owners o ON o.mid = v.owner_mid
         WHERE v.title LIKE ? ORDER BY v.hot_score DESC LIMIT ?`)
            .all(`%${keyword}%`, limit);
    },
    /** 当前用户收藏的视频（收藏面板） */
    findFavorites(limit = 12) {
        return getDb()
            .prepare(`${CARD_SELECT} INNER JOIN interactions i ON i.bvid = v.bvid AND i.faved = 1
         ORDER BY i.updated_at DESC LIMIT ?`)
            .all(limit);
    },
    /** 当前用户关注过的 UP 主的最新投稿（动态面板） */
    findFollowingLatest(limit = 12) {
        return getDb()
            .prepare(`${CARD_SELECT} WHERE v.owner_mid IN (
           SELECT v2.owner_mid FROM interactions i JOIN videos v2 ON v2.bvid = i.bvid WHERE i.followed = 1
         ) ORDER BY v.pubdate DESC LIMIT ?`)
            .all(limit);
    },
    insertMany(rows) {
        const db = getDb();
        const stmt = db.prepare(`
      INSERT INTO videos (bvid, aid, cid, title, description, cover, video_url, duration, pubdate,
        tname, category_slug, play, danmaku, like_count, coin, favorite, reply, share, owner_mid, hot_score)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(bvid) DO UPDATE SET hot_score = excluded.hot_score, cover = excluded.cover
    `);
        for (const r of rows) {
            stmt.run(...[
                r.bvid,
                r.aid,
                r.cid,
                r.title,
                r.description,
                r.cover,
                r.video_url,
                r.duration,
                r.pubdate,
                r.tname,
                r.category_slug,
                r.play,
                r.danmaku,
                r.like_count,
                r.coin,
                r.favorite,
                r.reply,
                r.share,
                r.owner_mid,
                r.hot_score,
            ].map(bindable));
        }
    },
    insertTags(bvid, tags) {
        const stmt = getDb().prepare('INSERT INTO tags (bvid, name) VALUES (?, ?)');
        for (const t of tags)
            stmt.run(bvid, t);
    },
    addPlayCount(bvid, delta = 1) {
        getDb().prepare('UPDATE videos SET play = play + ? WHERE bvid = ?').run(delta, bvid);
    },
};
//# sourceMappingURL=videoRepository.js.map