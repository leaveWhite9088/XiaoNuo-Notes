import express from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { MEDIA_DIR } from './config.js';
import { errorHandler, notFound, ok } from './middleware/errorHandler.js';
import { homeRouter } from './routes/home.js';
import { searchRouter } from './routes/search.js';
import { videosRouter } from './routes/videos.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(compression());
  app.use(express.json());
  app.use(morgan('tiny', { skip: (req) => req.url.startsWith('/media/') }));

  // 真实封面 / 头像 / 演示片源（支持 Range，<video> 可拖动进度）
  app.use(
    '/media',
    express.static(MEDIA_DIR, {
      maxAge: '7d',
      acceptRanges: true,
      fallthrough: false,
    }),
  );

  app.get('/api/health', (_req, res) => ok(res, { status: 'ok', time: Date.now() }));
  app.use('/api/search', searchRouter);
  app.use('/api/videos', videosRouter);
  app.use('/api', homeRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
