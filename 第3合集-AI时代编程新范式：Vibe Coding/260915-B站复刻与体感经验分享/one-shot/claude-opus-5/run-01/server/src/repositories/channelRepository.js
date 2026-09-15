/** 分区/导航相关的仓储访问。 */
import { channels, feedSorts, morePanel, primaryNav, recommendChannel } from '../data/channels.js';
import { hotSearches, searchPlaceholders } from '../data/content.js';

export function listNavChannels() {
  return [recommendChannel, ...channels];
}

export function listChannels() {
  return channels;
}

export function findChannel(id) {
  if (id === 'all') return recommendChannel;
  return channels.find((c) => c.id === id) ?? null;
}

export function getNavConfig() {
  return {
    primaryNav,
    channels: listNavChannels(),
    morePanel,
    sorts: feedSorts,
    hotSearches,
    searchPlaceholders,
  };
}
