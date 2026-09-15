import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data');

function readJson(file, fallback) {
  const full = path.join(DATA_DIR, file);
  if (!fs.existsSync(full)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (err) {
    console.error(`[db] 解析 ${file} 失败:`, err.message);
    return fallback;
  }
}

// 数据仓库层：服务启动时一次性加载 JSON，评论的运行时写入会持久化回 data/comments.json
export const db = {
  videos: readJson('videos.json', []),
  categories: readJson('categories.json', []),
  comments: readJson('comments.json', {}),
  hotSearch: readJson('hot-search.json', []),
  banners: readJson('banners.json', []),
};

export function persistComments() {
  fs.writeFileSync(path.join(DATA_DIR, 'comments.json'), JSON.stringify(db.comments, null, 2));
}

export function findVideo(id) {
  return db.videos.find((v) => v.id === id) || null;
}
