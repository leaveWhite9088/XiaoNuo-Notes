import { getDb } from '../db/sqlite.js';
import type { CommentRow, DanmakuRow } from '../types.js';

/** 仓储层：评论与弹幕（source 区分 seed 演示内容与用户真实内容） */
export const commentRepository = {
  listByBvid(bvid: string, limit = 20, offset = 0): CommentRow[] {
    return getDb()
      .prepare(
        `SELECT * FROM comments WHERE bvid = ?
         ORDER BY like_count DESC, created_at DESC LIMIT ? OFFSET ?`,
      )
      .all(bvid, limit, offset) as unknown as CommentRow[];
  },

  countByBvid(bvid: string): number {
    return (
      getDb().prepare('SELECT COUNT(*) AS c FROM comments WHERE bvid = ?').get(bvid) as {
        c: number;
      }
    ).c;
  },

  insert(row: Omit<CommentRow, 'id'>): CommentRow {
    const db = getDb();
    const info = db
      .prepare(
        `INSERT INTO comments (bvid, author, avatar, content, like_count, source, created_at)
         VALUES (?,?,?,?,?,?,?)`,
      )
      .run(
        row.bvid,
        row.author,
        row.avatar,
        row.content,
        row.like_count,
        row.source ?? 'user',
        row.created_at,
      );
    return { id: Number(info.lastInsertRowid), ...row };
  },

  insertMany(rows: Omit<CommentRow, 'id'>[]): void {
    const stmt = getDb().prepare(
      `INSERT INTO comments (bvid, author, avatar, content, like_count, source, created_at)
       VALUES (?,?,?,?,?,?,?)`,
    );
    for (const r of rows) {
      stmt.run(
        r.bvid,
        r.author,
        r.avatar,
        r.content,
        r.like_count,
        r.source ?? 'seed',
        r.created_at,
      );
    }
  },

  like(id: number): void {
    getDb().prepare('UPDATE comments SET like_count = like_count + 1 WHERE id = ?').run(id);
  },
};

/** 仓储层：弹幕 */
export const danmakuRepository = {
  listByBvid(bvid: string): DanmakuRow[] {
    return getDb()
      .prepare('SELECT * FROM danmaku WHERE bvid = ? ORDER BY time_ms ASC')
      .all(bvid) as unknown as DanmakuRow[];
  },

  countByBvid(bvid: string): number {
    return (
      getDb().prepare('SELECT COUNT(*) AS c FROM danmaku WHERE bvid = ?').get(bvid) as {
        c: number;
      }
    ).c;
  },

  /** 找出超出演示片长的弹幕（数据体检用） */
  countBeyond(bvid: string, maxMs: number): number {
    return (
      getDb()
        .prepare('SELECT COUNT(*) AS c FROM danmaku WHERE bvid = ? AND time_ms > ?')
        .get(bvid, maxMs) as { c: number }
    ).c;
  },

  insertMany(rows: Omit<DanmakuRow, 'id'>[]): void {
    const stmt = getDb().prepare(
      'INSERT INTO danmaku (bvid, time_ms, text, color, mode, source) VALUES (?,?,?,?,?,?)',
    );
    for (const r of rows) {
      stmt.run(r.bvid, r.time_ms, r.text, r.color, r.mode, r.source ?? 'seed');
    }
  },
};
