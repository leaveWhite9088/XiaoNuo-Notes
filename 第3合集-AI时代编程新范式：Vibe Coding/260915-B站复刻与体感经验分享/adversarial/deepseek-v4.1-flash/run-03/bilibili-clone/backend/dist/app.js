import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { apiRouter } from './routes/index.js';
import { config } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/index.js';
export function createApp() {
    const app = express();
    app.use(cors({
        origin: [config.frontendOrigin, `http://127.0.0.1:3112`, `http://localhost:3112`],
        credentials: true,
    }));
    app.use(express.json({ limit: '1mb' }));
    if (process.env.NODE_ENV !== 'test')
        app.use(morgan('dev'));
    // 真实图片 / 视频等静态媒体资源（本地已下载，避免防盗链与外网依赖）
    app.use('/media', express.static(config.publicDir + '/media', {
        maxAge: '7d',
        etag: true,
        // 支持视频拖动进度（Range 请求）
        acceptRanges: true,
    }));
    app.use('/api', apiRouter);
    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map