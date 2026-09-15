// 同时启动前后端的开发脚本
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

function start(name, cwd, color) {
  const p = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev'], {
    cwd,
    env: process.env,
    stdio: 'inherit',
    shell: false,
  })
  p.on('exit', (code) => {
    console.log(`[${name}] exited with code ${code}`)
  })
  return p
}

console.log('[dev] starting backend + frontend...')
const backend = start('backend', path.join(root, 'backend'))
const frontend = start('frontend', path.join(root, 'frontend'))

const shutdown = () => {
  backend.kill()
  frontend.kill()
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
