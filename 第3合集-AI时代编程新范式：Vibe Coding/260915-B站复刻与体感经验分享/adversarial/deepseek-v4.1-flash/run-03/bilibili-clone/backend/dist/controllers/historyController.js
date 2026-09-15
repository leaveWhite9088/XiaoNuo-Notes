import { ok } from '../middleware/index.js';
import { historyService } from '../services/historyService.js';
/** 控制器层：观看历史 */
export const historyController = {
    list(_req, res) {
        ok(res, historyService.list());
    },
    record(req, res) {
        const bvid = String(req.body?.bvid ?? '');
        const progress = Number(req.body?.progress ?? 0);
        ok(res, historyService.record(bvid, progress));
    },
    clear(_req, res) {
        ok(res, historyService.clear());
    },
};
//# sourceMappingURL=historyController.js.map