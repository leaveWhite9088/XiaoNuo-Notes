/** 服务端配置：端口固定 5601，与前端 vite 代理、README 保持一致。 */
export const config = {
  port: Number(process.env.PORT) || 5601,
  host: process.env.HOST || '127.0.0.1',
  /** 允许前端 3601 直接跨域访问（不走 vite 代理时也能用） */
  corsOrigins: ['http://localhost:3601', 'http://127.0.0.1:3601'],
  /** 静态资源目录（封面 / 头像 / 视频片源） */
  mediaRoute: '/media',
};
