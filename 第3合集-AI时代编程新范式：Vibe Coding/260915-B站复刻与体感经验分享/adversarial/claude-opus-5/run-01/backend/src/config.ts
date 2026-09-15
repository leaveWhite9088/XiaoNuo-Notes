import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

/** 后端固定端口，前端 3602 通过代理访问（README / vite.config.ts 与此保持一致） */
export const PORT = Number(process.env.PORT ?? 5602);
export const HOST = process.env.HOST ?? '127.0.0.1';

export const ROOT_DIR = path.resolve(here, '..');
export const DATA_DIR = path.join(ROOT_DIR, 'data');
export const MEDIA_DIR = path.join(ROOT_DIR, 'media');
export const SEED_FILE = path.join(DATA_DIR, 'seed.json');
export const DB_FILE = process.env.DB_FILE ?? path.join(DATA_DIR, 'bilibili.db');

/** 首页信息流每页条数（B 站首页一行 5 卡，两行一屏） */
export const FEED_PAGE_SIZE = 20;
export const SEARCH_PAGE_SIZE = 20;
