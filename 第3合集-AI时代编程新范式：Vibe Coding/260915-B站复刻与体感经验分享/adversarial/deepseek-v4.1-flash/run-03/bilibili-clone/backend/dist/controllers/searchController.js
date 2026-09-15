import { ok, parsePaging } from '../middleware/index.js';
import { searchService } from '../services/searchService.js';
/** 控制器层：搜索建议 / 搜索结果 / 热搜榜 */
export const searchController = {
    suggest(req, res) {
        const keyword = String(req.query.keyword ?? '');
        ok(res, searchService.suggest(keyword, 10));
    },
    search(req, res) {
        const keyword = String(req.query.keyword ?? '');
        const { page, pageSize } = parsePaging(req.query);
        const sort = String(req.query.sort ?? 'default');
        ok(res, searchService.search({ keyword, page, pageSize, sort }));
    },
    hot(_req, res) {
        ok(res, searchService.hot());
    },
};
//# sourceMappingURL=searchController.js.map