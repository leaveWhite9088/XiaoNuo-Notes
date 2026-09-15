import type { CommentRow, DanmakuRow, VideoCard, VideoRow } from '../types.js';
import { formatCount, formatDate, formatDuration, timeAgo } from '../utils/format.js';

/** 领域模型 -> 前端 DTO 的映射层，保证接口契约集中可维护 */

export interface VideoCardDto {
  bvid: string;
  title: string;
  cover: string;
  videoUrl: string;
  duration: number;
  durationText: string;
  /** 真实可播放片长（秒）；与 duration（B 站原始时长）不同 */
  clipDuration: number;
  pubdate: number;
  pubdateText: string;
  timeAgo: string;
  tname: string;
  categorySlug: string;
  description: string;
  play: number;
  playText: string;
  danmaku: number;
  danmakuText: string;
  like: number;
  likeText: string;
  coin: number;
  favorite: number;
  reply: number;
  share: number;
  owner: { mid: number; name: string; avatar: string };
}

export function toVideoCardDto(row: VideoCard | (VideoRow & Partial<VideoCard>)): VideoCardDto {
  const owner_name = (row as VideoCard).owner_name ?? '匿名UP主';
  const owner_avatar = (row as VideoCard).owner_avatar ?? '';
  return {
    bvid: row.bvid,
    title: row.title,
    cover: row.cover,
    videoUrl: row.video_url,
    duration: row.duration,
    durationText: formatDuration(row.duration),
    clipDuration: row.clip_duration ?? 0,
    pubdate: row.pubdate,
    pubdateText: formatDate(row.pubdate),
    timeAgo: timeAgo(row.pubdate),
    tname: row.tname,
    categorySlug: row.category_slug,
    description: row.description,
    play: row.play,
    playText: formatCount(row.play),
    danmaku: row.danmaku,
    danmakuText: formatCount(row.danmaku),
    like: row.like_count,
    likeText: formatCount(row.like_count),
    coin: row.coin,
    favorite: row.favorite,
    reply: row.reply,
    share: row.share,
    owner: { mid: row.owner_mid, name: owner_name, avatar: owner_avatar },
  };
}

export function toCommentDto(row: CommentRow) {
  return {
    id: row.id,
    author: row.author,
    avatar: row.avatar,
    content: row.content,
    like: row.like_count,
    likeText: formatCount(row.like_count),
    createdAt: row.created_at,
    timeAgo: timeAgo(row.created_at),
  };
}

export function toDanmakuDto(row: DanmakuRow) {
  return { time: row.time_ms / 1000, text: row.text, color: row.color, mode: row.mode };
}
