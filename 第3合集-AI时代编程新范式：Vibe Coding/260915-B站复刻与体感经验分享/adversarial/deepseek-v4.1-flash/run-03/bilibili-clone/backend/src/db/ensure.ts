/**
 * 数据库就绪检查（供 `npm run dev` 使用）：
 * 只在数据库缺失或为空时装载演示数据，**不会**重置用户产生的
 * 互动 / 历史 / 评论 / 弹幕 —— 反复启动开发服务器不会丢数据。
 *
 *   npm run db:ensure      # 需要重建演示内容时请显式执行 npm run seed
 */
import { migrate, getDb } from './sqlite.js';

function tableCount(table: string): number {
  try {
    return (getDb().prepare(`SELECT COUNT(*) AS c FROM ${table}`).get() as { c: number }).c;
  } catch {
    return 0;
  }
}

export function ensureDatabase(): 'seeded' | 'existing' {
  migrate();
  if (tableCount('videos') === 0) return 'seeded';
  return 'existing';
}

if (process.argv[1] && process.argv[1].includes('ensure')) {
  const result = ensureDatabase();
  if (result === 'seeded') {
    console.log('ℹ 数据库为空，正在装载演示数据...');
    const { runSeed } = await import('./seed.js');
    runSeed();
  } else {
    const db = getDb();
    const videos = tableCount('videos');
    const comments = tableCount('comments');
    const danmaku = tableCount('danmaku');
    const history = tableCount('watch_history');
    console.log(
      `✔ 数据库已就绪（保留现有数据）: ${videos} 视频 / ${comments} 评论 / ${danmaku} 弹幕 / ${history} 条历史`,
    );
    console.log('  如需重建演示内容: npm run seed（默认保留用户数据）');
    db.close();
  }
}
