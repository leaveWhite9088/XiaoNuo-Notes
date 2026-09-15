// Express 应用工厂：与监听端口解耦，便于测试（API 冒烟测试用临时端口启动）
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as store from './data-store.js';
import { apiRouter } from './routes/api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  store.load();

  const app = express();
  app.use(cors());
  app.use(express.json());

  // 静态媒体（封面 / 头像 / 样例视频），前端通过 /media/* 代理访问
  app.use('/media', express.static(path.join(__dirname, '../public'), { maxAge: '1h' }));

  app.use('/api', apiRouter);

  // P3-7：/api 下未匹配路由统一返回 JSON 404（而非 Express 默认 HTML）
  app.use('/api', (req, res) => {
    res.status(404).json({ code: 404, message: `接口不存在: ${req.method} ${req.originalUrl}` });
  });

  app.get('/health', (_req, res) => res.json({ ok: true, videos: store.count() }));

  return app;
}
