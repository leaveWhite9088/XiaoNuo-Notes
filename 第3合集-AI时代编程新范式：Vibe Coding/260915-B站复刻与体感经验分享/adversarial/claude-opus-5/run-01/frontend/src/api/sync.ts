import type { QueryClient } from '@tanstack/react-query';
import type { StatSnapshot, VideoDetail, VideoStat } from '../types';

/** 后端返回的原始统计行 -> 前端 VideoStat */
export function toVideoStat(snapshot: StatSnapshot, prev: VideoStat): VideoStat {
  return {
    ...prev,
    view: snapshot.view_count,
    like: snapshot.like_count,
    coin: snapshot.coin_count,
    favorite: snapshot.favorite_count,
    share: snapshot.share_count,
    danmaku: snapshot.danmaku_count,
    reply: snapshot.reply_count,
  };
}

/**
 * 点赞 / 投币 / 收藏 / 稍后再看 / 三连成功后：
 * 1. 立即把详情缓存改成服务端返回的最新状态（返回页面时不会看到过期按钮态）
 * 2. 让所有携带这条视频的列表与个人面板失效，下次展示时重新拉取
 */
export function syncVideoInteraction(
  queryClient: QueryClient,
  bvid: string,
  patch: { actions?: Partial<VideoDetail['actions']>; stat?: StatSnapshot; watchLater?: boolean },
) {
  queryClient.setQueryData<VideoDetail>(['video', bvid], (old) => {
    if (!old) return old;
    return {
      ...old,
      actions: { ...old.actions, ...(patch.actions ?? {}) },
      stat: patch.stat ? toVideoStat(patch.stat, old.stat) : old.stat,
      watchLater: patch.watchLater ?? old.watchLater,
    };
  });
  for (const key of [['feed'], ['search'], ['bootstrap'], ['related'], ['up-videos'], ['me']]) {
    queryClient.invalidateQueries({ queryKey: key });
  }
}
