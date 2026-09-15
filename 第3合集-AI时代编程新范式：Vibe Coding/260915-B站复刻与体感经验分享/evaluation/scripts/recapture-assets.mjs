// 重新采集榜单场景截图（Windows 兼容版）。
// 用法：node recapture-assets.mjs --project <项目根> [--only <sampleId>] [--cache <临时目录>]
// 依赖：环境变量 PLAYWRIGHT_MODULE 指向 playwright 的 index.mjs（或脚本附近可解析 playwright）。
// 行为：把样本复制到临时目录、安装依赖、按 live-manifest.json 启动、用 Chromium 采集 6 个场景
// 截图（JPEG q72）写入 evaluation/assets/<mode>/<model>/，最后停止样本并释放端口。
import fs from 'node:fs/promises';
import path from 'node:path';
import net from 'node:net';
import { spawn, execFile } from 'node:child_process';

const args = process.argv.slice(2);
function argValue(name, fallback = null) {
  const index = args.indexOf('--' + name);
  return index >= 0 ? args[index + 1] : fallback;
}
const PROJECT_ROOT = path.resolve(argValue('project', process.cwd()));
const CACHE_ROOT = path.resolve(argValue('cache', path.join(process.env.TEMP || '.', 'bili-recap-cache')));
const ONLY = argValue('only');
const REMAP = argValue('remap'); // 形如 5173:5373，把样本前端端口临时映射到空闲端口（规避被占用的端口）
const VIEWPORT = { width: 1440, height: 900 };

const pw = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const chromium = pw.chromium;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const excluded = (name) => ['node_modules', '.git', 'dist', '.DS_Store', '.npmrc', '.yarnrc', '.yarnrc.yml', '.claude', '.codex'].includes(name)
  || /^\.env(?:\.|$)/i.test(name) || /(?:^|[._-])(?:credentials?|secrets?|api[-_]?keys?|tokens?)(?:[._-]|$)/i.test(name)
  || /\.(?:pem|key|p12|pfx|keystore)$/i.test(name);

function cleanEnv() {
  const env = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (/(api[-_]?key|token|secret|password|authorization)/i.test(key)) continue;
    env[key] = value;
  }
  env.NO_COLOR = '1';
  env.NPM_CONFIG_AUDIT = 'false';
  env.NPM_CONFIG_FUND = 'false';
  // Windows 下部分样本的 npm script 使用 Unix 风格环境变量前缀（如 NODE_NO_WARNINGS=1），
  // 需要让 npm 用 bash 执行脚本。
  for (const bash of ['D:\\Application\\Git\\Git\\bin\\bash.exe', 'C:\\Program Files\\Git\\bin\\bash.exe']) {
    if (awaitableExists(bash)) { env.npm_config_script_shell = bash; break; }
  }
  return env;
}

import { existsSync } from 'node:fs';
function awaitableExists(p) { return existsSync(p); }

function run(command, commandArgs, cwd, timeoutMs = 10 * 60_000) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { cwd, env: cleanEnv(), shell: true });
    let output = '';
    child.stdout.on('data', (chunk) => { output += chunk; if (output.length > 4000) output = output.slice(-4000); });
    child.stderr.on('data', (chunk) => { output += chunk; if (output.length > 4000) output = output.slice(-4000); });
    const timer = setTimeout(() => { killTree(child.pid); reject(new Error('命令超时: ' + command + ' ' + commandArgs.join(' '))); }, timeoutMs);
    child.once('error', (error) => { clearTimeout(timer); reject(error); });
    child.once('exit', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(); else reject(new Error(`命令退出码 ${code}: ${command} ${commandArgs.join(' ')} @ ${cwd}\n${output.slice(-800)}`));
    });
  });
}

function killTree(pid) {
  return new Promise((resolve) => {
    if (!pid) return resolve();
    execFile('taskkill', ['/PID', String(pid), '/T', '/F'], () => resolve());
  });
}

async function portFree(port) {
  try {
    await new Promise((resolve, reject) => {
      const socket = net.createServer();
      socket.once('error', reject);
      socket.listen({ port, host: '127.0.0.1' }, () => socket.close(resolve));
    });
    return true;
  } catch { return false; }
}

function portListening(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port });
    const done = (value) => { socket.destroy(); resolve(value); };
    socket.setTimeout(700, () => done(false));
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
  });
}

async function waitPortFree(port, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!(await portListening(port))) return true;
    await delay(300);
  }
  return false;
}

async function prepare(sample) {
  const directory = path.join(CACHE_ROOT, sample.sampleId);
  const marker = path.join(directory, '.recap-ready.json');
  const sourceRoot = path.resolve(PROJECT_ROOT, sample.sourcePath);
  const ready = await fs.readFile(marker, 'utf8').then(() => true).catch(() => false);
  if (!ready) {
    await fs.rm(directory, { recursive: true, force: true });
    await fs.mkdir(directory, { recursive: true });
    await fs.cp(sourceRoot, directory, {
      recursive: true,
      filter: (source) => !excluded(path.basename(source)),
    });
    for (const relativeCwd of sample.installDirs) {
      const cwd = path.resolve(directory, relativeCwd);
      const hasPackage = await fs.stat(path.join(cwd, 'package.json')).then(() => true).catch(() => false);
      if (hasPackage) await run('npm', ['install', '--no-audit', '--no-fund'], cwd);
    }
    await fs.writeFile(marker, JSON.stringify({ at: new Date().toISOString() }));
  }
  return directory;
}

async function startSample(sample, directory, children) {
  for (const step of sample.beforeStart || []) {
    await run(step.executable, step.args, path.resolve(directory, step.relativeCwd), 3 * 60_000);
  }
  for (const step of sample.commands) {
    const child = spawn(step.executable, step.args, { cwd: path.resolve(directory, step.relativeCwd), env: cleanEnv(), shell: true });
    children.push(child);
    child.stdout.on('data', () => {});
    child.stderr.on('data', () => {});
  }
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (children.some((child) => child.exitCode !== null)) throw new Error('作品进程提前退出');
    let front = false;
    try {
      const response = await fetch(sample.frontUrl, { signal: AbortSignal.timeout(2000), redirect: 'manual' });
      front = response.status === 200;
    } catch {}
    if (front && (await portListening(sample.backPort))) return;
    await delay(500);
  }
  throw new Error('作品启动超时');
}

// ---------- 场景采集 ----------

async function shot(page, file) {
  await page.screenshot({ path: file, type: 'jpeg', quality: 72 });
}

async function findVideoTarget(page) {
  return page.evaluate(() => {
    const visible = (el) => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0 && rect.width > 0 && rect.height > 0;
    };
    document.querySelectorAll('[data-recap-target]').forEach((el) => el.removeAttribute('data-recap-target'));
    let target = [...document.querySelectorAll('a[href*="/video/"]')].find(visible);
    if (!target) {
      target = [...document.querySelectorAll('[class*="video-card"], [class*="videoCard"], [class*="VideoCard"], article, [class*="card"]')]
        .find((el) => visible(el) && (el.querySelector('img, video') || (el.textContent || '').trim().length >= 3));
    }
    if (!target) return false;
    target.setAttribute('data-recap-target', 'true');
    return true;
  });
}

async function findSearchInput(page) {
  return page.evaluate(() => {
    const visible = (el) => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const type = (el.getAttribute('type') || 'text').toLowerCase();
      return ['text', 'search'].includes(type) && !el.disabled && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0 && rect.width > 0 && rect.height > 0;
    };
    for (const selector of ['input[type="search"]', 'input[placeholder*="搜索"]', 'header form input', 'form input', 'input']) {
      const list = [...document.querySelectorAll(selector)];
      const index = list.findIndex(visible);
      if (index >= 0) {
        list[index].setAttribute('data-recap-search', 'true');
        return true;
      }
    }
    return false;
  });
}

async function gotoHome(page, url) {
  await page.goto(url, { waitUntil: 'load', timeout: 30_000 });
  await page.waitForTimeout(1500);
}

async function captureScenes(page, sample, outDir) {
  const scenes = {};
  const steps = {
    'home': async () => { await gotoHome(page, sample.frontUrl); await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(400); },
    'feed': async () => { await page.evaluate(() => window.scrollTo({ top: Math.round(window.innerHeight * 0.78), behavior: 'instant' })); await page.waitForTimeout(800); },
    'hover': async () => {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(400);
      if (await findVideoTarget(page)) { await page.hover('[data-recap-target]').catch(() => {}); await page.waitForTimeout(700); }
    },
    'search-results': async () => {
      if (await findSearchInput(page)) {
        await page.fill('[data-recap-search]', '科技').catch(() => {});
        await page.press('[data-recap-search]', 'Enter').catch(() => {});
        await page.waitForTimeout(1800);
      }
    },
    'category': async () => {
      await gotoHome(page, sample.frontUrl);
      await page.evaluate(() => {
        const el = [...document.querySelectorAll('button, a')].find((candidate) => {
          const text = (candidate.textContent || '').replace(/\s+/g, '').trim();
          const rect = candidate.getBoundingClientRect();
          return text === '游戏' && rect.width > 0 && rect.height > 0;
        });
        if (el) el.click();
      });
      await page.waitForTimeout(1000);
    },
    'video': async () => {
      await gotoHome(page, sample.frontUrl);
      if (await findVideoTarget(page)) { await page.click('[data-recap-target]').catch(() => {}); await page.waitForTimeout(2000); }
    },
  };
  for (const [name, action] of Object.entries(steps)) {
    const file = path.join(outDir, name + '.jpg');
    try {
      await action();
      await shot(page, file);
      scenes[name] = 'ok';
    } catch (error) {
      try { await shot(page, file); scenes[name] = 'partial: ' + String(error).slice(0, 120); }
      catch (e2) { scenes[name] = 'failed: ' + String(e2).slice(0, 120); }
    }
  }
  return scenes;
}

// ---------- 主流程 ----------

const manifest = JSON.parse(await fs.readFile(path.join(PROJECT_ROOT, 'evaluation', 'data', 'live-manifest.json'), 'utf8'));
const summary = {};
const browser = await chromium.launch();

for (const original of manifest.samples) {
  if (ONLY && original.sampleId !== ONLY) continue;
  let sample = original;
  if (REMAP) {
    const [from, to] = REMAP.split(':');
    sample = {
      ...original,
      frontPort: Number(to),
      frontUrl: original.frontUrl.replace(':' + from, ':' + to),
      commands: original.commands.map((step) => ({ ...step, args: step.args.map((a) => (a === from ? to : a)) })),
    };
  }
  const record = { status: 'pending' };
  summary[original.sampleId] = record;
  const children = [];
  console.log('=== ' + sample.sampleId + ' ===');
  try {
    if (!(await portFree(sample.frontPort)) || !(await portFree(sample.backPort))) throw new Error('端口被占用，跳过（不杀陌生进程）');
    const directory = await prepare(sample);
    await startSample(sample, directory, children);
    const outDir = path.join(PROJECT_ROOT, 'evaluation', 'assets', sample.mode, sample.modelId);
    await fs.mkdir(outDir, { recursive: true });
    const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
    const page = await context.newPage();
    try {
      record.scenes = await captureScenes(page, sample, outDir);
    } finally {
      await context.close().catch(() => {});
    }
    record.status = 'captured';
  } catch (error) {
    record.status = 'error';
    record.error = String(error && error.message || error).slice(0, 500);
  }
  for (const child of children) await killTree(child.pid);
  await waitPortFree(sample.frontPort).catch(() => {});
  await waitPortFree(sample.backPort).catch(() => {});
  record.portsFreed = (await portFree(sample.frontPort)) && (await portFree(sample.backPort));
  console.log(sample.sampleId + ' -> ' + record.status + (record.error ? ' | ' + record.error : ''));
}

await browser.close();
await fs.writeFile(path.join(CACHE_ROOT, 'recap-summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
