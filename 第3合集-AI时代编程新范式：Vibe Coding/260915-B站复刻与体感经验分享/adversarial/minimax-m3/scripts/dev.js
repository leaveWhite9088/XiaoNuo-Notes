/**
 * 一键启动：mock 后端 + Vite 前端
 * 用 Node child_process 同时拉起两个服务，并在父进程退出时一起关掉
 */
const { spawn } = require('child_process');
const path = require('path');

const root = __dirname.replace(/scripts$/, '').replace(/[\\/]$/, '');
const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

function run(name, cwd, color) {
  const child = spawn(npmCmd, ['run', name], {
    cwd,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });
  const prefix = `\x1b[${color}m[${name}]\x1b[0m`;
  child.stdout.on('data', (b) => process.stdout.write(prefixLines(prefix, b.toString())));
  child.stderr.on('data', (b) => process.stderr.write(prefixLines(prefix, b.toString())));
  child.on('exit', (code) => {
    console.log(`${prefix} exited with ${code}`);
    shutdown();
  });
  return child;
}

function prefixLines(prefix, text) {
  return text
    .split(/\r?\n/)
    .filter((l) => l.length > 0)
    .map((l) => `${prefix} ${l}`)
    .join('\n') + '\n';
}

const serverProc = run('dev:server', root, '36');
const webProc = run('dev:web', path.join(root, 'web'), '33');

function shutdown() {
  try { serverProc.kill('SIGINT'); } catch (_) {}
  try { webProc.kill('SIGINT'); } catch (_) {}
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('\x1b[1m\x1b[32m=== bilibili-mock dev ===\x1b[0m');
console.log('  backend: http://localhost:4000');
console.log('  frontend: http://localhost:5173');
console.log('  按 Ctrl+C 停止所有服务\n');
