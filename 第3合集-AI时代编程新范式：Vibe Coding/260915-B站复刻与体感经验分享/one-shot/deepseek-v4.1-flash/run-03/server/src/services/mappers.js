import { formatCount, formatDuration, formatRelativeTime, formatPlayCount } from '../utils/format.js';

/**
 * DTO 映射层：DB 原始行 -> 前端契约对象。
 * 保持前端不关心数据库命名，也避免各 view 重复拼装展示文案。
 */

export function toCategoryDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    icon: row.icon,
    accent: row.accent,
    intro: row.intro,
    rid: row.rid,
    isNav: Boolean(row.is_nav),
    isFilter: Boolean(row.is_filter),
  };
}

export function toVideoDTO(row) {
  if (!row) return null;
  return {
    bvid: row.bvid,
    aid: row.aid,
    cid: row.cid,
    title: row.title,
    description: row.description || '',
    cover: normalizeImage(row.cover),
    duration: row.duration,
    durationText: formatDuration(row.duration),
    tags: row.tags || [],
    category: row.category_slug
      ? { id: row.category_id, slug: row.category_slug, name: row.category_name }
      : null,
    owner: {
      mid: row.owner_mid,
      name: row.owner_name,
      face: normalizeImage(row.owner_face),
    },
    stats: {
      view: row.view,
      viewText: formatPlayCount(row.view),
      viewCount: formatCount(row.view),
      danmaku: row.danmaku,
      danmakuText: formatCount(row.danmaku),
      reply: row.reply,
      replyText: formatCount(row.reply),
      favorite: row.favorite,
      favoriteText: formatCount(row.favorite),
      coin: row.coin,
      coinText: formatCount(row.coin),
      share: row.share,
      like: row.like_count,
      likeText: formatCount(row.like_count),
      score: Number((row.score || 0).toFixed?.(2) ?? row.score ?? 0),
    },
    pubdate: row.pubdate,
    pubdateText: formatRelativeTime(row.pubdate),
    featured: Boolean(row.featured),
    /** true=可播放 / false=已知版权内容无播放地址 / null=未探测 */
    playable: row.playable === null || row.playable === undefined ? null : Boolean(row.playable),
  };
}

export function toVideoList(rows = []) {
  return rows.map(toVideoDTO);
}

export function toCommentDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    bvid: row.bvid,
    user: { mid: row.mid, name: row.user_name, face: normalizeImage(row.user_face) },
    content: row.content,
    likeCount: row.like_count,
    likeText: formatCount(row.like_count),
    replyCount: row.reply_count,
    location: row.location,
    ctime: row.ctime,
    ctimeText: formatRelativeTime(row.ctime),
  };
}

export function toBannerDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    image: normalizeImage(row.image),
    link: row.link,
    bvid: row.bvid,
    badge: row.badge,
  };
}

export function toUserDTO(row) {
  if (!row) return null;
  return {
    mid: row.mid,
    name: row.name,
    face: normalizeImage(row.face),
    sign: row.sign || '',
    follower: row.follower,
    followerText: formatCount(row.follower),
    level: row.level,
    vip: Boolean(row.vip),
    archiveCount: row.archive_count,
    likes: row.likes,
  };
}

/** 统一补齐协议头：//i0.hdslb.com -> https://i0.hdslb.com */
export function normalizeImage(url) {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  return url.replace(/^http:/, 'https:');
}

/** 版权内容（番剧/国创/综艺）DTO */
export function toPgcDTO(row) {
  if (!row) return null;
  return {
    seasonId: row.season_id,
    title: row.title,
    cover: normalizeImage(row.cover),
    horizontalCover: normalizeImage(row.horizontal_cover),
    rating: row.rating,
    playText: row.play_text,
    badge: row.badge,
    badgeColor: row.badge_color,
    updateInfo: row.update_info,
    url: row.url,
    rank: row.rank,
  };
}

/** 分页响应包装 */
export function toPage({ list, total, page, pageSize }) {
  return {
    list,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  };
}

export default {
  toCategoryDTO, toVideoDTO, toVideoList, toCommentDTO, toBannerDTO, toUserDTO,
  toPgcDTO, normalizeImage, toPage,
};
