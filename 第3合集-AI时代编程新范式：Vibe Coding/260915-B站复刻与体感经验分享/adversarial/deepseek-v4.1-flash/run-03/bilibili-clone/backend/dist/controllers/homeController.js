import { ok, parsePaging } from '../middleware/index.js';
import { homeService } from '../services/homeService.js';
/** 控制器层：只做参数解析与响应封装，数据访问全部下沉到 service / repository */
export const homeController = {
    overview(_req, res) {
        ok(res, homeService.overview());
    },
    feed(req, res) {
        const { page, pageSize } = parsePaging(req.query);
        const category = String(req.query.category ?? 'all');
        const sort = String(req.query.sort ?? 'default');
        ok(res, homeService.feed({ category, sort, page, pageSize }));
    },
    sidebar(req, res) {
        const category = String(req.query.category ?? 'all');
        ok(res, homeService.sidebar(category, Number(req.query.limit ?? 10)));
    },
    categories(_req, res) {
        ok(res, homeService.categoriesWithCount());
    },
    /** 顶栏「收藏」面板数据（真实收藏记录） */
    favorites(req, res) {
        ok(res, homeService.favorites(Number(req.query.limit ?? 12)));
    },
    /** 顶栏「动态」面板数据（已关注 UP 主的最新投稿） */
    dynamics(req, res) {
        ok(res, homeService.followingUpdates(Number(req.query.limit ?? 8)));
    },
    /** 顶栏「消息」面板数据（演示数据，非真实站内信） */
    notifications(_req, res) {
        ok(res, homeService.notifications());
    },
    /** 顶栏「创作中心」面板数据（本站真实行为统计） */
    creatorStats(_req, res) {
        ok(res, {
            ...homeService.interactionSummary(),
            note: 'Demo 未接入投稿能力，以下为你在本站的真实行为统计',
        });
    },
};
//# sourceMappingURL=homeController.js.map