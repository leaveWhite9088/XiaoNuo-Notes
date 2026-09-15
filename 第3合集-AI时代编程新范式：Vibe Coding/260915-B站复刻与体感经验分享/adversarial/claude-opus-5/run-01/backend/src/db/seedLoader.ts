import fs from 'node:fs';
import type { DatabaseSync } from 'node:sqlite';
import { SEED_FILE } from '../config.js';

interface SeedChannel { id: string; name: string; icon: string; color: string }
interface SeedOwner { mid: number; name: string; face: string; sign: string; fans: number; videoCount: number; level: number }
interface SeedVideo {
  bvid: string; aid: number; cid: number; title: string; desc: string; cover: string; playUrl: string;
  duration: number; pubdate: number; channelId: string; partitionName: string; ownerMid: number;
  view: number; danmaku: number; reply: number; favorite: number; coin: number; share: number; like: number;
  copyright: number; pubLocation: string; width: number; height: number; hotScore: number; tags: string[];
}
interface SeedComment { id: string; bvid: string; mid: number; content: string; like: number; reply_count: number; ctime: number }
interface SeedDanmaku { id: string; bvid: string; time: number; mode: string; color: string; text: string }
interface SeedBanner { id: string; bvid: string; title: string; image: string; badge: string }
interface SeedHotSearch { rank: number; keyword: string; showName: string }

export interface Seed {
  channels: SeedChannel[];
  owners: SeedOwner[];
  videos: SeedVideo[];
  comments: SeedComment[];
  danmaku: SeedDanmaku[];
  banners: SeedBanner[];
  hotSearches: SeedHotSearch[];
}

export function readSeedFile(): Seed {
  if (!fs.existsSync(SEED_FILE)) {
    throw new Error(
      `缺少种子数据 ${SEED_FILE}，请先运行: npm run seed （联网抓取 B 站公开数据与真实图片）`,
    );
  }
  return JSON.parse(fs.readFileSync(SEED_FILE, 'utf8')) as Seed;
}

/** 把 seed.json 写入内容表（整体事务）。 */
export function loadSeed(db: DatabaseSync) {
  const seed = readSeedFile();

  const insertChannel = db.prepare(
    'INSERT INTO channels (id, name, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)',
  );
  const insertOwner = db.prepare(
    'INSERT INTO owners (mid, name, face, sign, fans, video_count, level) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  const insertVideo = db.prepare(`
    INSERT INTO videos (
      bvid, aid, cid, title, description, cover, play_url, duration, pubdate, channel_id,
      partition_name, owner_mid, view_count, danmaku_count, reply_count, favorite_count,
      coin_count, share_count, like_count, copyright, pub_location, width, height, hot_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertTag = db.prepare('INSERT INTO video_tags (bvid, tag) VALUES (?, ?)');
  const insertComment = db.prepare(
    'INSERT INTO comments (id, bvid, mid, content, like_count, reply_count, ctime) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  const insertDanmaku = db.prepare(
    'INSERT INTO danmaku (id, bvid, time_sec, mode, color, content) VALUES (?, ?, ?, ?, ?, ?)',
  );
  const insertBanner = db.prepare(
    'INSERT INTO banners (id, bvid, title, image, badge) VALUES (?, ?, ?, ?, ?)',
  );
  const insertHot = db.prepare(
    'INSERT INTO hot_searches (rank_no, keyword, show_name) VALUES (?, ?, ?)',
  );

  db.exec('BEGIN');
  try {
    seed.channels.forEach((c, i) => insertChannel.run(c.id, c.name, c.icon, c.color, i));
    for (const o of seed.owners) {
      insertOwner.run(o.mid, o.name, o.face, o.sign ?? '', o.fans, o.videoCount, o.level);
    }
    const knownOwners = new Set(seed.owners.map((o) => o.mid));
    const knownChannels = new Set(seed.channels.map((c) => c.id));
    const insertedVideos = new Set<string>();
    for (const v of seed.videos) {
      if (!knownOwners.has(v.ownerMid) || !knownChannels.has(v.channelId)) continue;
      insertVideo.run(
        v.bvid, v.aid, v.cid, v.title, v.desc ?? '', v.cover, v.playUrl, v.duration, v.pubdate,
        v.channelId, v.partitionName, v.ownerMid, v.view, v.danmaku, v.reply, v.favorite,
        v.coin, v.share, v.like, v.copyright, v.pubLocation, v.width, v.height, v.hotScore,
      );
      insertedVideos.add(v.bvid);
      for (const tag of new Set(v.tags)) insertTag.run(v.bvid, tag);
    }
    for (const c of seed.comments) {
      if (!insertedVideos.has(c.bvid) || !knownOwners.has(c.mid)) continue;
      insertComment.run(c.id, c.bvid, c.mid, c.content, c.like, c.reply_count, c.ctime);
    }
    for (const d of seed.danmaku) {
      if (!insertedVideos.has(d.bvid)) continue;
      insertDanmaku.run(d.id, d.bvid, d.time, d.mode, d.color, d.text);
    }
    for (const b of seed.banners) {
      if (!insertedVideos.has(b.bvid)) continue;
      insertBanner.run(b.id, b.bvid, b.title, b.image, b.badge);
    }
    for (const h of seed.hotSearches) insertHot.run(h.rank, h.keyword, h.showName);
    db.exec('COMMIT');
    return {
      videos: insertedVideos.size,
      owners: seed.owners.length,
      comments: seed.comments.length,
      danmaku: seed.danmaku.length,
    };
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
