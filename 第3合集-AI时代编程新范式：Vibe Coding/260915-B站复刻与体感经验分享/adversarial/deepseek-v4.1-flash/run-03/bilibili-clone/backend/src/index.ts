import fs from 'node:fs';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { migrate } from './db/sqlite.js';

/** 入口：确保数据库结构与种子数据就绪后启动 HTTP 服务 */
function bootstrap() {
  const firstRun = !fs.existsSync(config.dbFile);
  migrate();
  if (firstRun) {
    console.log('ℹ 首次启动：数据库为空，请执行 `npm run seed` 装载演示数据');
  }

  const app = createApp();
  app.listen(config.port, config.host, () => {
    console.log('');
    console.log('  ┌───────────────────────────────────────────────┐');
    console.log('  │  bilibili-clone API  (Express + TS + SQLite)  │');
    console.log('  └───────────────────────────────────────────────┘');
    console.log(`  ▸ 接口地址   http://localhost:${config.port}/api`);
    console.log(`  ▸ 媒体资源   http://localhost:${config.port}/media`);
    console.log(`  ▸ 前端地址   ${config.frontendOrigin}`);
    console.log('');
  });
}

bootstrap();
