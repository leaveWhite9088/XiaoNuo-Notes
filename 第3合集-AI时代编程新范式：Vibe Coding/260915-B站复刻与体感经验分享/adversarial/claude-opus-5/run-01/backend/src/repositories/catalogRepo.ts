import { db } from '../db/index.js';
import type { Banner, Channel, Comment, Danmaku } from '../types.js';
import { toComment, toDanmaku, type Row } from './mappers.js';

/** 频道 / 轮播 / 评论 / 弹幕 等首页与详情页的周边数据 */
export const catalogRepo = {
  channels(): Channel[] {
    const rows = db
      .prepare(
        `SELECT c.id, c.name, c.icon, c.color, COUNT(v.bvid) AS video_count
         FROM channels c LEFT JOIN videos v ON v.channel_id = c.id
         GROUP BY c.id ORDER BY c.sort_order`,
      )
      .all() as Row[];
    return rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      icon: String(r.icon),
      color: String(r.color),
      videoCount: Number(r.video_count),
    }));
  },

  channelExists(id: string): boolean {
    return Boolean(db.prepare('SELECT 1 AS x FROM channels WHERE id = ?').get(id));
  },

  banners(): Banner[] {
    const rows = db.prepare('SELECT id, bvid, title, image, badge FROM banners').all() as Row[];
    return rows.map((r) => ({
      id: String(r.id),
      bvid: String(r.bvid),
      title: String(r.title),
      image: String(r.image),
      badge: String(r.badge),
    }));
  },

  comments(bvid: string, sort: 'hot' | 'time'): Comment[] {
    const order = sort === 'time' ? 'c.ctime DESC' : 'c.like_count DESC';
    const rows = db
      .prepare(
        `SELECT c.id, c.bvid, c.content, c.like_count, c.reply_count, c.ctime,
                o.mid AS o_mid, o.name AS o_name, o.face AS o_face, o.level AS o_level
         FROM comments c JOIN owners o ON o.mid = c.mid
         WHERE c.bvid = ? ORDER BY ${order}`,
      )
      .all(bvid) as Row[];
    return rows.map(toComment);
  },

  danmaku(bvid: string): Danmaku[] {
    const rows = db
      .prepare(
        'SELECT id, time_sec, mode, color, content FROM danmaku WHERE bvid = ? ORDER BY time_sec',
      )
      .all(bvid) as Row[];
    return rows.map(toDanmaku);
  },

  hotSearches() {
    const rows = db
      .prepare('SELECT rank_no, keyword, show_name FROM hot_searches ORDER BY rank_no')
      .all() as Row[];
    return rows.map((r) => ({
      rank: Number(r.rank_no),
      keyword: String(r.keyword),
      showName: String(r.show_name),
    }));
  },
};
