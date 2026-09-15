import type { Comment, Danmaku, Owner, VideoCard, VideoDetail } from '../types.js';

export type Row = Record<string, any>;

/** videos 表 + owners 表 join 后的公共字段列表 */
export const VIDEO_COLUMNS = `
  v.bvid, v.aid, v.cid, v.title, v.description, v.cover, v.play_url, v.duration, v.pubdate,
  v.channel_id, v.partition_name, v.view_count, v.danmaku_count, v.reply_count,
  v.favorite_count, v.coin_count, v.share_count, v.like_count, v.copyright,
  v.pub_location, v.width, v.height, v.hot_score,
  EXISTS (
    SELECT 1 FROM user_actions ua WHERE ua.bvid = v.bvid AND ua.action = 'watchlater' AND ua.value > 0
  ) AS watch_later,
  o.mid AS o_mid, o.name AS o_name, o.face AS o_face, o.sign AS o_sign,
  o.fans AS o_fans, o.video_count AS o_video_count, o.level AS o_level
`;

export function toOwner(row: Row): Owner {
  return {
    mid: Number(row.o_mid),
    name: String(row.o_name),
    face: String(row.o_face),
    sign: String(row.o_sign ?? ''),
    fans: Number(row.o_fans ?? 0),
    videoCount: Number(row.o_video_count ?? 0),
    level: Number(row.o_level ?? 1),
  };
}

export function toVideoCard(row: Row): VideoCard {
  return {
    bvid: String(row.bvid),
    title: String(row.title),
    cover: String(row.cover),
    duration: Number(row.duration),
    pubdate: Number(row.pubdate),
    channelId: String(row.channel_id),
    partitionName: String(row.partition_name),
    owner: toOwner(row),
    watchLater: Number(row.watch_later ?? 0) > 0,
    stat: {
      view: Number(row.view_count),
      danmaku: Number(row.danmaku_count),
      reply: Number(row.reply_count),
      favorite: Number(row.favorite_count),
      coin: Number(row.coin_count),
      share: Number(row.share_count),
      like: Number(row.like_count),
    },
  };
}

export function toVideoDetail(
  row: Row,
  tags: string[],
  actions: VideoDetail['actions'],
): VideoDetail {
  return {
    ...toVideoCard(row),
    aid: Number(row.aid),
    cid: Number(row.cid),
    desc: String(row.description ?? ''),
    playUrl: String(row.play_url),
    copyright: Number(row.copyright),
    pubLocation: String(row.pub_location ?? ''),
    width: Number(row.width),
    height: Number(row.height),
    tags,
    actions,
  };
}

export function toComment(row: Row): Comment {
  return {
    id: String(row.id),
    bvid: String(row.bvid),
    content: String(row.content),
    like: Number(row.like_count),
    replyCount: Number(row.reply_count),
    ctime: Number(row.ctime),
    user: {
      mid: Number(row.o_mid),
      name: String(row.o_name),
      face: String(row.o_face),
      level: Number(row.o_level ?? 1),
    },
  };
}

export function toDanmaku(row: Row): Danmaku {
  return {
    id: String(row.id),
    time: Number(row.time_sec),
    mode: String(row.mode),
    color: String(row.color),
    text: String(row.content),
  };
}
