import { getDb } from '../db/sqlite.js';
/** 仓储层：评论与弹幕（source 区分 seed 演示内容与用户真实内容） */
export const commentRepository = {
    listByBvid(bvid, limit = 20, offset = 0) {
        return getDb()
            .prepare(`SELECT * FROM comments WHERE bvid = ?
         ORDER BY like_count DESC, created_at DESC LIMIT ? OFFSET ?`)
            .all(bvid, limit, offset);
    },
    countByBvid(bvid) {
        return getDb().prepare('SELECT COUNT(*) AS c FROM comments WHERE bvid = ?').get(bvid).c;
    },
    insert(row) {
        const db = getDb();
        const info = db
            .prepare(`INSERT INTO comments (bvid, author, avatar, content, like_count, source, created_at)
         VALUES (?,?,?,?,?,?,?)`)
            .run(row.bvid, row.author, row.avatar, row.content, row.like_count, row.source ?? 'user', row.created_at);
        return { id: Number(info.lastInsertRowid), ...row };
    },
    insertMany(rows) {
        const stmt = getDb().prepare(`INSERT INTO comments (bvid, author, avatar, content, like_count, source, created_at)
       VALUES (?,?,?,?,?,?,?)`);
        for (const r of rows) {
            stmt.run(r.bvid, r.author, r.avatar, r.content, r.like_count, r.source ?? 'seed', r.created_at);
        }
    },
    like(id) {
        getDb().prepare('UPDATE comments SET like_count = like_count + 1 WHERE id = ?').run(id);
    },
};
/** 仓储层：弹幕 */
export const danmakuRepository = {
    listByBvid(bvid) {
        return getDb()
            .prepare('SELECT * FROM danmaku WHERE bvid = ? ORDER BY time_ms ASC')
            .all(bvid);
    },
    countByBvid(bvid) {
        return getDb().prepare('SELECT COUNT(*) AS c FROM danmaku WHERE bvid = ?').get(bvid).c;
    },
    /** 找出超出演示片长的弹幕（数据体检用） */
    countBeyond(bvid, maxMs) {
        return getDb()
            .prepare('SELECT COUNT(*) AS c FROM danmaku WHERE bvid = ? AND time_ms > ?')
            .get(bvid, maxMs).c;
    },
    insertMany(rows) {
        const stmt = getDb().prepare('INSERT INTO danmaku (bvid, time_ms, text, color, mode, source) VALUES (?,?,?,?,?,?)');
        for (const r of rows) {
            stmt.run(r.bvid, r.time_ms, r.text, r.color, r.mode, r.source ?? 'seed');
        }
    },
};
//# sourceMappingURL=commentRepository.js.map