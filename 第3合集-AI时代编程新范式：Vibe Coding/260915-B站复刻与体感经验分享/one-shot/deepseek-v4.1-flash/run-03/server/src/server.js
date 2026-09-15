import { createApp } from './app.js';
import config from './config/index.js';
import { createLogger } from './utils/logger.js';
import { getDB } from './db/index.js';
import videoRepository from './repositories/videoRepository.js';

const log = createLogger('bootstrap');

const app = createApp();

const server = app.listen(config.port, config.host, () => {
  getDB();
  const stats = videoRepository.stats();
  log.info(`B站首页复刻后端已启动 → http://localhost:${config.port}`);
  log.info(`数据概览: 视频 ${stats.videos} · 分区 ${stats.categories} · UP主 ${stats.users}` +
    ` · 评论 ${stats.comments} · 轮播 ${stats.banners}`);
  if (!stats.videos) {
    log.warn('数据库为空，请先执行: npm run seed');
  }
});

server.on('error', (err) => {
  log.error(`启动失败: ${err.message}`);
  process.exit(1);
});

/**
 * 兜底守卫：流媒体代理场景下，socket 中断等异常不应让整个服务退出。
 * 记录后继续服务，前端会自动重试。
 */
process.on('uncaughtException', (err) => {
  log.error(`未捕获异常（已忽略，服务继续运行）: ${err.message}`);
});
process.on('unhandledRejection', (reason) => {
  log.error(`未处理的 Promise 拒绝（已忽略）: ${reason?.message || reason}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    log.info(`收到 ${signal}，正在关闭服务...`);
    server.close(() => process.exit(0));
  });
}

export default server;
