import { ok, parsePaging } from '../middleware/index.js';
import { videoService } from '../services/videoService.js';
/** 控制器层：视频详情 / 播放 / 弹幕 / 评论 / 互动 */
export const videoController = {
    detail(req, res) {
        ok(res, videoService.detail(req.params.bvid));
    },
    play(req, res) {
        ok(res, videoService.playInfo(req.params.bvid));
    },
    danmaku(req, res) {
        ok(res, videoService.danmaku(req.params.bvid));
    },
    createDanmaku(req, res) {
        const text = String(req.body?.text ?? '');
        const timeMs = Number(req.body?.timeMs ?? 0);
        const color = String(req.body?.color ?? '#ffffff');
        ok(res, videoService.addDanmaku(req.params.bvid, text, timeMs, color), '弹幕发送成功');
    },
    comments(req, res) {
        const { page, pageSize } = parsePaging(req.query, 20, 50);
        ok(res, videoService.comments(req.params.bvid, page, pageSize));
    },
    createComment(req, res) {
        const content = String(req.body?.content ?? '');
        const author = String(req.body?.author ?? '我');
        ok(res, videoService.addComment(req.params.bvid, content, author), '评论成功');
    },
    likeComment(req, res) {
        ok(res, videoService.likeComment(Number(req.params.id)));
    },
    toggle(req, res) {
        const field = req.params.field;
        if (!['liked', 'coined', 'faved', 'followed'].includes(field)) {
            res.status(400).json({ code: 400, message: '不支持的互动类型', data: null });
            return;
        }
        ok(res, videoService.toggle(req.params.bvid, field));
    },
};
//# sourceMappingURL=videoController.js.map