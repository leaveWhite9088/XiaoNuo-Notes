// 数据层（持久层）：加载 server/data 下的真实种子数据（由 scripts/build-seed.mjs 从 B 站公开接口抓取）
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
const load = (name) => JSON.parse(readFileSync(path.join(DATA_DIR, name), 'utf8'));

export const videos = load('videos.json');
export const categories = load('categories.json');
export const hotwords = load('hotwords.json');
export const meta = load('meta.json');

export const byId = new Map(videos.map((v) => [v.id, v]));
export const byBvid = new Map(videos.map((v) => [v.bvid, v]));
