import { db } from '../db/index.js';
import type { FeedSort, VideoCard, VideoDetail } from '../types.js';
import { VIDEO_COLUMNS, toVideoCard, toVideoDetail, type Row } from './mappers.js';

const BASE = `FROM videos v JOIN owners o ON o.mid = v.owner_mid`;

/** 末位统一用 bvid 兜底，保证等值时跨页不重复 / 不漏项 */
const ORDER_BY: Record<FeedSort, string> = {
  recommend: 'v.hot_score DESC, v.pubdate DESC, v.bvid',
  hot: 'v.view_count DESC, v.bvid',
  latest: 'v.pubdate DESC, v.bvid',
  danmaku: 'v.danmaku_count DESC, v.bvid',
};

export interface FeedQuery {
  channelId?: string | null;
  sort: FeedSort;
  page: number;
  pageSize: number;
  /** 换一换：每次刷新用不同随机种子打散推荐流 */
  seed?: number;
}

export const videoRepo = {
  countFeed(channelId?: string | null): number {
    const sql = channelId
      ? 'SELECT COUNT(*) AS n FROM videos WHERE channel_id = ?'
      : 'SELECT COUNT(*) AS n FROM videos';
    const row = (channelId ? db.prepare(sql).get(channelId) : db.prepare(sql).get()) as Row;
    return Number(row.n);
  },

  listFeed({ channelId, sort, page, pageSize, seed = 0 }: FeedQuery): VideoCard[] {
    const where = channelId ? 'WHERE v.channel_id = ?' : '';
    // recommend 排序在热度基础上按 seed 抖动，实现「换一换」的洗牌效果
    const order =
      sort === 'recommend' && seed
        ? `(v.hot_score % (1 + ((ABS(v.aid) + ${Math.trunc(seed)}) % 97))) DESC, v.pubdate DESC, v.bvid`
        : ORDER_BY[sort];
    const sql = `SELECT ${VIDEO_COLUMNS} ${BASE} ${where} ORDER BY ${order} LIMIT ? OFFSET ?`;
    const params = channelId
      ? [channelId, pageSize, (page - 1) * pageSize]
      : [pageSize, (page - 1) * pageSize];
    return (db.prepare(sql).all(...params) as Row[]).map(toVideoCard);
  },

  findByBvid(bvid: string): Row | undefined {
    return db.prepare(`SELECT ${VIDEO_COLUMNS} ${BASE} WHERE v.bvid = ?`).get(bvid) as Row | undefined;
  },

  tagsOf(bvid: string): string[] {
    return (db.prepare('SELECT tag FROM video_tags WHERE bvid = ?').all(bvid) as Row[]).map(
      (r) => String(r.tag),
    );
  },

  detail(bvid: string, actions: VideoDetail['actions']): VideoDetail | null {
    const row = videoRepo.findByBvid(bvid);
    if (!row) return null;
    return toVideoDetail(row, videoRepo.tagsOf(bvid), actions);
  },

  /** 详情页右侧推荐：同分区优先，其次同 UP 主，最后热度补齐 */
  related(bvid: string, limit: number): VideoCard[] {
    const rows = db
      .prepare(
        `SELECT ${VIDEO_COLUMNS},
            CASE WHEN v.channel_id = (SELECT channel_id FROM videos WHERE bvid = ?) THEN 2 ELSE 0 END
          + CASE WHEN v.owner_mid = (SELECT owner_mid FROM videos WHERE bvid = ?) THEN 3 ELSE 0 END AS affinity
         ${BASE}
         WHERE v.bvid != ?
         ORDER BY affinity DESC, v.hot_score DESC, v.bvid
         LIMIT ?`,
      )
      .all(bvid, bvid, bvid, limit) as Row[];
    return rows.map(toVideoCard);
  },

  byOwner(mid: number, limit: number, excludeBvid?: string): VideoCard[] {
    const rows = db
      .prepare(
        `SELECT ${VIDEO_COLUMNS} ${BASE} WHERE v.owner_mid = ? AND v.bvid != ?
         ORDER BY v.pubdate DESC LIMIT ?`,
      )
      .all(mid, excludeBvid ?? '', limit) as Row[];
    return rows.map(toVideoCard);
  },

  byBvids(bvids: string[]): VideoCard[] {
    if (bvids.length === 0) return [];
    const holes = bvids.map(() => '?').join(',');
    const rows = db
      .prepare(`SELECT ${VIDEO_COLUMNS} ${BASE} WHERE v.bvid IN (${holes})`)
      .all(...bvids) as Row[];
    const byId = new Map(rows.map((r) => [String(r.bvid), toVideoCard(r)]));
    return bvids.map((b) => byId.get(b)).filter((v): v is VideoCard => Boolean(v));
  },

  bumpStat(bvid: string, column: 'view_count' | 'like_count' | 'coin_count' | 'favorite_count' | 'share_count', delta: number) {
    db.prepare(`UPDATE videos SET ${column} = MAX(0, ${column} + ?) WHERE bvid = ?`).run(delta, bvid);
  },

  statOf(bvid: string) {
    return db
      .prepare(
        'SELECT view_count, like_count, coin_count, favorite_count, share_count, danmaku_count, reply_count FROM videos WHERE bvid = ?',
      )
      .get(bvid) as Row | undefined;
  },
};
