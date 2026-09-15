import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** 后端根目录 */
export const ROOT_DIR = path.resolve(__dirname, '..', '..');
export const config = {
    /** 后端端口（协议固定 5112） */
    port: Number(process.env.PORT ?? 5112),
    host: process.env.HOST ?? '0.0.0.0',
    /** 前端开发服务器地址，仅用于日志提示与 CORS 白名单 */
    frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3112',
    dbFile: process.env.DB_FILE ?? path.join(ROOT_DIR, 'data', 'bilibili.db'),
    seedFile: path.join(ROOT_DIR, 'data', 'seed.json'),
    publicDir: path.join(ROOT_DIR, 'public'),
    /** 列表分页约束 */
    pageSize: { default: 24, max: 48 },
};
//# sourceMappingURL=index.js.map