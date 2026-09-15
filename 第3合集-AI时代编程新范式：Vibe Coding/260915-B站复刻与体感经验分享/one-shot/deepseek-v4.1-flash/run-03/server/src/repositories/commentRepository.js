import { all, get, run, transaction } from '../db/index.js';

/** 评论仓储 */

export function findByBvid(bvid, { limit = 20, sort = 'hot' } = {}) {
  const order = sort === 'new' ? 'ctime DESC' : 'like_count DESC, ctime DESC';
  return all(
    `SELECT * FROM comments WHERE bvid = ? ORDER BY ${order} LIMIT ?`,
    [bvid, limit],
  );
}

export function countByBvid(bvid) {
  return get('SELECT COUNT(*) AS n FROM comments WHERE bvid = ?', [bvid])?.n ?? 0;
}

export function insertMany(comments = []) {
  transaction(() => {
    for (const c of comments) {
      run(
        `INSERT INTO comments (bvid, mid, user_name, user_face, content, like_count, reply_count, location, ctime)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          c.bvid, c.mid ?? null, c.userName, c.userFace ?? '', c.content,
          c.likeCount ?? 0, c.replyCount ?? 0, c.location ?? '', c.ctime ?? 0,
        ],
      );
    }
  });
  return comments.length;
}

export function clear(bvid = null) {
  if (bvid) run('DELETE FROM comments WHERE bvid = ?', [bvid]);
  else run('DELETE FROM comments');
}

/** 用于首页“热门评论”侧栏 */
export function findHottest(limit = 5) {
  return all(
    `SELECT c.*, v.title AS video_title, v.cover AS video_cover
     FROM comments c LEFT JOIN videos v ON v.bvid = c.bvid
     ORDER BY c.like_count DESC LIMIT ?`,
    [limit],
  );
}

export default { findByBvid, countByBvid, insertMany, clear, findHottest };
