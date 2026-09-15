import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { config } from '../config/index.js';
/**
 * 数据访问层基础设施：SQLite 连接（Node 内置 node:sqlite，零原生依赖）。
 */
let db = null;
export function getDb() {
    if (db)
        return db;
    fs.mkdirSync(path.dirname(config.dbFile), { recursive: true });
    db = new DatabaseSync(config.dbFile);
    return db;
}
/**
 * 定位 schema.sql：源码目录与 tsc 产物目录（dist/db）都要能找到，
 * 这样 `npm run build && npm start` 也能正常建表。
 */
function resolveSchemaPath() {
    const candidates = [
        path.join(import.meta.dirname, 'schema.sql'),
        path.join(import.meta.dirname, '..', '..', 'src', 'db', 'schema.sql'),
        path.join(process.cwd(), 'src', 'db', 'schema.sql'),
    ];
    for (const p of candidates) {
        if (fs.existsSync(p))
            return p;
    }
    throw new Error(`未找到 schema.sql，已尝试: ${candidates.join(', ')}`);
}
/** 轻量迁移：为历史数据库补齐后加的列（幂等） */
function ensureColumn(table, column, ddl) {
    const d = getDb();
    const cols = d.prepare(`PRAGMA table_info(${table})`).all();
    if (cols.length && !cols.some((c) => c.name === column)) {
        d.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
    }
}
export function migrate() {
    getDb().exec(fs.readFileSync(resolveSchemaPath(), 'utf8'));
    ensureColumn('comments', 'source', "source TEXT NOT NULL DEFAULT 'seed'");
    ensureColumn('danmaku', 'source', "source TEXT NOT NULL DEFAULT 'seed'");
    ensureColumn('videos', 'clip_duration', 'clip_duration REAL NOT NULL DEFAULT 0');
}
/**
 * 重建「基础内容」：只清理由 seed 生成的演示数据。
 * 用户产生的互动 / 历史 / 评论 / 弹幕（source='user'）会被保留。
 */
export function resetSeedContent() {
    const d = getDb();
    d.exec(`
    PRAGMA foreign_keys = OFF;
    DELETE FROM categories;
    DELETE FROM owners;
    DELETE FROM videos;
    DELETE FROM tags;
    DELETE FROM banners;
    DELETE FROM hot_searches;
    DELETE FROM comments WHERE source = 'seed';
    DELETE FROM danmaku  WHERE source = 'seed';
    PRAGMA foreign_keys = ON;
  `);
}
/** 清空全部数据（含用户数据），仅供显式 `seed --reset-user` 使用 */
export function resetAllTables() {
    getDb().exec(`
    PRAGMA foreign_keys = OFF;
    DELETE FROM categories; DELETE FROM owners; DELETE FROM videos; DELETE FROM tags;
    DELETE FROM banners; DELETE FROM hot_searches; DELETE FROM comments; DELETE FROM danmaku;
    DELETE FROM interactions; DELETE FROM watch_history;
    PRAGMA foreign_keys = ON;
  `);
}
/** 把 JS 值安全转换为 node:sqlite 支持的类型（boolean -> 0/1, undefined -> null） */
export function bindable(value) {
    if (value === undefined || value === null)
        return null;
    if (typeof value === 'boolean')
        return value ? 1 : 0;
    if (typeof value === 'number' || typeof value === 'string')
        return value;
    if (value instanceof Uint8Array)
        return value;
    return String(value);
}
export function closeDb() {
    db?.close();
    db = null;
}
//# sourceMappingURL=sqlite.js.map