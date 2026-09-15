import { historyRepository } from '../repositories/interactionRepository.js';
import { videoRepository } from '../repositories/videoRepository.js';
import { toVideoCardDto } from './mappers.js';
/** 业务层：观看历史 */
export const historyService = {
    list() {
        const entries = historyRepository.list(60);
        const videos = videoRepository.findManyByBvids(entries.map((e) => e.bvid));
        const byBvid = new Map(videos.map((v) => [v.bvid, v]));
        return entries
            .map((e) => {
            const v = byBvid.get(e.bvid);
            if (!v)
                return null;
            return {
                ...toVideoCardDto(v),
                progress: e.progress,
                watchedAt: e.watched_at,
            };
        })
            .filter((v) => v !== null);
    },
    record(bvid, progress = 0) {
        historyRepository.record(bvid, Math.min(1, Math.max(0, progress)));
        return { ok: true };
    },
    clear() {
        historyRepository.clear();
        return { ok: true };
    },
};
//# sourceMappingURL=historyService.js.map