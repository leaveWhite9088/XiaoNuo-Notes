/**
 * tsc 只编译 .ts，不会把 schema.sql 复制到 dist。
 * 这个脚本保证 `npm run build` 产物（dist/）自带 schema.sql，
 * 这样 `node dist/index.js` 也能正常建表。
 *
 *   node scripts/copy-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const assets = [['src/db/schema.sql', 'db/schema.sql']];

if (!fs.existsSync(DIST)) {
  console.log('ℹ dist 不存在，跳过（先执行 tsc）');
  process.exit(0);
}

for (const [from, to] of assets) {
  const src = path.join(ROOT, from);
  const dest = path.join(DIST, to);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`✔ 复制 ${from} -> dist/${to}`);
}
