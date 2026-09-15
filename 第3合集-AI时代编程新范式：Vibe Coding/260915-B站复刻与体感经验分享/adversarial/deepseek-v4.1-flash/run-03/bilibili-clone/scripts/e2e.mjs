/**
 * 浏览器端到端自检（真实 Chromium，通过 ego-browser 驱动）。
 *
 * 前置：后端 5112 与前端 3112 已经启动（npm run dev）。
 *   npm run e2e
 *
 * 覆盖：首页渲染 → hover → 菜单展开 → 顶栏面板 → 搜索建议 → 分类筛选 → 排序 →
 *       详情跳转 → 实际播放 → 评论框快捷键隔离(P2-1) → 弹幕携带进度(P2-2) →
 *       返回首页 → 分区页 URL/标题/列表一致(P2-4) → 历史页。
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB = process.env.E2E_WEB ?? 'http://localhost:3112';
const API = process.env.E2E_API ?? 'http://localhost:5112';

async function probe(url, name) {
  try {
    const res = await fetch(url);
    return { name, ok: res.ok, status: res.status };
  } catch (err) {
    return { name, ok: false, status: `unreachable: ${err.message}` };
  }
}

const [web, api] = await Promise.all([probe(`${WEB}/`, 'web'), probe(`${API}/api/health`, 'api')]);
if (!web.ok || !api.ok) {
  console.error('✖ 服务未就绪，请先执行 `npm run dev`');
  console.error(`  ${web.name}: ${web.status}\n  ${api.name}: ${api.status}`);
  process.exit(1);
}

const steps = fs.readFileSync(path.join(__dirname, 'e2e-browser.mjs'), 'utf8');
const preamble = `const WEB = ${JSON.stringify(WEB)};\nconst API = ${JSON.stringify(API)};\n`;
const script = preamble + steps;

console.log('▸ 启动真实浏览器执行 E2E...\n');
const run = spawnSync('ego-browser', ['nodejs'], {
  input: script,
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024,
});

const stdout = `${run.stdout ?? ''}`;
const stderr = `${run.stderr ?? ''}`;
// ego-browser 会把 cliLog 写到 stderr，所以两边都要找
const line = [...stdout.split('\n'), ...stderr.split('\n')].find((l) => l.includes('E2E_RESULT '));

if (!line) {
  console.error('✖ 未能拿到浏览器执行结果');
  console.error(stdout.slice(-3000));
  console.error(stderr.slice(-3000));
  process.exit(1);
}

const results = JSON.parse(line.slice(line.indexOf('E2E_RESULT ') + 'E2E_RESULT '.length));
let failed = 0;
for (const r of results) {
  if (r.ok) {
    console.log(`  ✔ ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
  } else {
    failed++;
    console.log(`  ✖ ${r.name}  (${r.detail})`);
  }
}

console.log(`\n${failed === 0 ? '✔' : '✖'} E2E 通过 ${results.length - failed}/${results.length}`);
const noise = stderr
  .split('\n')
  .filter((l) => !l.includes('E2E_RESULT ') && !l.includes('ego-browser:notice') && l.trim())
  .slice(-4);
if (noise.length) console.log(`\n[browser stderr]\n${noise.join('\n')}`);
process.exit(failed === 0 ? 0 : 1);
