import { catalogRepo } from '../repositories/catalogRepo.js';
import { userRepo, type UserAction } from '../repositories/userRepo.js';
import { videoRepo } from '../repositories/videoRepo.js';
import { HttpError } from '../utils/httpError.js';

const STAT_COLUMN = {
  like: 'like_count',
  coin: 'coin_count',
  favorite: 'favorite_count',
} as const;

export const interactionService = {
  comments(bvid: string, sort: string) {
    if (!videoRepo.findByBvid(bvid)) throw new HttpError(404, `视频不存在: ${bvid}`);
    return catalogRepo.comments(bvid, sort === 'time' ? 'time' : 'hot');
  },

  danmaku(bvid: string) {
    if (!videoRepo.findByBvid(bvid)) throw new HttpError(404, `视频不存在: ${bvid}`);
    return catalogRepo.danmaku(bvid);
  },

  /** 点赞 / 投币 / 收藏 / 稍后再看 的开关式切换，同时同步统计数字 */
  toggle(bvid: string, action: UserAction) {
    if (!videoRepo.findByBvid(bvid)) throw new HttpError(404, `视频不存在: ${bvid}`);
    const next = !userRepo.isActive(bvid, action);
    userRepo.setActive(bvid, action, next);
    if (action !== 'watchlater') {
      videoRepo.bumpStat(bvid, STAT_COLUMN[action], next ? 1 : -1);
    }
    return { bvid, action, active: next, stat: videoRepo.statOf(bvid) };
  },

  /** 三连：点赞 + 投币 + 收藏 一次性打开 */
  tripleAction(bvid: string) {
    if (!videoRepo.findByBvid(bvid)) throw new HttpError(404, `视频不存在: ${bvid}`);
    for (const action of ['like', 'coin', 'favorite'] as const) {
      if (!userRepo.isActive(bvid, action)) {
        userRepo.setActive(bvid, action, true);
        videoRepo.bumpStat(bvid, STAT_COLUMN[action], 1);
      }
    }
    return { bvid, actions: userRepo.actionsOf(bvid), stat: videoRepo.statOf(bvid) };
  },

  watchLater(limit = 20) {
    return videoRepo.byBvids(userRepo.listActive('watchlater', limit));
  },

  favorites(limit = 20) {
    return videoRepo.byBvids(userRepo.listActive('favorite', limit));
  },

  history(limit = 20) {
    const rows = userRepo.history(limit);
    const videos = videoRepo.byBvids(rows.map((r) => r.bvid));
    const progress = new Map(rows.map((r) => [r.bvid, r]));
    return videos.map((v) => ({
      ...v,
      progress: progress.get(v.bvid)?.progress ?? 0,
      viewedAt: progress.get(v.bvid)?.vtime ?? 0,
    }));
  },
};
