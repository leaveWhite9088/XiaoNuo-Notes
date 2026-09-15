import fs from 'node:fs/promises';
import path from 'node:path';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';

const CACHE_ROOT = '/tmp/bili-live-showcase-cache';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const contained = (root, target) => target === root || target.startsWith(root + path.sep);
const excluded = name => ['node_modules', '.git', 'dist', '.DS_Store', '.npmrc', '.yarnrc', '.yarnrc.yml', '.claude', '.codex'].includes(name)
  || /^\.env(?:\.|$)/i.test(name) || /(?:^|[._-])(?:credentials?|secrets?|api[-_]?keys?|tokens?)(?:[._-]|$)/i.test(name)
  || /\.(?:pem|key|p12|pfx|keystore)$/i.test(name);

function cleanEnvironment() {
  const env = {};
  for (const name of ['PATH', 'HOME', 'USER', 'LOGNAME', 'SHELL', 'LANG', 'LC_ALL', 'TMPDIR', 'TZ']) {
    if (process.env[name]) env[name] = process.env[name];
  }
  env.PATH = path.dirname(process.execPath) + path.delimiter + (env.PATH || '/usr/bin:/bin');
  env.NPM_CONFIG_USERCONFIG = '/dev/null';
  env.NPM_CONFIG_AUDIT = 'false';
  env.NPM_CONFIG_FUND = 'false';
  env.NO_COLOR = '1';
  return env;
}

function redact(text) {
  return String(text).replace(/\x1b\[[0-9;]*m/g, '')
    .replace(/\b(?:sk-[\w.\-]{8,}|Bearer\s+[^\s"']+)/gi, '[已隐藏]')
    .replace(/((?:api[_-]?key|token|secret|password|authorization)\s*[=:]\s*)[^\s,;]+/gi, '$1[已隐藏]')
    .replace(/https?:\/\/[^\s/@]+:[^\s/@]+@/gi, 'https://[已隐藏]@');
}

async function portFree(port) {
  for (const host of ['127.0.0.1', '::1']) await new Promise((resolve, reject) => {
    const socket = net.createServer();
    socket.once('error', error => {
      if (host === '::1' && ['EAFNOSUPPORT', 'EADDRNOTAVAIL'].includes(error.code)) resolve();
      else reject(new Error(`端口 ${port} 正被其他程序使用，请先关闭对应页面服务。`));
    });
    socket.listen({ port, host, ipv6Only: host === '::1' }, () => socket.close(resolve));
  });
}

function groupAlive(pid) {
  try { process.kill(-pid, 0); return true; } catch { return false; }
}

export class ShowcaseRunner {
  constructor(projectRoot, manifest) {
    this.projectRoot = projectRoot;
    this.samples = new Map(manifest.samples.map(sample => [sample.sampleId, sample]));
    this.generation = 0;
    this.groups = new Map();
    this.job = null;
    this.stopPromise = null;
    this.lastHeartbeat = Date.now();
    this.status = { state: 'idle', activeSampleId: null, frontUrl: null, message: '请选择要体验的作品。', error: null, startedAt: null };
  }

  catalog() {
    return [...this.samples.values()].map(({ sampleId, modelId, modelName, mode, modeLabel, frontUrl }) => ({ sampleId, modelId, modelName, mode, modeLabel, frontUrl }));
  }

  snapshot() { return { ...this.status }; }
  heartbeat() { this.lastHeartbeat = Date.now(); }
  current(generation) { if (generation !== this.generation) throw new Error('已取消本次启动。'); }
  update(generation, changes) { this.current(generation); Object.assign(this.status, changes); }

  async init() {
    await fs.mkdir(CACHE_ROOT, { recursive: true, mode: 0o700 });
    const cache = await fs.lstat(CACHE_ROOT);
    if (cache.isSymbolicLink() || !cache.isDirectory() || cache.uid !== process.getuid()) throw new Error('临时工作目录不可用。');
    this.cacheRoot = await fs.realpath(CACHE_ROOT);
    const ids = new Set();
    for (const sample of this.samples.values()) {
      if (!/^(one-shot|adversarial)--[a-z0-9.-]+$/.test(sample.sampleId) || ids.has(sample.sampleId)) throw new Error('作品清单有重复或无效项目。');
      ids.add(sample.sampleId);
      if (!['one-shot', 'adversarial'].includes(sample.mode) || !sample.sourcePath.startsWith(sample.mode + '/')) throw new Error('作品清单路径无效。');
      sample.sourceRoot = await fs.realpath(path.resolve(this.projectRoot, sample.sourcePath));
      if (!contained(path.join(this.projectRoot, sample.mode), sample.sourceRoot)) throw new Error('作品清单路径超出范围。');
      for (const port of [sample.frontPort, sample.backPort]) if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('作品端口无效。');
      if (sample.frontUrl !== `http://127.0.0.1:${sample.frontPort}`) throw new Error('作品地址无效。');
      for (const step of [...sample.commands, ...sample.beforeStart]) {
        if (!['node', 'npm'].includes(step.executable) || !Array.isArray(step.args) || !step.args.every(arg => typeof arg === 'string')
          || !contained(sample.sourceRoot, path.resolve(sample.sourceRoot, step.relativeCwd))) throw new Error('作品启动配置无效。');
      }
      for (const directory of sample.installDirs) if (!contained(sample.sourceRoot, path.resolve(sample.sourceRoot, directory))) throw new Error('依赖目录无效。');
    }
    if (this.samples.size !== 20) throw new Error('作品清单应包含 20 个样本。');
  }

  async log(sampleId, line) {
    const filename = path.join(this.cacheRoot, sampleId + '.log');
    // 日志只写临时目录，每次启动覆盖；限制单条输出以免页面错误刷爆磁盘。
    const info = await fs.stat(filename).catch(() => null);
    if (!info || info.size < 2_000_000) await fs.appendFile(filename, redact(line).slice(0, 16000), { mode: 0o600 });
  }

  async prepare(sample, generation) {
    const directory = path.join(this.cacheRoot, sample.sampleId);
    const info = await fs.lstat(directory).catch(() => null);
    if (info?.isSymbolicLink()) throw new Error('作品临时目录不可用。');
    await fs.mkdir(directory, { recursive: true, mode: 0o700 });
    const fingerprint = createHash('sha256').update(JSON.stringify({ preparationVersion: 2, source: sample.sourceRoot, commands: sample.commands, installDirs: sample.installDirs, node: process.version })).digest('hex');
    const marker = path.join(directory, '.showcase-ready.json');
    const cached = JSON.parse(await fs.readFile(marker, 'utf8').catch(() => '{}'));
    if (cached.fingerprint === fingerprint) return directory;
    const deadline = Date.now() + 10 * 60_000;
    await fs.cp(sample.sourceRoot, directory, {
      recursive: true, force: true, preserveTimestamps: true,
      filter: async source => {
        this.current(generation);
        if (Date.now() > deadline) throw new Error('准备作品用时过长，请重试。');
        if (excluded(path.basename(source))) return false;
        // 跳过符号链接，保证安装、数据写入都不会回到参赛源目录。
        return !(await fs.lstat(source)).isSymbolicLink();
      }
    });
    for (const relativeCwd of sample.installDirs) {
      this.current(generation);
      this.update(generation, { message: '首次打开正在准备依赖，请稍候。' });
      await this.runStep(sample, directory, { executable: 'npm', args: ['install', '--no-audit', '--no-fund'], relativeCwd }, generation, Math.max(1000, deadline - Date.now()));
    }
    this.current(generation);
    await fs.writeFile(marker, JSON.stringify({ fingerprint }), { mode: 0o600 });
    return directory;
  }

  spawnStep(sample, directory, step, generation, persistent) {
    this.current(generation);
    const cwd = path.resolve(directory, step.relativeCwd);
    if (!contained(directory, cwd)) throw new Error('作品启动目录无效。');
    const executable = step.executable === 'node' ? process.execPath : path.join(path.dirname(process.execPath), 'npm');
    const child = spawn(executable, step.args, { cwd, env: cleanEnvironment(), detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
    const record = { child, generation, persistent };
    if (child.pid) this.groups.set(child.pid, record);
    let settled = false;
    record.finished = new Promise((resolve, reject) => {
      child.once('error', error => { if (!settled) { settled = true; reject(error); } });
      child.once('exit', (code, signal) => {
        if (!settled) { settled = true; resolve({ code, signal }); }
        if (persistent && generation === this.generation && this.status.state === 'ready') {
          void this.fail(generation, sample, '作品运行已中断，请重新打开。');
        }
      });
    });
    // 持久进程的失败也必须有人接住，避免未处理拒绝导致运行器退出。
    record.finished.catch(() => {});
    for (const stream of [child.stdout, child.stderr]) {
      let pending = '';
      stream.on('data', chunk => {
        pending += chunk.toString();
        let end;
        while ((end = pending.indexOf('\n')) >= 0) {
          void this.log(sample.sampleId, pending.slice(0, end + 1)).catch(() => {});
          pending = pending.slice(end + 1);
        }
        if (pending.length > 32000) pending = '[过长输出已省略]\n';
      });
      stream.on('end', () => { if (pending) void this.log(sample.sampleId, pending).catch(() => {}); });
    }
    return record;
  }

  async runStep(sample, directory, step, generation, timeout = 60_000) {
    const record = this.spawnStep(sample, directory, step, generation, false);
    let timer;
    try {
      const result = await Promise.race([record.finished, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('准备作品用时过长，请重试。')), timeout); })]);
      this.current(generation);
      if (result.code !== 0) throw new Error('作品依赖或启动准备失败，请重试。');
    } finally {
      clearTimeout(timer);
      await this.killGroups(generation, record.child.pid ? [record.child.pid] : []);
    }
  }

  async killGroups(generation, onlyPids = null) {
    const entries = [...this.groups].filter(([pid, record]) => record.generation === generation && (!onlyPids || onlyPids.includes(pid)));
    for (const [pid] of entries) { try { process.kill(-pid, 'SIGTERM'); } catch {} }
    const deadline = Date.now() + 3500;
    while (Date.now() < deadline && entries.some(([pid]) => groupAlive(pid))) await delay(100);
    for (const [pid] of entries) {
      if (groupAlive(pid)) { try { process.kill(-pid, 'SIGKILL'); } catch {} }
    }
    const forceDeadline = Date.now() + 1500;
    while (Date.now() < forceDeadline && entries.some(([pid]) => groupAlive(pid))) await delay(100);
    for (const [pid] of entries) if (!groupAlive(pid)) this.groups.delete(pid);
    if (entries.some(([pid]) => groupAlive(pid))) throw new Error('旧作品仍在关闭，请稍后重试。');
  }

  start(sampleId) {
    const sample = this.samples.get(sampleId);
    if (!sample) throw Object.assign(new Error('未找到这个作品。'), { statusCode: 400 });
    this.heartbeat();
    if (this.status.activeSampleId === sampleId && ['ready', 'preparing', 'starting'].includes(this.status.state)) return this.snapshot();
    if (['preparing', 'starting', 'stopping'].includes(this.status.state) || this.stopPromise) throw Object.assign(new Error('正在切换作品，请稍候。'), { statusCode: 409 });
    const oldGeneration = this.generation;
    const generation = ++this.generation;
    this.status = { state: 'preparing', activeSampleId: sampleId, frontUrl: null, message: '正在准备作品。', error: null, startedAt: null };
    this.job = (async () => {
      try {
        // 失败清理若曾超时，也先回收遗留的自身进程，才能启动下一位。
        for (const ownedGeneration of new Set([oldGeneration, ...[...this.groups.values()].map(record => record.generation)])) await this.killGroups(ownedGeneration);
        this.current(generation);
        await portFree(sample.frontPort); await portFree(sample.backPort);
        await fs.writeFile(path.join(this.cacheRoot, sample.sampleId + '.log'), '', { mode: 0o600 });
        const directory = await this.prepare(sample, generation);
        for (const step of sample.beforeStart) await this.runStep(sample, directory, step, generation);
        this.current(generation);
        await portFree(sample.frontPort); await portFree(sample.backPort);
        this.update(generation, { state: 'starting', message: '正在启动作品。' });
        const records = sample.commands.map(step => this.spawnStep(sample, directory, step, generation, true));
        const deadline = Date.now() + 90_000;
        while (Date.now() < deadline) {
          this.current(generation);
          if (records.some(({ child }) => child.exitCode !== null || child.signalCode !== null || !child.pid)) throw new Error('作品未能启动，请重试。');
          let frontendReady = false;
          try { const response = await fetch(sample.frontUrl, { signal: AbortSignal.timeout(1500), redirect: 'manual' }); frontendReady = response.status === 200; await response.body?.cancel(); } catch {}
          if (frontendReady && await this.backendListening(sample.backPort)) {
            if (records.some(({ child }) => child.exitCode !== null || child.signalCode !== null)) throw new Error('作品未能稳定启动，请重试。');
            this.update(generation, { state: 'ready', frontUrl: sample.frontUrl, message: '可以开始体验。', startedAt: new Date().toISOString() });
            return;
          }
          await delay(400);
        }
        throw new Error('作品启动超时，请重试。');
      } catch (error) {
        if (generation === this.generation) await this.fail(generation, sample, error.message);
      }
    })();
    return this.snapshot();
  }

  backendListening(port) {
    return new Promise(resolve => {
      const socket = net.connect({ host: '127.0.0.1', port });
      const finish = value => { socket.destroy(); resolve(value); };
      socket.setTimeout(700, () => finish(false));
      socket.once('connect', () => finish(true)); socket.once('error', () => finish(false));
    });
  }

  async fail(generation, sample, message) {
    if (generation !== this.generation) return;
    // 先失效 generation，避免两个子进程退出事件同时触发失败回收。
    const failureGeneration = ++this.generation;
    Object.assign(this.status, { state: 'stopping', frontUrl: null, message: '正在收尾。' });
    await this.killGroups(generation).catch(() => {});
    if (failureGeneration !== this.generation) return;
    const safe = /^[\u4e00-\u9fff\d\s，。]+$/.test(message) ? message : '作品未能启动，请重新尝试。';
    Object.assign(this.status, { state: 'failed', message: safe, error: safe, frontUrl: null });
    await this.log(sample.sampleId, '\n运行已结束：' + message + '\n').catch(() => {});
  }

  async stop() {
    if (this.stopPromise) return this.stopPromise;
    const generation = this.generation;
    ++this.generation;
    Object.assign(this.status, { state: 'stopping', frontUrl: null, message: '正在关闭作品。' });
    this.stopPromise = (async () => {
      await this.killGroups(generation);
      // 等复制/安装分支观察到取消，防止关停返回后又启动进程。
      await this.job;
      for (const remaining of new Set([...this.groups.values()].map(record => record.generation))) await this.killGroups(remaining);
      this.status = { state: 'idle', activeSampleId: null, frontUrl: null, message: '作品已停止。', error: null, startedAt: null };
      return this.snapshot();
    })().finally(() => { this.stopPromise = null; });
    return this.stopPromise;
  }
}
