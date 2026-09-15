import { db } from '../db/index.js';
import type { VideoCard } from '../types.js';
import { VIDEO_COLUMNS, toVideoCard, type Row } from './mappers.js';

const BASE = `FROM videos v JOIN owners o ON o.mid = v.owner_mid`;
const escapeLike = (q: string) => q.replace(/[\\%_]/g, (m) => `\\${m}`);

export type SearchOrder = 'default' | 'view' | 'pubdate' | 'danmaku';

const ORDER: Record<SearchOrder, string> = {
  default: 'score DESC, v.hot_score DESC, v.bvid',
  view: 'v.view_count DESC, v.bvid',
  pubdate: 'v.pubdate DESC, v.bvid',
  danmaku: 'v.danmaku_count DESC, v.bvid',
};

export const searchRepo = {
  /** 标题 / UP 主 / 标签 命中，标题命中权重最高 */
  search(keyword: string, order: SearchOrder, page: number, pageSize: number) {
    const like = `%${escapeLike(keyword)}%`;
    const scored = `
      (CASE WHEN v.title LIKE ? ESCAPE '\\' THEN 6 ELSE 0 END
     + CASE WHEN o.name LIKE ? ESCAPE '\\' THEN 4 ELSE 0 END
     + CASE WHEN v.partition_name LIKE ? ESCAPE '\\' THEN 2 ELSE 0 END
     + CASE WHEN EXISTS (SELECT 1 FROM video_tags t WHERE t.bvid = v.bvid AND t.tag LIKE ? ESCAPE '\\') THEN 2 ELSE 0 END) AS score`;
    const where = `WHERE (v.title LIKE ? ESCAPE '\\' OR o.name LIKE ? ESCAPE '\\' OR v.partition_name LIKE ? ESCAPE '\\'
      OR EXISTS (SELECT 1 FROM video_tags t WHERE t.bvid = v.bvid AND t.tag LIKE ? ESCAPE '\\'))`;

    const total = Number(
      (db.prepare(`SELECT COUNT(*) AS n ${BASE} ${where}`).get(like, like, like, like) as Row).n,
    );
    const rows = db
      .prepare(
        `SELECT ${VIDEO_COLUMNS}, ${scored} ${BASE} ${where} ORDER BY ${ORDER[order]} LIMIT ? OFFSET ?`,
      )
      .all(like, like, like, like, like, like, like, like, pageSize, (page - 1) * pageSize) as Row[];
    return { total, items: rows.map(toVideoCard) as VideoCard[] };
  },

  titleMatches(keyword: string, limit: number) {
    const like = `%${escapeLike(keyword)}%`;
    return (
      db
        .prepare(
          `SELECT v.title, v.bvid, v.cover, v.view_count ${BASE} WHERE v.title LIKE ? ESCAPE '\\'
           ORDER BY v.hot_score DESC LIMIT ?`,
        )
        .all(like, limit) as Row[]
    ).map((r) => ({
      title: String(r.title),
      bvid: String(r.bvid),
      cover: String(r.cover),
      view: Number(r.view_count),
    }));
  },

  ownerMatches(keyword: string, limit: number) {
    const like = `%${escapeLike(keyword)}%`;
    return (
      db
        .prepare(
          `SELECT o.mid, o.name, o.face, o.fans, COUNT(v.bvid) AS n
           FROM owners o JOIN videos v ON v.owner_mid = o.mid
           WHERE o.name LIKE ? ESCAPE '\\' GROUP BY o.mid ORDER BY o.fans DESC LIMIT ?`,
        )
        .all(like, limit) as Row[]
    ).map((r) => ({
      mid: Number(r.mid),
      name: String(r.name),
      face: String(r.face),
      fans: Number(r.fans),
      videos: Number(r.n),
    }));
  },

  tagMatches(keyword: string, limit: number) {
    const like = `%${escapeLike(keyword)}%`;
    return (
      db
        .prepare(
          `SELECT tag, COUNT(*) AS n FROM video_tags WHERE tag LIKE ? ESCAPE '\\'
           GROUP BY tag ORDER BY n DESC LIMIT ?`,
        )
        .all(like, limit) as Row[]
    ).map((r) => ({ tag: String(r.tag), count: Number(r.n) }));
  },

  hotKeywordMatches(keyword: string, limit: number) {
    const like = `%${escapeLike(keyword)}%`;
    return (
      db
        .prepare(
          `SELECT keyword, show_name FROM hot_searches
           WHERE keyword LIKE ? ESCAPE '\\' OR show_name LIKE ? ESCAPE '\\'
           ORDER BY rank_no LIMIT ?`,
        )
        .all(like, like, limit) as Row[]
    ).map((r) => ({ keyword: String(r.keyword), showName: String(r.show_name) }));
  },

  rememberKeyword(keyword: string) {
    db.prepare(
      'INSERT INTO search_history (keyword, ctime) VALUES (?, ?) ON CONFLICT(keyword) DO UPDATE SET ctime = excluded.ctime',
    ).run(keyword, Math.floor(Date.now() / 1000));
  },

  recentKeywords(limit: number): string[] {
    return (
      db.prepare('SELECT keyword FROM search_history ORDER BY ctime DESC LIMIT ?').all(limit) as Row[]
    ).map((r) => String(r.keyword));
  },

  clearHistory() {
    db.prepare('DELETE FROM search_history').run();
  },
};
