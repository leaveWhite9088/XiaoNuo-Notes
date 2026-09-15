import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR, DB_FILE } from '../config.js';
import { CONTENT_SCHEMA, USER_SCHEMA } from './schema.js';
import { loadSeed } from './seedLoader.js';

fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new DatabaseSync(DB_FILE);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

/** 启动时：重建内容表并导入 seed.json，用户行为表沿用已有数据。 */
export function initDatabase(): { videos: number; owners: number } {
  db.exec(CONTENT_SCHEMA);
  db.exec(USER_SCHEMA);
  migrateUserTables();
  const stats = loadSeed(db);
  reapplyUserState();
  console.log(
    `[db] ${path.basename(DB_FILE)} 就绪: ${stats.videos} 视频 / ${stats.owners} UP 主 / ${stats.comments} 评论 / ${stats.danmaku} 弹幕`,
  );
  return stats;
}

/** 旧库补列（watch_history.play_count） */
function migrateUserTables() {
  const cols = (db.prepare('PRAGMA table_info(watch_history)').all() as { name: string }[]).map((c) => c.name);
  if (!cols.includes('play_count')) {
    db.exec('ALTER TABLE watch_history ADD COLUMN play_count INTEGER NOT NULL DEFAULT 0');
  }
}

/**
 * 内容表每次启动按种子重建，而用户行为表是持久的：
 * 把已点亮的赞/币/藏和历史播放次数重新叠加到统计列，避免重启后"取消点赞"把计数减到种子值以下。
 */
function reapplyUserState() {
  const bump = (column: string, action: string) =>
    db.exec(`UPDATE videos SET ${column} = ${column} + (
      SELECT COUNT(*) FROM user_actions ua WHERE ua.bvid = videos.bvid AND ua.action = '${action}' AND ua.value > 0
    )`);
  bump('like_count', 'like');
  bump('coin_count', 'coin');
  bump('favorite_count', 'favorite');
  db.exec(`UPDATE videos SET view_count = view_count + COALESCE(
    (SELECT play_count FROM watch_history wh WHERE wh.bvid = videos.bvid), 0)`);
}

export type Db = typeof db;
