import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';

import { logger } from './middlewares/logger.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

import { healthRouter } from './routes/health.js';
import { categoryRouter } from './routes/categories.js';
import { videoRouter } from './routes/videos.js';
import { searchRouter } from './routes/search.js';
import { commentRouter } from './routes/comments.js';
import { bannerRouter } from './routes/banners.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');

export const app = express();

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '256kb' }));
app.use(logger);

// 静态资源：封面 / 头像 / 示例视频 / banner
app.use('/static', express.static(PUBLIC_DIR, { maxAge: '7d', immutable: true }));

app.use('/api/health', healthRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/feed', videoRouter);
app.use('/api/video', videoRouter);
app.use('/api/search', searchRouter);
app.use('/api/comments', commentRouter);
app.use('/api/banners', bannerRouter);

// 可选生产模式：存在 client/dist 时由后端直接托管前端（单端口部署）
const CLIENT_DIST = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get(/^(?!\/api|\/static).*/, (_req, res) => {
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);
