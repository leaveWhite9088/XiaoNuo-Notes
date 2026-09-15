/** 观看历史：进入播放页时写入 localStorage，顶栏「历史」面板读取。 */
import type { VideoCardData, VideoDetail } from '../types';

const KEY = 'bili-clone:watch-history';
const MAX = 12;

export interface HistoryEntry {
  bvid: string;
  title: string;
  cover: string;
  upName: string;
  viewedAt: number;
}

export function readWatchHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function pushWatchHistory(video: VideoDetail | VideoCardData): HistoryEntry[] {
  const entry: HistoryEntry = {
    bvid: video.bvid,
    title: video.title,
    cover: video.cover,
    upName: video.up.name,
    viewedAt: Date.now(),
  };
  const next = [entry, ...readWatchHistory().filter((item) => item.bvid !== entry.bvid)].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('bili:history-change'));
  return next;
}
