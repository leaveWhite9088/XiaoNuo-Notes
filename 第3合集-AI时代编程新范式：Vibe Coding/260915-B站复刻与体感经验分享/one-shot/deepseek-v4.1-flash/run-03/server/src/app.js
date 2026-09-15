import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import routes from './routes/index.js';
import requestLogger from './middlewares/requestLogger.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';
import { getDB } from './db/index.js';

/**
 * 应用装配层：只做中间件与路由挂载，不含业务逻辑。
 */
export function createApp() {
  const app = express();

  // 确保数据库/表结构就绪
  getDB();

  app.disable('x-powered-by');
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
        return callback(null, true); // 本地演示：放开来源，便于任意端口调试
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // 健康检查
  app.get('/api/health', (req, res) => {
    res.json({
      code: 0,
      message: 'ok',
      data: { service: 'bili-clone-server', port: config.port, time: Date.now() },
    });
  });

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
