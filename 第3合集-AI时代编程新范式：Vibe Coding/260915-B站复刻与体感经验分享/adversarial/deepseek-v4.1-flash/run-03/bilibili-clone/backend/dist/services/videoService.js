import { commentRepository, danmakuRepository } from '../repositories/commentRepository.js';
import { interactionRepository } from '../repositories/interactionRepository.js';
import { metaRepository } from '../repositories/metaRepository.js';
import { videoRepository } from '../repositories/videoRepository.js';
import { HttpError } from '../utils/HttpError.js';
import { toCommentDto, toDanmakuDto, toVideoCardDto } from './mappers.js';
/** 业务层：视频详情 / 播放 / 互动 */
export const videoService = {
    /** 详情页首屏：视频 + UP主 + 标签 + 互动状态 + 关联推荐 */
    detail(bvid) {
        const row = videoRepository.findByBvid(bvid);
        if (!row)
            throw new HttpError(404, '视频不存在或已失效');
        const owner = metaRepository.ownerByMid(row.owner_mid);
        const interaction = interactionRepository.get(bvid);
        const related = videoRepository.findRelated(bvid, row.category_slug, 12);
        return {
            video: toVideoCardDto(row),
            owner: {
                mid: row.owner_mid,
                name: row.owner_name || owner?.name || '匿名UP主',
                avatar: row.owner_avatar || owner?.avatar || '',
                sign: owner?.sign ?? '这个人很神秘，什么都没有写',
                fans: owner?.fans ?? 0,
                videos: owner?.videos ?? 0,
            },
            tags: videoRepository.tags(bvid),
            interaction: {
                liked: !!interaction.liked,
                coined: !!interaction.coined,
                faved: !!interaction.faved,
                followed: !!interaction.followed,
            },
            related: related.map(toVideoCardDto),
            danmakuCount: row.danmaku,
        };
    },
    /** 播放地址（本地真实 mp4 文件，可被 <video> 直接播放） */
    playInfo(bvid) {
        const row = videoRepository.findByBvid(bvid);
        if (!row)
            throw new HttpError(404, '视频不存在或已失效');
        videoRepository.addPlayCount(bvid, 1);
        return { bvid, url: row.video_url, cover: row.cover, title: row.title };
    },
    danmaku(bvid) {
        return danmakuRepository.listByBvid(bvid).map(toDanmakuDto);
    },
    comments(bvid, page = 1, pageSize = 20) {
        const offset = (page - 1) * pageSize;
        const list = commentRepository.listByBvid(bvid, pageSize, offset);
        return {
            list: list.map(toCommentDto),
            total: commentRepository.countByBvid(bvid),
            page,
            pageSize,
            hasMore: offset + list.length < commentRepository.countByBvid(bvid),
        };
    },
    addComment(bvid, content, author = '我') {
        const row = videoRepository.findByBvid(bvid);
        if (!row)
            throw new HttpError(404, '视频不存在或已失效');
        const text = content.trim();
        if (!text)
            throw new HttpError(400, '评论内容不能为空');
        if (text.length > 300)
            throw new HttpError(400, '评论最多 300 字');
        const created = commentRepository.insert({
            bvid,
            author,
            avatar: '',
            content: text,
            like_count: 0,
            source: 'user',
            created_at: Math.floor(Date.now() / 1000),
        });
        return toCommentDto(created);
    },
    /**
     * 发送弹幕：写入 SQLite 并立即回显。
     * timeMs 必须是播放器当前进度 —— 会被裁剪到演示片长内，
     * 保证刷新后弹幕在「同一时点」出现。
     */
    addDanmaku(bvid, text, timeMs, color = '#ffffff') {
        const row = videoRepository.findByBvid(bvid);
        if (!row)
            throw new HttpError(404, '视频不存在或已失效');
        const content = text.trim();
        if (!content)
            throw new HttpError(400, '弹幕内容不能为空');
        if (content.length > 50)
            throw new HttpError(400, '弹幕最多 50 字');
        if (!Number.isFinite(timeMs))
            throw new HttpError(400, '弹幕时间点不合法');
        const clipMs = Math.round((row.clip_duration || 0) * 1000);
        const maxMs = clipMs > 0 ? Math.max(0, clipMs - 350) : Math.max(0, Math.round(timeMs));
        const t = Math.min(maxMs, Math.max(0, Math.round(timeMs)));
        danmakuRepository.insertMany([
            { bvid, time_ms: t, text: content, color, mode: 1, source: 'user' },
        ]);
        return { time: t / 1000, text: content, color, mode: 1, clipDuration: row.clip_duration };
    },
    likeComment(id) {
        commentRepository.like(id);
        return { id, ok: true };
    },
    /** 点赞 / 投币 / 收藏 / 关注 切换（单用户演示态） */
    toggle(bvid, field) {
        const row = videoRepository.findByBvid(bvid);
        if (!row)
            throw new HttpError(404, '视频不存在或已失效');
        const interaction = interactionRepository.toggle(bvid, field);
        return {
            liked: !!interaction.liked,
            coined: !!interaction.coined,
            faved: !!interaction.faved,
            followed: !!interaction.followed,
        };
    },
};
//# sourceMappingURL=videoService.js.map