import { FEED_PAGE_SIZE } from '../config.js';
import { catalogRepo } from '../repositories/catalogRepo.js';
import { videoRepo } from '../repositories/videoRepo.js';
import { userRepo } from '../repositories/userRepo.js';
import type { Banner, Channel, FeedSort, Paged, VideoCard, VideoDetail } from '../types.js';
import { HttpError } from '../utils/httpError.js';

const SORTS: FeedSort[] = ['recommend', 'hot', 'latest', 'danmaku'];

export const feedService = {
  channels(): Channel[] {
    return catalogRepo.channels();
  },

  banners(): Banner[] {
    return catalogRepo.banners();
  },

  /** 轮播右侧 2x2 精选：热度最高且不与轮播重复的视频 */
  featured(limit: number): VideoCard[] {
    const bannerIds = new Set(catalogRepo.banners().map((b) => b.bvid));
    return videoRepo
      .listFeed({ channelId: null, sort: 'hot', page: 1, pageSize: limit + bannerIds.size })
      .filter((v) => !bannerIds.has(v.bvid))
      .slice(0, limit);
  },

  feed(params: {
    channelId?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
    seed?: number;
  }): Paged<VideoCard> {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(60, Math.max(1, Number(params.pageSize) || FEED_PAGE_SIZE));
    const sort = (SORTS.includes(params.sort as FeedSort) ? params.sort : 'recommend') as FeedSort;

    let channelId: string | null = null;
    if (params.channelId && params.channelId !== 'all') {
      if (!catalogRepo.channelExists(params.channelId)) {
        throw new HttpError(404, `未知分区: ${params.channelId}`);
      }
      channelId = params.channelId;
    }

    const total = videoRepo.countFeed(channelId);
    const items = videoRepo.listFeed({
      channelId,
      sort,
      page,
      pageSize,
      seed: Number(params.seed) || 0,
    });
    return { items, page, pageSize, total, hasMore: page * pageSize < total };
  },

  detail(bvid: string): VideoDetail {
    const detail = videoRepo.detail(bvid, userRepo.actionsOf(bvid));
    if (!detail) throw new HttpError(404, `视频不存在: ${bvid}`);
    return detail;
  },

  /** 播放页打开时记一次播放量与历史（B 站的 view 计数在此简化为进入即 +1），不动已保存的进度 */
  registerPlay(bvid: string) {
    if (!videoRepo.findByBvid(bvid)) throw new HttpError(404, `视频不存在: ${bvid}`);
    videoRepo.bumpStat(bvid, 'view_count', 1);
    userRepo.recordPlay(bvid);
    return videoRepo.statOf(bvid);
  },

  /** 离开播放页时上报观看进度，只写历史，不累加播放量 */
  saveProgress(bvid: string, progress: number) {
    if (!videoRepo.findByBvid(bvid)) throw new HttpError(404, `视频不存在: ${bvid}`);
    userRepo.saveProgress(bvid, progress);
    return { bvid, progress };
  },

  related(bvid: string, limit = 12): VideoCard[] {
    if (!videoRepo.findByBvid(bvid)) throw new HttpError(404, `视频不存在: ${bvid}`);
    return videoRepo.related(bvid, limit);
  },

  ownerVideos(mid: number, limit: number, excludeBvid?: string): VideoCard[] {
    return videoRepo.byOwner(mid, limit, excludeBvid);
  },
};
