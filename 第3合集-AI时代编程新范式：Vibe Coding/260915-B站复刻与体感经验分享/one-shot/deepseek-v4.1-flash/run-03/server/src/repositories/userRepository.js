import { all, get, run, transaction } from '../db/index.js';

/** UP 主仓储 */

export function upsertMany(users = []) {
  transaction(() => {
    for (const u of users) {
      run(
        `INSERT INTO users (mid, name, face, sign, follower, following, level, vip, archive_count, likes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(mid) DO UPDATE SET
           name = excluded.name,
           face = excluded.face,
           sign = excluded.sign,
           follower = MAX(users.follower, excluded.follower),
           level = excluded.level,
           vip = excluded.vip,
           archive_count = excluded.archive_count,
           likes = excluded.likes`,
        [
          u.mid, u.name, u.face ?? '', u.sign ?? '', u.follower ?? 0, u.following ?? 0,
          u.level ?? 6, u.vip ?? 0, u.archiveCount ?? 0, u.likes ?? 0,
        ],
      );
    }
  });
  return users.length;
}

export function findByMid(mid) {
  return get('SELECT * FROM users WHERE mid = ?', [mid]);
}

export function findTop(limit = 12) {
  return all('SELECT * FROM users ORDER BY follower DESC LIMIT ?', [limit]);
}

/** 从视频表补齐头像/昵称（seed 未单独抓取 UP 主页时使用） */
export function syncFromVideos() {
  run(
    `INSERT INTO users (mid, name, face, follower, level, archive_count)
     SELECT v.owner_mid, v.owner_name, MAX(v.owner_face),
            SUM(COALESCE(s.view, 0)) / 50,
            6,
            COUNT(*)
     FROM videos v LEFT JOIN video_stats s ON s.bvid = v.bvid
     WHERE v.owner_mid IS NOT NULL
     GROUP BY v.owner_mid
     ON CONFLICT(mid) DO UPDATE SET
       name = excluded.name,
       face = CASE WHEN excluded.face != '' THEN excluded.face ELSE users.face END,
       archive_count = excluded.archive_count`,
  );
}

export default { upsertMany, findByMid, findTop, syncFromVideos };
