/** 用户本地状态（Pinia store）持久化冒烟测试。
 *  store 依赖 localStorage，node 环境没有，测试内用内存实现替换。
 *  运行：npm --prefix frontend test */
import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useUserStore } from './user';

const KEY = 'bili-clone-user-v1';

class MemoryStorage {
  constructor() {
    this.map = new Map();
  }
  getItem(k) {
    return this.map.has(k) ? this.map.get(k) : null;
  }
  setItem(k, v) {
    this.map.set(k, String(v));
  }
  removeItem(k) {
    this.map.delete(k);
  }
}

const mkVideo = (bvid, title = '测试视频') => ({
  bvid,
  title,
  cover: `/media/covers/${bvid}.webp`,
  duration: 100,
  owner: { mid: 42, name: '测试UP' },
  stat: { view: 12345, danmaku: 6 },
});

let storage;
beforeEach(() => {
  storage = new MemoryStorage();
  globalThis.localStorage = storage;
  setActivePinia(createPinia());
});

describe('观看历史', () => {
  it('记录去重、最新在前', () => {
    const s = useUserStore();
    s.recordHistory(mkVideo('BV1'));
    s.recordHistory(mkVideo('BV2'));
    s.recordHistory(mkVideo('BV1'));
    expect(s.history.map((h) => h.bvid)).toEqual(['BV1', 'BV2']);
  });

  it('上限 50 条', () => {
    const s = useUserStore();
    for (let i = 0; i < 55; i++) s.recordHistory(mkVideo(`BV${i}`));
    expect(s.history.length).toBe(50);
    expect(s.history[0].bvid).toBe('BV54');
  });
});

describe('稍后再看与收藏', () => {
  it('toggle 语义与存在判断', () => {
    const s = useUserStore();
    expect(s.toggleWatchLater(mkVideo('BV1'))).toBe(true);
    expect(s.hasWatchLater('BV1')).toBe(true);
    expect(s.toggleWatchLater(mkVideo('BV1'))).toBe(false);
    expect(s.hasWatchLater('BV1')).toBe(false);
    expect(s.toggleFavorite(mkVideo('BV2'))).toBe(true);
    expect(s.hasFavorite('BV2')).toBe(true);
  });
});

describe('点赞投币关注', () => {
  it('投币累加、点赞与关注可回退', () => {
    const s = useUserStore();
    s.addCoins('BV1', 1);
    s.addCoins('BV1', 2);
    expect(s.coins['BV1']).toBe(3);
    expect(s.toggleLike('BV1')).toBe(true);
    expect(s.toggleLike('BV1')).toBe(false);
    expect(s.toggleFollow(42)).toBe(true);
    expect(s.toggleFollow(42)).toBe(false);
  });
});

describe('持久化往返', () => {
  it('写入 localStorage 后，新 store 实例能读到同样的状态', () => {
    const s = useUserStore();
    s.recordHistory(mkVideo('BV1'));
    s.toggleFavorite(mkVideo('BV1'));
    s.addCoins('BV1', 2);
    s.pushSearch('纪录片');
    s.addLocalComment('BV1', '本地评论内容');

    const saved = JSON.parse(storage.getItem(KEY));
    expect(saved.history[0].bvid).toBe('BV1');
    expect(saved.favorites.length).toBe(1);
    expect(saved.coins['BV1']).toBe(2);

    // 模拟刷新页面：新 pinia + 同一 localStorage
    setActivePinia(createPinia());
    const s2 = useUserStore();
    expect(s2.history[0].bvid).toBe('BV1');
    expect(s2.hasFavorite('BV1')).toBe(true);
    expect(s2.coins['BV1']).toBe(2);
    expect(s2.searchHistory).toEqual(['纪录片']);
    expect(s2.localComments['BV1'][0].content).toBe('本地评论内容');
  });
});

describe('搜索历史', () => {
  it('去重置顶、上限 10、可单条删除', () => {
    const s = useUserStore();
    for (let i = 0; i < 12; i++) s.pushSearch(`词${i}`);
    s.pushSearch('词5');
    expect(s.searchHistory.length).toBe(10);
    expect(s.searchHistory[0]).toBe('词5');
    s.removeSearch('词5');
    expect(s.searchHistory.includes('词5')).toBe(false);
  });
});

describe('本地评论', () => {
  it('发布与点赞计数', () => {
    const s = useUserStore();
    s.addLocalComment('BV1', '第一条');
    s.addLocalComment('BV1', '第二条');
    expect(s.localComments['BV1'].length).toBe(2);
    expect(s.localComments['BV1'][0].content).toBe('第二条');
    const id = s.localComments['BV1'][0].id;
    s.toggleCommentLike('BV1', id);
    expect(s.localComments['BV1'][0].likes).toBe(1);
    s.toggleCommentLike('BV1', id);
    expect(s.localComments['BV1'][0].likes).toBe(0);
  });
});
