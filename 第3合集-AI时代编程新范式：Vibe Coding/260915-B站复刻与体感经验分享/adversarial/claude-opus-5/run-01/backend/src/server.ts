import { createApp } from './app.js';
import { HOST, PORT } from './config.js';
import { initDatabase } from './db/index.js';

initDatabase();

const app = createApp();
const server = app.listen(PORT, HOST, () => {
  console.log(`[api] bilibili-clone backend → http://${HOST}:${PORT}`);
  console.log(`[api] 前端开发服务器固定在 http://127.0.0.1:3602（/api 与 /media 走代理）`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
