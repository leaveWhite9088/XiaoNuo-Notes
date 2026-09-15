import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { spawn } from 'node:child_process';
import { ShowcaseRunner } from './runner.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4399;
const HOST = `127.0.0.1:${PORT}`;
const ORIGIN = `http://${HOST}`;
const token = randomBytes(32).toString('hex');
const manifest = JSON.parse(await fs.readFile(path.join(ROOT, 'data/live-manifest.json'), 'utf8'));
const runner = new ShowcaseRunner(await fs.realpath(path.dirname(ROOT)), manifest);
await runner.init();

const publicFiles = new Set([
  'index.html', 'app.js', 'styles.css', 'live.html', 'live.js', 'live.css',
  'data/results.json', 'data/results.js', 'data/live-tips.json', 'data/live-tips.js'
]);
const mediaTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.avif': 'image/avif' };

function json(response, code, data) {
  response.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(data));
}

function validToken(candidate) {
  if (typeof candidate !== 'string' || candidate.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(candidate), Buffer.from(token));
}

async function bodyJson(request) {
  let buffer = '';
  for await (const chunk of request) {
    buffer += chunk.toString();
    if (buffer.length > 1024) throw Object.assign(new Error('请求内容过长。'), { statusCode: 413 });
  }
  try {
    const value = JSON.parse(buffer || '{}');
    if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error();
    return value;
  } catch { throw Object.assign(new Error('请求格式不正确。'), { statusCode: 400 }); }
}

const server = http.createServer(async (request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('X-Frame-Options', 'DENY');
  try {
    if (request.headers.host !== HOST) return json(response, 403, { error: '请从本机演示入口访问。' });
    const url = new URL(request.url, ORIGIN);
    if (url.pathname.startsWith('/api/')) {
      if (request.headers.origin && request.headers.origin !== ORIGIN) return json(response, 403, { error: '请从演示页面操作。' });
      if (request.headers['sec-fetch-site'] === 'cross-site') return json(response, 403, { error: '请从演示页面操作。' });
      if (request.method === 'GET') {
        if (url.pathname === '/api/live/catalog') return json(response, 200, { token, samples: runner.catalog() });
        if (url.pathname === '/api/live/status') return json(response, 200, runner.snapshot());
        return json(response, 404, { error: '没有找到这个功能。' });
      }
      if (request.method !== 'POST') return json(response, 405, { error: '请求方式不支持。' });
      if (request.headers.origin !== ORIGIN || !validToken(request.headers['x-live-token']) || !/^application\/json(?:\s*;|$)/i.test(request.headers['content-type'] || '')) {
        return json(response, 403, { error: '请刷新演示页面后重试。' });
      }
      const body = await bodyJson(request);
      if (url.pathname === '/api/live/start') {
        if (Object.keys(body).length !== 1 || typeof body.sampleId !== 'string') return json(response, 400, { error: '请选择一个作品。' });
        return json(response, 202, runner.start(body.sampleId));
      }
      if (Object.keys(body).length) return json(response, 400, { error: '请求参数不正确。' });
      if (url.pathname === '/api/live/stop') return json(response, 200, await runner.stop());
      if (url.pathname === '/api/live/heartbeat') { runner.heartbeat(); return json(response, 200, { ok: true }); }
      return json(response, 404, { error: '没有找到这个功能。' });
    }
    if (!['GET', 'HEAD'].includes(request.method)) return json(response, 405, { error: '请求方式不支持。' });
    const relative = decodeURIComponent(url.pathname).replace(/^\//, '') || 'live.html';
    const asset = relative.startsWith('assets/') && /\.(?:png|jpe?g|webp|gif|svg|ico|avif)$/i.test(relative);
    if (!publicFiles.has(relative) && !asset) return json(response, 404, { error: '页面不存在。' });
    const filename = await fs.realpath(path.resolve(ROOT, relative)).catch(() => null);
    const allowedRoot = asset ? path.join(ROOT, 'assets') + path.sep : ROOT + path.sep;
    if (!filename || !filename.startsWith(allowedRoot)) return json(response, 404, { error: '页面不存在。' });
    const stat = await fs.stat(filename);
    if (!stat.isFile()) return json(response, 404, { error: '页面不存在。' });
    const data = request.method === 'HEAD' ? null : await fs.readFile(filename);
    response.writeHead(200, { 'Content-Type': mediaTypes[path.extname(filename)] || 'application/octet-stream', 'Content-Length': stat.size, 'Cache-Control': asset ? 'public, max-age=3600' : 'no-store' });
    response.end(data);
  } catch (error) {
    if (!response.headersSent) json(response, error.statusCode || 500, { error: error.statusCode ? error.message : '操作暂未完成，请稍后重试。' });
    else response.end();
  }
});

server.requestTimeout = 15_000;
server.headersTimeout = 10_000;
let closing = false;
async function shutdown(code = 0) {
  if (closing) return;
  closing = true;
  clearInterval(inactivity);
  server.close();
  const deadline = setTimeout(() => process.exit(1), 15_000);
  try { await runner.stop(); } catch { code = 1; }
  clearTimeout(deadline);
  server.closeAllConnections();
  process.exit(code);
}
const inactivity = setInterval(() => {
  if (Date.now() - runner.lastHeartbeat > 5 * 60_000 && !['idle', 'failed', 'stopping'].includes(runner.status.state)) {
    void runner.stop().catch(() => {});
  }
}, 30_000);
inactivity.unref();
process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());
process.on('SIGHUP', () => void shutdown());
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? '演示入口 4399 已在使用。请打开已有演示页面，或先关闭占用该端口的程序。' : '演示服务未能启动。');
  void shutdown(1);
});
server.listen(PORT, '127.0.0.1', () => {
  console.log(`实机演示已启动：${ORIGIN}/live.html`);
  console.log('结束时关闭这个窗口，或按 Control+C；当前作品会一并停止。');
  if (process.argv.includes('--open') && process.platform === 'darwin') {
    const browser = spawn('/usr/bin/open', [`${ORIGIN}/live.html`], { stdio: 'ignore' });
    browser.on('error', () => {});
  }
});
