import { formatCount, formatDate, formatDuration, timeAgo } from '../utils/format.js';
export function toVideoCardDto(row) {
    const owner_name = row.owner_name ?? '匿名UP主';
    const owner_avatar = row.owner_avatar ?? '';
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
export function toCommentDto(row) {
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
export function toDanmakuDto(row) {
    return { time: row.time_ms / 1000, text: row.text, color: row.color, mode: row.mode };
}
//# sourceMappingURL=mappers.js.map