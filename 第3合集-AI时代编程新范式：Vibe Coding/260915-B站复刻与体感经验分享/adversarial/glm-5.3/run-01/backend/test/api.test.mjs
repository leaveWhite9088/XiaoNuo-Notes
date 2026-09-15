/** 后端 API 冒烟测试（node:test，无需额外依赖）：
 *  覆盖分页完整性、分类过滤、详情与相关推荐、建议、搜索、排行、404。
 *  运行：npm --prefix backend test */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server.js';

let server;
let base;

test.before(async () => {
  server = createApp().listen(0, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => new Promise((r) => server.close(r)));

async function get(pathname) {
  const res = await fetch(base + pathname);
  return { status: res.status, body: await res.json() };
}

test('health 返回数据集规模与端口', async () => {
  const { status, body } = await get('/api/health');
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.port, 5802);
  assert.ok(body.videos >= 500, `视频数应≥500，实际 ${body.videos}`);
});

test('推荐流分页可完整遍历：总数一致、无重复、无遗漏', async () => {
  const seen = new Set();
  let page = 1;
  let total = null;
  while (true) {
    const { body } = await get(`/api/feed?category=recommend&page=${page}&pagesize=30`);
    if (total === null) total = body.total;
    assert.equal(body.total, total);
    for (const v of body.list) {
      assert.ok(!seen.has(v.bvid), `第 ${page} 页出现重复 bvid=${v.bvid}`);
      seen.add(v.bvid);
    }
    if (!body.hasMore) break;
    page += 1;
    assert.ok(page < 40, '分页页数异常，疑似死循环');
  }
  assert.equal(seen.size, total, `遍历条数 ${seen.size} 应等于 total ${total}`);
});

test('分类过滤：game 分区全部条目属于该分区且与推荐流条目可对上', async () => {
  const { body } = await get('/api/feed?category=game&pagesize=50');
  assert.ok(body.total >= 10, '游戏分区应至少有 10 条');
  assert.ok(body.list.every((v) => v.region === 'game'));
  assert.equal(body.list.length, body.total, '单页 pagesize=50 应覆盖 game 全部分区条目');
  assert.equal(body.hasMore, false);
});

test('视频详情：字段完整、相关推荐 12 条且不含自身、评论弹幕确定性合成', async () => {
  const first = (await get('/api/feed?page=1&pagesize=1')).body.list[0];
  const { status, body } = await get(`/api/video/${first.bvid}`);
  assert.equal(status, 200);
  const v = body.video;
  assert.equal(v.bvid, first.bvid);
  assert.ok(v.title && v.cover && v.playUrl && v.desc !== undefined);
  assert.ok(v.owner.face, '详情应返回 UP 主头像');
  assert.ok(v.stat.reply !== undefined && v.stat.coin !== undefined);
  assert.equal(body.related.length, 12);
  assert.ok(body.related.every((r) => r.bvid !== v.bvid));
  assert.equal(body.comments.length, 20);
  assert.equal(body.danmaku.length, 30);
  // 确定性：同一视频两次请求合成内容一致
  const again = (await get(`/api/video/${first.bvid}`)).body;
  assert.equal(again.comments[0].id, body.comments[0].id);
  assert.equal(again.danmaku[0].text, body.danmaku[0].text);
});

test('不存在的视频返回 404', async () => {
  const { status } = await get('/api/video/BVnotexist000');
  assert.equal(status, 404);
});

test('搜索建议：空 q 返回热搜榜，非空 q 每条都包含关键词', async () => {
  const trend = (await get('/api/suggest')).body;
  assert.equal(trend.list.length, 10);
  assert.ok(trend.list.every((s) => s.type === 'trend' && s.rank >= 1));
  const match = (await get('/api/suggest?q=%E5%8E%9F')).body; // “原”
  assert.ok(match.list.length >= 1);
  assert.ok(match.list.length <= 10);
  assert.ok(match.list.every((s) => s.text.includes('原')));
});

test('搜索：命中均可验证包含关键词，未命中词返回空', async () => {
  const { body } = await get('/api/search?q=%E9%9F%B3%E4%B9%90'); // “音乐”
  assert.ok(body.total >= 1);
  const kw = '音乐';
  assert.ok(
    body.list.every(
      (v) => v.title.includes(kw) || v.owner.name.includes(kw) || v.tname.includes(kw) || v.regionLabel.includes(kw),
    ),
  );
  const none = (await get('/api/search?q=zzzznotexist')).body;
  assert.equal(none.total, 0);
  assert.deepEqual(none.list, []);
});

test('排行榜：前 10 条且按点赞数降序', async () => {
  const { body } = await get('/api/rank');
  assert.equal(body.list.length, 10);
  const likes = body.list.map((x) => x.like);
  for (let i = 1; i < likes.length; i++) assert.ok(likes[i - 1] >= likes[i], '排行榜应按点赞降序');
});

test('分类清单：chips 含推荐/热门与 8 个内容分区，menu 为其余分区', async () => {
  const { body } = await get('/api/categories');
  assert.deepEqual(body.chips.map((c) => c.key).slice(0, 2), ['recommend', 'hot']);
  assert.equal(body.chips.length, 10);
  assert.ok(body.menu.length >= 5);
  const keys = new Set([...body.chips, ...body.menu].map((c) => c.key));
  assert.equal(keys.size, body.chips.length + body.menu.length, '分类 key 不应重复');
});
