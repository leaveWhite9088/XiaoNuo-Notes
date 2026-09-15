import { getDb } from '../db/sqlite.js';

export interface Interaction {
  bvid: string;
  liked: number;
  coined: number;
  faved: number;
  followed: number;
  updated_at: number;
}

export interface HistoryEntry {
  id: number;
  bvid: string;
  progress: number;
  watched_at: number;
}

/** 仓储层：当前用户互动状态 */
export const interactionRepository = {
  get(bvid: string): Interaction {
    const row = getDb().prepare('SELECT * FROM interactions WHERE bvid = ?').get(bvid) as
      | Interaction
      | undefined;
    return row ?? { bvid, liked: 0, coined: 0, faved: 0, followed: 0, updated_at: 0 };
  },

  ensure(bvid: string): void {
    getDb()
      .prepare('INSERT OR IGNORE INTO interactions (bvid, liked, coined, faved, followed) VALUES (?,0,0,0,0)')
      .run(bvid);
  },

  toggle(bvid: string, field: 'liked' | 'coined' | 'faved' | 'followed'): Interaction {
    this.ensure(bvid);
    const db = getDb();
    db.prepare(
      `UPDATE interactions SET ${field} = CASE ${field} WHEN 1 THEN 0 ELSE 1 END,
        updated_at = strftime('%s','now') WHERE bvid = ?`,
    ).run(bvid);
    return this.get(bvid);
  },

  /** 互动统计（收藏 / 点赞 / 投币 / 关注 / 观看数） */
  summary(): InteractionSummary {
    return getDb()
      .prepare(
        `SELECT
           (SELECT COUNT(*) FROM interactions WHERE faved = 1)    AS faved,
           (SELECT COUNT(*) FROM interactions WHERE liked = 1)    AS liked,
           (SELECT COUNT(*) FROM interactions WHERE coined = 1)   AS coined,
           (SELECT COUNT(*) FROM interactions WHERE followed = 1) AS followed,
           (SELECT COUNT(*) FROM watch_history)                   AS watched`,
      )
      .get() as unknown as InteractionSummary;
  },
};

export interface InteractionSummary {
  faved: number;
  liked: number;
  coined: number;
  followed: number;
  watched: number;
}

/** 仓储层：观看历史 */
export const historyRepository = {
  list(limit = 60): HistoryEntry[] {
    return getDb()
      .prepare('SELECT * FROM watch_history ORDER BY watched_at DESC LIMIT ?')
      .all(limit) as unknown as HistoryEntry[];
  },

  record(bvid: string, progress = 0): void {
    const db = getDb();
    db.prepare('DELETE FROM watch_history WHERE bvid = ?').run(bvid);
    db.prepare('INSERT INTO watch_history (bvid, progress, watched_at) VALUES (?,?,strftime(\'%s\',\'now\'))').run(
      bvid,
      progress,
    );
  },

  clear(): void {
    getDb().exec('DELETE FROM watch_history');
  },
};
