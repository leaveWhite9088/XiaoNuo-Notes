import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import config from '../config/index.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('db');

let db = null;

/**
 * 数据访问层入口：负责连接、建表、通用查询封装。
 * 上层（Repository）只通过这里拿到 db 与 helper，不重复处理文件系统。
 */
export function getDB() {
  if (db) return db;

  fs.mkdirSync(path.dirname(config.db.file), { recursive: true });
  db = new DatabaseSync(config.db.file);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  const schema = fs.readFileSync(config.db.schema, 'utf8');
  db.exec(schema);
  migrate(db);

  log.info(`SQLite 已连接 → ${path.relative(process.cwd(), config.db.file)}`);
  return db;
}

/**
 * 轻量迁移：schema.sql 使用 CREATE TABLE IF NOT EXISTS，
 * 已存在的库不会自动新增字段，这里按需 ALTER。
 */
function migrate(database) {
  const columns = new Set(
    database.prepare('PRAGMA table_info(videos)').all().map((row) => row.name),
  );
  const additions = [
    ['playable', 'ALTER TABLE videos ADD COLUMN playable INTEGER'],
  ];
  for (const [column, sql] of additions) {
    if (!columns.has(column)) {
      database.exec(sql);
      log.info(`迁移：videos 新增字段 ${column}`);
    }
  }
}

/* ------------------------- 通用查询封装 ------------------------- */

export function all(sql, params = []) {
  return getDB().prepare(sql).all(...params);
}

export function get(sql, params = []) {
  return getDB().prepare(sql).get(...params) ?? null;
}

export function run(sql, params = []) {
  return getDB().prepare(sql).run(...params);
}

/**
 * 事务包装：node:sqlite 无内置 transaction helper，手动 BEGIN/COMMIT。
 * 支持可重入：嵌套调用时复用最外层事务，避免 "cannot start a transaction
 * within a transaction"。仅最外层负责 COMMIT / ROLLBACK。
 */
let txDepth = 0;

export function transaction(fn) {
  const database = getDB();
  if (txDepth > 0) {
    txDepth += 1;
    try {
      return fn(database);
    } finally {
      txDepth -= 1;
    }
  }

  database.exec('BEGIN');
  txDepth = 1;
  try {
    const result = fn(database);
    database.exec('COMMIT');
    return result;
  } catch (err) {
    database.exec('ROLLBACK');
    throw err;
  } finally {
    txDepth = 0;
  }
}

/** 把查询结果里的 JSON 文本字段解析为对象 */
export function parseJSON(value, fallback) {
  if (value == null) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function closeDB() {
  if (db) {
    db.close();
    db = null;
  }
}

export default { getDB, all, get, run, transaction, parseJSON, closeDB };
