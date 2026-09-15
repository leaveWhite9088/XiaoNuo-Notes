import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { config } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigins }));
  app.use(compression());
  app.use(express.json());

  // 简易访问日志
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      const started = Date.now();
      res.on('finish', () => {
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - started}ms`);
      });
    }
    next();
  });

  // 静态素材：封面 / 头像 / 轮播图 / mp4 片源（express.static 自带 Range 支持，播放器可拖动进度）
  app.use(
    config.mediaRoute,
    express.static(path.join(__dirname, '..', 'public', 'media'), {
      maxAge: '1h',
      fallthrough: false,
    }),
  );

  app.use('/api', apiRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
