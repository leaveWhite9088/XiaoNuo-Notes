import http from 'node:http';
import { app } from './app.js';

const PORT = Number(process.env.PORT) || 5801;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`[server] bilibili-clone API 已启动: http://127.0.0.1:${PORT}`);
  console.log('[server] 静态资源: /static/*  接口: /api/*');
});
