import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** 项目根目录（server/） */
export const ROOT_DIR = path.resolve(__dirname, '../..');

/**
 * 全局配置：所有可调参数集中在此，业务层不写死常量。
 */
export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5111),
  host: process.env.HOST || '0.0.0.0',

  /** 前端开发服务器地址，用于 CORS 白名单 */
  corsOrigins: [
    'http://localhost:3111',
    'http://127.0.0.1:3111',
  ],

  db: {
    file: process.env.DB_FILE || path.join(ROOT_DIR, 'data', 'bilibili.db'),
    schema: path.join(ROOT_DIR, 'src', 'db', 'schema.sql'),
  },

  /** 数据源：B站公开接口（仅用于 seed 阶段抓取真实内容） */
  upstream: {
    baseUrl: 'https://api.bilibili.com',
    homeUrl: 'https://www.bilibili.com/',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    referer: 'https://www.bilibili.com/',
    timeout: 20000,
  },

  /** 播放代理配置 */
  play: {
    /** 默认清晰度（B站 qn：16=360P, 32=480P, 64=720P, 80=1080P） */
    defaultQuality: 64,
    qualityOptions: [
      { qn: 16, label: '360P 流畅' },
      { qn: 32, label: '480P 清晰' },
      { qn: 64, label: '720P 高清' },
    ],
    /** playurl 缓存时长（毫秒），B站链接带 deadline，缓存 10 分钟 */
    cacheTtl: 10 * 60 * 1000,
  },

  /** 首页信息流默认分页 */
  feed: {
    pageSize: 20,
    maxPageSize: 50,
  },
};

export default config;
