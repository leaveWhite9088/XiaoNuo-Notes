import { interactionRepository } from '../repositories/interactionRepository.js';
import { metaRepository } from '../repositories/metaRepository.js';
import { videoRepository } from '../repositories/videoRepository.js';
import { toVideoCardDto } from './mappers.js';
/** 业务层：首页聚合数据 */
export const homeService = {
    /** 首页首屏一次性返回：轮播 + 分区 + 热搜（减少请求往返） */
    overview() {
        return {
            banners: metaRepository.banners().map((b) => ({
                id: b.id,
                title: b.title,
                subtitle: b.subtitle,
                image: b.image,
                link: b.link,
            })),
            categories: metaRepository.allCategories().map((c) => ({
                slug: c.slug,
                name: c.name,
                icon: c.icon,
            })),
            hotSearch: metaRepository.hotSearches(10),
            totalVideos: videoRepository.totalCount(),
        };
    },
    /** 分区列表（含每个分区的真实视频数） */
    categoriesWithCount() {
        return metaRepository.allCategories().map((c) => ({
            slug: c.slug,
            name: c.name,
            icon: c.icon,
            count: videoRepository.countByCategory(c.slug),
        }));
    },
    /** 首页视频流（支持分区 / 排序 / 分页，用于分类筛选与无限滚动） */
    feed(params) {
        const paged = videoRepository.findFeed({
            category: params.category ?? 'all',
            sort: params.sort ?? 'default',
            page: params.page ?? 1,
            pageSize: params.pageSize ?? 24,
        });
        return { ...paged, list: paged.list.map(toVideoCardDto) };
    },
    /** 右侧栏：排行榜 + 在线人数（在线人数为演示数值） */
    sidebar(category = 'all', limit = 10) {
        const ranking = videoRepository.ranking(limit, category);
        return {
            ranking: ranking.map((v, i) => ({ ...toVideoCardDto(v), rank: i + 1 })),
            online: 1286 + ((ranking.length * 37) % 900),
        };
    },
    /** 顶栏「收藏」面板：当前用户收藏的真实视频 */
    favorites(limit = 12) {
        const list = videoRepository.findFavorites(limit);
        return {
            list: list.map(toVideoCardDto),
            total: this.interactionSummary().faved,
        };
    },
    /** 顶栏「动态」面板：已关注 UP 主的最新投稿（未关注时回退到全站最新） */
    followingUpdates(limit = 8) {
        const followed = videoRepository.findFollowingLatest(limit);
        const list = followed.length ? followed : videoRepository.findFeed({ sort: 'newest', pageSize: limit }).list;
        return {
            list: list.map(toVideoCardDto),
            source: followed.length ? 'following' : 'latest',
        };
    },
    /**
     * 顶栏「消息」面板：基于真实互动数据生成的消息条目
     * （没有账号体系，因此不是真正的站内信，属于演示数据，接口中已注明）
     */
    notifications() {
        const summary = this.interactionSummary();
        const faved = videoRepository.findFavorites(3);
        const items = [];
        if (summary.faved > 0) {
            items.push({
                id: 'fav',
                type: '收藏',
                title: `你收藏的 ${summary.faved} 个视频有新动态`,
                desc: '收藏夹更新提醒（演示数据）',
                bvid: faved[0]?.bvid,
            });
        }
        if (summary.liked > 0) {
            items.push({
                id: 'like',
                type: '点赞',
                title: `你点赞了 ${summary.liked} 个视频`,
                desc: '感谢你的喜欢（演示数据）',
            });
        }
        items.push({
            id: 'sys',
            type: '系统',
            title: '欢迎来到 bilibili 首页复刻 Demo',
            desc: '本站为分层架构演示项目，数据来自 B 站公开接口快照',
        });
        return { items, unread: items.length };
    },
    /** 互动统计（收藏 / 点赞 / 投币 / 关注 / 观看历史），全部来自真实落库数据 */
    interactionSummary() {
        return interactionRepository.summary();
    },
};
//# sourceMappingURL=homeService.js.map