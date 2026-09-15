import { db } from '../db/index.js';
import type { Row } from './mappers.js';

export type UserAction = 'like' | 'coin' | 'favorite' | 'watchlater';

/** 单用户演示态：点赞 / 投币 / 收藏 / 稍后再看 / 观看历史 */
export const userRepo = {
  isActive(bvid: string, action: UserAction): boolean {
    const row = db
      .prepare('SELECT value FROM user_actions WHERE bvid = ? AND action = ?')
      .get(bvid, action) as Row | undefined;
    return Boolean(row && Number(row.value) > 0);
  },

  setActive(bvid: string, action: UserAction, active: boolean) {
    db.prepare(
      `INSERT INTO user_actions (bvid, action, value, ctime) VALUES (?, ?, ?, ?)
       ON CONFLICT(bvid, action) DO UPDATE SET value = excluded.value, ctime = excluded.ctime`,
    ).run(bvid, action, active ? 1 : 0, Math.floor(Date.now() / 1000));
  },

  actionsOf(bvid: string) {
    return {
      like: userRepo.isActive(bvid, 'like'),
      coin: userRepo.isActive(bvid, 'coin'),
      favorite: userRepo.isActive(bvid, 'favorite'),
    };
  },

  listActive(action: UserAction, limit: number): string[] {
    return (
      db
        .prepare(
          'SELECT bvid FROM user_actions WHERE action = ? AND value > 0 ORDER BY ctime DESC LIMIT ?',
        )
        .all(action, limit) as Row[]
    ).map((r) => String(r.bvid));
  },

  /** 进入播放页：播放次数 +1、刷新时间，保留上次的观看进度 */
  recordPlay(bvid: string) {
    db.prepare(
      `INSERT INTO watch_history (bvid, progress, play_count, vtime) VALUES (?, 0, 1, ?)
       ON CONFLICT(bvid) DO UPDATE SET play_count = play_count + 1, vtime = excluded.vtime`,
    ).run(bvid, Math.floor(Date.now() / 1000));
  },

  /** 离开播放页：只更新进度，不计播放 */
  saveProgress(bvid: string, progress: number) {
    db.prepare(
      `INSERT INTO watch_history (bvid, progress, play_count, vtime) VALUES (?, ?, 0, ?)
       ON CONFLICT(bvid) DO UPDATE SET progress = excluded.progress, vtime = excluded.vtime`,
    ).run(bvid, Math.max(0, progress), Math.floor(Date.now() / 1000));
  },

  history(limit: number): { bvid: string; progress: number; vtime: number }[] {
    return (
      db
        .prepare('SELECT bvid, progress, vtime FROM watch_history ORDER BY vtime DESC LIMIT ?')
        .all(limit) as Row[]
    ).map((r) => ({
      bvid: String(r.bvid),
      progress: Number(r.progress),
      vtime: Number(r.vtime),
    }));
  },
};
