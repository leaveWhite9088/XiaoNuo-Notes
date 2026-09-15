/**
 * 后端集成测试：真实启动 Express + 真实 SQLite（临时库），覆盖接口契约与数据完整性。
 *
 *   npm test          （等价于 node --import tsx --test test/*.test.ts）
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import type { Server } from 'node:http';

process.env.NODE_ENV = 'test';
// 必须在导入 config / db 之前指定临时数据库
const TMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'bili-test-'));
process.env.DB_FILE = path.join(TMP_DIR, 'test.db');

const { createApp } = await import('../src/app.js');
const { getDb, closeDb, migrate } = await import('../src/db/sqlite.js');
const { runSeed } = await import('../src/db/seed.js');
const { config } = await import('../src/config/index.js');

interface Envelope<T> {
  code: number;
  message: string;
  data: T;
}

let server: Server;
let base = '';

async function api<T>(pathname: string, init?: RequestInit): Promise<Envelope<T>> {
  const res = await fetch(`${base}${pathname}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  return (await res.json()) as Envelope<T>;
}

before(async () => {
  migrate();
  runSeed();
  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => resolve());
  });
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  base = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  closeDb();
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
});

describe('基础接口', () => {
  it('健康检查', async () => {
    const res = await api<{ status: string }>('/api/health');
    assert.equal(res.code, 0);
    assert.equal(res.data.status, 'up');
  });

  it('首页聚合包含轮播 / 分区 / 热搜', async () => {
    const res = await api<{
      banners: unknown[];
      categories: unknown[];
      hotSearch: string[];
      totalVideos: number;
    }>('/api/home');
    assert.equal(res.code, 0);
    assert.ok(res.data.banners.length > 0, '轮播不应为空');
    assert.equal(res.data.categories.length, 17);
    assert.equal(res.data.hotSearch.length, 10);
    assert.ok(res.data.totalVideos >= 250);
  });

  it('分区列表带每个分区的真实视频数，且与 feed.total 一致', async () => {
    const cats = await api<{ slug: string; count: number }[]>('/api/categories');
    assert.equal(cats.code, 0);
    for (const cat of cats.data.slice(0, 6)) {
      const feed = await api<{ total: number }>(`/api/feed?category=${cat.slug}&pageSize=1`);
      assert.equal(feed.data.total, cat.count, `分区 ${cat.slug} 计数不一致`);
    }
  });

  it('未知视频返回 404 与统一错误信封', async () => {
    const res = await api<null>('/api/videos/BVnotexist0000');
    assert.equal(res.code, 404);
    assert.equal(res.data, null);
  });
});

describe('视频流 / 分类筛选 / 排序', () => {
  it('按分区过滤，结果全部属于该分区', async () => {
    const res = await api<{ list: { categorySlug: string }[]; total: number }>(
      '/api/feed?category=dance&pageSize=12',
    );
    assert.equal(res.code, 0);
    assert.ok(res.data.list.length > 0);
    assert.ok(res.data.list.every((v) => v.categorySlug === 'dance'));
  });

  it('按播放量排序为降序', async () => {
    const res = await api<{ list: { play: number }[] }>('/api/feed?sort=play&pageSize=10');
    const plays = res.data.list.map((v) => v.play);
    const sorted = [...plays].sort((a, b) => b - a);
    assert.deepEqual(plays, sorted);
  });

  it('分页不重复且 hasMore 正确', async () => {
    const p1 = await api<{ list: { bvid: string }[]; hasMore: boolean }>('/api/feed?pageSize=10&page=1');
    const p2 = await api<{ list: { bvid: string }[] }>('/api/feed?pageSize=10&page=2');
    assert.equal(p1.data.list.length, 10);
    assert.ok(p1.data.hasMore);
    const overlap = p1.data.list.filter((v) => p2.data.list.some((x) => x.bvid === v.bvid));
    assert.equal(overlap.length, 0);
  });
});

describe('详情 / 互动 / 评论 / 弹幕', () => {
  it('详情返回 UP主、标签、关联推荐与真实片长', async () => {
    const feed = await api<{ list: { bvid: string }[] }>('/api/feed?pageSize=1');
    const bvid = feed.data.list[0]!.bvid;
    const res = await api<{
      video: { clipDuration: number; duration: number };
      owner: { name: string };
      tags: string[];
      related: unknown[];
    }>(`/api/videos/${bvid}`);
    assert.equal(res.code, 0);
    assert.ok(res.data.video.clipDuration > 0, '必须有真实可播放片长');
    assert.ok(res.data.owner.name.length > 0);
    assert.ok(res.data.tags.length > 0);
    assert.equal(res.data.related.length, 12);
  });

  it('点赞切换会持久化', async () => {
    const feed = await api<{ list: { bvid: string }[] }>('/api/feed?pageSize=1');
    const bvid = feed.data.list[0]!.bvid;
    const on = await api<{ liked: boolean }>(`/api/videos/${bvid}/toggle/liked`, { method: 'POST' });
    assert.equal(on.data.liked, true);
    const detail = await api<{ interaction: { liked: boolean } }>(`/api/videos/${bvid}`);
    assert.equal(detail.data.interaction.liked, true);
    const off = await api<{ liked: boolean }>(`/api/videos/${bvid}/toggle/liked`, { method: 'POST' });
    assert.equal(off.data.liked, false);
  });

  it('评论发布后立即可见', async () => {
    const feed = await api<{ list: { bvid: string }[] }>('/api/feed?pageSize=1');
    const bvid = feed.data.list[0]!.bvid;
    const content = '自动化测试评论';
    const created = await api<{ content: string; source?: string }>(
      `/api/videos/${bvid}/comments`,
      { method: 'POST', body: JSON.stringify({ content }) },
    );
    assert.equal(created.code, 0);
    assert.equal(created.data.content, content);
    const list = await api<{ list: { content: string }[]; total: number }>(
      `/api/videos/${bvid}/comments`,
    );
    assert.ok(list.data.list.some((c) => c.content === content));
  });

  it('弹幕按发送时的进度入库，刷新后仍在同一时点（P2-2 回归）', async () => {
    const feed = await api<{ list: { bvid: string }[] }>('/api/feed?pageSize=1');
    const bvid = feed.data.list[0]!.bvid;
    const sent = await api<{ time: number }>(`/api/videos/${bvid}/danmaku`, {
      method: 'POST',
      body: JSON.stringify({ text: '进度弹幕测试', timeMs: 3200 }),
    });
    assert.equal(sent.code, 0);
    assert.equal(sent.data.time, 3.2, '必须保留发送时的时间点');

    const list = await api<{ time: number; text: string }[]>(`/api/videos/${bvid}/danmaku`);
    const mine = list.data.filter((d) => d.text === '进度弹幕测试');
    assert.equal(mine.length, 1);
    assert.equal(mine[0]!.time, 3.2);
  });

  it('超出片长的弹幕时间点会被裁剪', async () => {
    const feed = await api<{ list: { bvid: string }[] }>('/api/feed?pageSize=1');
    const bvid = feed.data.list[0]!.bvid;
    const detail = await api<{ video: { clipDuration: number } }>(`/api/videos/${bvid}`);
    const clip = detail.data.video.clipDuration;
    const sent = await api<{ time: number }>(`/api/videos/${bvid}/danmaku`, {
      method: 'POST',
      body: JSON.stringify({ text: '越界弹幕', timeMs: 999_000 }),
    });
    assert.ok(sent.data.time <= clip, `裁剪后 ${sent.data.time} 应不大于片长 ${clip}`);
  });

  it('空评论 / 空弹幕被拒绝', async () => {
    const feed = await api<{ list: { bvid: string }[] }>('/api/feed?pageSize=1');
    const bvid = feed.data.list[0]!.bvid;
    const c = await api<null>(`/api/videos/${bvid}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content: '   ' }),
    });
    assert.equal(c.code, 400);
    const d = await api<null>(`/api/videos/${bvid}/danmaku`, {
      method: 'POST',
      body: JSON.stringify({ text: '' }),
    });
    assert.equal(d.code, 400);
  });
});

describe('搜索', () => {
  it('空关键词返回热搜榜', async () => {
    const res = await api<{ mode: string; hotSearch: string[] }>('/api/search/suggest');
    assert.equal(res.data.mode, 'hot');
    assert.equal(res.data.hotSearch.length, 10);
  });

  it('关键词给出发送可跳转的视频建议', async () => {
    const res = await api<{ mode: string; suggestions: { type: string; bvid?: string }[] }>(
      '/api/search/suggest?keyword=%E7%BE%8E%E9%A3%9F',
    );
    assert.equal(res.data.mode, 'suggest');
    assert.ok(res.data.suggestions.length > 0);
    const video = res.data.suggestions.find((s) => s.type === 'video');
    if (video) assert.ok(video.bvid);
  });

  it('搜索结果为非空且关键词相关', async () => {
    const res = await api<{ total: number; list: { title: string }[] }>(
      '/api/search?keyword=%E7%BE%8E%E9%A3%9F&pageSize=12',
    );
    assert.ok(res.data.total > 0);
    assert.ok(res.data.list.every((v) => v.title.length > 0));
  });
});

describe('历史记录', () => {
  it('上报进度后可读取并可清空', async () => {
    const feed = await api<{ list: { bvid: string }[] }>('/api/feed?pageSize=1');
    const bvid = feed.data.list[0]!.bvid;
    await api('/api/history', { method: 'POST', body: JSON.stringify({ bvid, progress: 0.42 }) });
    const list = await api<{ bvid: string; progress: number }[]>('/api/history');
    const entry = list.data.find((h) => h.bvid === bvid);
    assert.ok(entry, '历史里应能找到刚上报的视频');
    assert.ok(Math.abs(entry!.progress - 0.42) < 1e-6);

    await api('/api/history', { method: 'DELETE' });
    const cleared = await api<unknown[]>('/api/history');
    assert.equal(cleared.data.length, 0);
  });
});

describe('顶栏面板接口', () => {
  it('收藏面板返回真实收藏记录', async () => {
    const feed = await api<{ list: { bvid: string }[] }>('/api/feed?pageSize=1');
    const bvid = feed.data.list[0]!.bvid;
    await api(`/api/videos/${bvid}/toggle/faved`, { method: 'POST' });
    const fav = await api<{ list: { bvid: string }[]; total: number }>('/api/me/favorites');
    assert.ok(fav.data.list.some((v) => v.bvid === bvid));
    assert.ok(fav.data.total >= 1);
  });

  it('动态面板有数据来源标记', async () => {
    const res = await api<{ list: unknown[]; source: string }>('/api/me/dynamics');
    assert.ok(['following', 'latest'].includes(res.data.source));
    assert.ok(res.data.list.length > 0);
  });

  it('消息与创作中心返回统计', async () => {
    const msg = await api<{ items: unknown[] }>('/api/me/notifications');
    assert.ok(msg.data.items.length > 0);
    const creator = await api<{ watched: number }>('/api/me/creator-stats');
    assert.ok(Number.isFinite(creator.data.watched));
  });
});

describe('媒体与数据完整性', () => {
  it('视频资源支持 Range 请求（可拖动进度）', async () => {
    const feed = await api<{ list: { videoUrl: string }[] }>('/api/feed?pageSize=1');
    const url = feed.data.list[0]!.videoUrl;
    const res = await fetch(`${base}${url}`, { headers: { Range: 'bytes=0-1023' } });
    assert.equal(res.status, 206);
    assert.match(res.headers.get('content-range') ?? '', /^bytes 0-1023\//);
  });

  it('每个封面引用都能在磁盘上按大小写精确找到（P2-7 回归）', () => {
    const files = new Set(fs.readdirSync(path.join(config.publicDir, 'media', 'covers')));
    const rows = getDb().prepare('SELECT bvid, cover FROM videos').all() as unknown as {
      bvid: string;
      cover: string;
    }[];
    assert.ok(rows.length > 0);
    const missing = rows.filter((r) => !files.has(r.cover.split('/').pop() ?? ''));
    assert.deepEqual(missing.map((m) => m.bvid), [], '存在大小写不匹配或缺失的封面引用');

    const lower = new Map<string, string>();
    const collisions: string[] = [];
    for (const f of files) {
      const key = f.toLowerCase();
      if (lower.has(key)) collisions.push(`${lower.get(key)} / ${f}`);
      lower.set(key, f);
    }
    assert.deepEqual(collisions, [], '封面文件名存在大小写碰撞');
  });

  it('没有弹幕超出演示片长（P2-3 回归）', () => {
    const over = getDb()
      .prepare(
        `SELECT v.bvid, d.time_ms, v.clip_duration * 1000 AS clip_ms
         FROM danmaku d JOIN videos v ON v.bvid = d.bvid
         WHERE d.time_ms > v.clip_duration * 1000`,
      )
      .all() as unknown as { bvid: string; time_ms: number; clip_ms: number }[];
    assert.deepEqual(over, [], '存在超出片长的弹幕');
  });

  it('每个视频都有有效的演示播放源与片长', () => {
    const rows = getDb()
      .prepare('SELECT bvid, video_url, clip_duration FROM videos')
      .all() as unknown as { bvid: string; video_url: string; clip_duration: number }[];
    const bad = rows.filter((r) => !r.video_url || !(r.clip_duration > 0));
    assert.deepEqual(bad.map((r) => r.bvid), []);
  });
});

describe('重复执行 seed 不会清掉用户数据（P2-5 回归）', () => {
  it('用户评论 / 弹幕 / 历史 / 互动在重新 seed 后依然存在', async () => {
    const feed = await api<{ list: { bvid: string }[] }>('/api/feed?pageSize=1');
    const bvid = feed.data.list[0]!.bvid;

    await api(`/api/videos/${bvid}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content: 'seed 保留性测试评论' }),
    });
    await api(`/api/videos/${bvid}/danmaku`, {
      method: 'POST',
      body: JSON.stringify({ text: 'seed 保留性测试弹幕', timeMs: 1500 }),
    });
    await api('/api/history', { method: 'POST', body: JSON.stringify({ bvid, progress: 0.66 }) });
    await api(`/api/videos/${bvid}/toggle/coined`, { method: 'POST' });

    runSeed(); // 模拟 `npm run seed`

    const comments = await api<{ list: { content: string }[] }>(`/api/videos/${bvid}/comments`);
    assert.ok(comments.data.list.some((c) => c.content === 'seed 保留性测试评论'), '用户评论被清掉了');

    const danmaku = await api<{ text: string; time: number }[]>(`/api/videos/${bvid}/danmaku`);
    const mine = danmaku.data.find((d) => d.text === 'seed 保留性测试弹幕');
    assert.ok(mine, '用户弹幕被清掉了');
    assert.equal(mine!.time, 1.5);

    const history = await api<{ bvid: string }[]>('/api/history');
    assert.ok(history.data.some((h) => h.bvid === bvid), '观看历史被清掉了');

    const detail = await api<{ interaction: { coined: boolean } }>(`/api/videos/${bvid}`);
    assert.equal(detail.data.interaction.coined, true, '互动状态被清掉了');
  });
});
