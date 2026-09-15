import { all, get, run, transaction, parseJSON } from '../db/index.js';

/**
 * 视频仓储：唯一的 SQL 出口。
 * 返回原始行（snake_case），由 Service 层转换为 DTO。
 */

const BASE_SELECT = `
  SELECT
    v.bvid, v.aid, v.cid, v.title, v.description, v.cover, v.duration,
    v.tags, v.owner_mid, v.owner_name, v.owner_face, v.pubdate, v.created_at, v.featured,
    v.playable, v.category_id,
    c.slug   AS category_slug,
    c.name   AS category_name,
    COALESCE(s.view, 0)       AS view,
    COALESCE(s.danmaku, 0)    AS danmaku,
    COALESCE(s.reply, 0)      AS reply,
    COALESCE(s.favorite, 0)   AS favorite,
    COALESCE(s.coin, 0)       AS coin,
    COALESCE(s.share, 0)      AS share,
    COALESCE(s.like_count, 0) AS like_count,
    COALESCE(s.score, 0)      AS score
  FROM videos v
  LEFT JOIN video_stats s ON s.bvid = v.bvid
  LEFT JOIN categories  c ON c.id = v.category_id
`;

function hydrate(row) {
  if (!row) return null;
  return { ...row, tags: parseJSON(row.tags, []) };
}

export function findFeed({ categoryId = null, sort = 'hot', page = 1, pageSize = 20 } = {}) {
  const where = [];
  const params = [];
  if (categoryId) {
    where.push('v.category_id = ?');
    params.push(categoryId);
  }
  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderSQL = {
    hot: 'COALESCE(s.score, 0) DESC, v.pubdate DESC',
    new: 'v.pubdate DESC, COALESCE(s.score, 0) DESC',
    play: 'COALESCE(s.view, 0) DESC',
    danmaku: 'COALESCE(s.danmaku, 0) DESC',
  }[sort] || 'COALESCE(s.score, 0) DESC';

  const offset = (page - 1) * pageSize;
  // 已知不可播放（版权内容）的视频始终排在后面，保证主链路点击即可播
  const rows = all(
    `${BASE_SELECT} ${whereSQL}
     ORDER BY CASE WHEN v.playable = 0 THEN 1 ELSE 0 END ASC, ${orderSQL}
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset],
  );
  return rows.map(hydrate);
}

export function countFeed({ categoryId = null } = {}) {
  if (categoryId) {
    const row = get('SELECT COUNT(*) AS total FROM videos WHERE category_id = ?', [categoryId]);
    return row?.total ?? 0;
  }
  const row = get('SELECT COUNT(*) AS total FROM videos');
  return row?.total ?? 0;
}

export function findByBvid(bvid) {
  return hydrate(get(`${BASE_SELECT} WHERE v.bvid = ?`, [bvid]));
}

export function findByBvids(bvids = []) {
  if (!bvids.length) return [];
  const placeholders = bvids.map(() => '?').join(',');
  return all(`${BASE_SELECT} WHERE v.bvid IN (${placeholders})`, bvids).map(hydrate);
}

export function search({ keyword, page = 1, pageSize = 20, categoryId = null } = {}) {
  const like = `%${keyword}%`;
  const params = [like, like, like];
  let whereSQL = 'WHERE (v.title LIKE ? OR v.owner_name LIKE ? OR v.tags LIKE ?)';
  if (categoryId) {
    whereSQL += ' AND v.category_id = ?';
    params.push(categoryId);
  }
  const offset = (page - 1) * pageSize;
  const rows = all(
    `${BASE_SELECT} ${whereSQL} ORDER BY COALESCE(s.score, 0) DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset],
  );
  const totalRow = get(
    `SELECT COUNT(*) AS total FROM videos v ${whereSQL.replace(/v\./g, 'v.')}`,
    params,
  );
  return { list: rows.map(hydrate), total: totalRow?.total ?? 0 };
}

export function findRelated(bvid, categoryId, limit = 10) {
  const rows = all(
    `${BASE_SELECT} WHERE v.bvid != ? AND v.category_id = ?
     ORDER BY COALESCE(s.score, 0) DESC LIMIT ?`,
    [bvid, categoryId, limit],
  );
  return rows.map(hydrate);
}

export function findTrending(limit = 10) {
  return all(`${BASE_SELECT} ORDER BY COALESCE(s.score, 0) DESC LIMIT ?`, [limit]).map(hydrate);
}

export function randomPicks(limit = 6, exclude = []) {
  const placeholders = exclude.map(() => '?').join(',');
  const where = exclude.length ? `WHERE v.bvid NOT IN (${placeholders})` : '';
  return all(
    `${BASE_SELECT} ${where} ORDER BY RANDOM() LIMIT ?`,
    [...exclude, limit],
  ).map(hydrate);
}

/* ------------------------- 写入 ------------------------- */

export function upsertVideo(video) {
  run(
    `INSERT INTO videos
       (bvid, aid, cid, title, description, cover, duration, category_id, tags,
        owner_mid, owner_name, owner_face, pubdate, created_at, featured, playable)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(bvid) DO UPDATE SET
       aid = excluded.aid,
       cid = COALESCE(videos.cid, excluded.cid),
       title = excluded.title,
       description = excluded.description,
       cover = excluded.cover,
       duration = excluded.duration,
       category_id = excluded.category_id,
       tags = excluded.tags,
       owner_mid = excluded.owner_mid,
       owner_name = excluded.owner_name,
       owner_face = excluded.owner_face,
       pubdate = excluded.pubdate,
       featured = excluded.featured,
       playable = COALESCE(excluded.playable, videos.playable)`,
    [
      video.bvid, video.aid ?? null, video.cid ?? null, video.title, video.description ?? '',
      video.cover, video.duration ?? 0, video.categoryId ?? null,
      JSON.stringify(video.tags ?? []), video.ownerMid ?? null, video.ownerName ?? '',
      video.ownerFace ?? '', video.pubdate ?? 0, Date.now(), video.featured ?? 0,
      video.playable ?? null,
    ],
  );
}

/** 播放地址探测结果回写（0 = 版权内容不可播） */
export function updatePlayable(bvid, playable) {
  run('UPDATE videos SET playable = ? WHERE bvid = ?', [playable ? 1 : 0, bvid]);
}

export function upsertStats(bvid, stats = {}) {
  run(
    `INSERT INTO video_stats (bvid, view, danmaku, reply, favorite, coin, share, like_count, score, rank)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(bvid) DO UPDATE SET
       view = excluded.view,
       danmaku = excluded.danmaku,
       reply = excluded.reply,
       favorite = excluded.favorite,
       coin = excluded.coin,
       share = excluded.share,
       like_count = excluded.like_count,
       score = excluded.score,
       rank = excluded.rank`,
    [
      bvid, stats.view ?? 0, stats.danmaku ?? 0, stats.reply ?? 0, stats.favorite ?? 0,
      stats.coin ?? 0, stats.share ?? 0, stats.likeCount ?? 0, stats.score ?? 0, stats.rank ?? 0,
    ],
  );
}

export function updateCid(bvid, cid, aid = null) {
  run(
    `UPDATE videos SET cid = ?, aid = COALESCE(?, aid) WHERE bvid = ?`,
    [cid, aid, bvid],
  );
}

export function bulkUpsert(videos = []) {
  transaction(() => {
    for (const v of videos) {
      upsertVideo(v);
      upsertStats(v.bvid, v.stats ?? {});
    }
  });
  return videos.length;
}

export function replaceRanking(categoryId, items = []) {
  transaction(() => {
    run('DELETE FROM ranking WHERE category_id = ?', [categoryId]);
    items.forEach((item, index) => {
      run(
        'INSERT INTO ranking (category_id, bvid, score, position) VALUES (?, ?, ?, ?)',
        [categoryId, item.bvid, item.score ?? 0, index + 1],
      );
    });
  });
}

export function findRanking(categoryId, limit = 10) {
  const rows = all(
    `${BASE_SELECT}
     JOIN ranking r ON r.bvid = v.bvid AND r.category_id = ?
     ORDER BY r.position ASC LIMIT ?`,
    [categoryId, limit],
  );
  return rows.map(hydrate);
}

export function stats() {
  return {
    videos: get('SELECT COUNT(*) AS n FROM videos')?.n ?? 0,
    categories: get('SELECT COUNT(*) AS n FROM categories')?.n ?? 0,
    users: get('SELECT COUNT(*) AS n FROM users')?.n ?? 0,
    comments: get('SELECT COUNT(*) AS n FROM comments')?.n ?? 0,
    banners: get('SELECT COUNT(*) AS n FROM banners')?.n ?? 0,
  };
}

export default {
  findFeed, countFeed, findByBvid, findByBvids, search, findRelated, findTrending,
  randomPicks, upsertVideo, upsertStats, updateCid, updatePlayable, bulkUpsert,
  replaceRanking, findRanking, stats,
};
