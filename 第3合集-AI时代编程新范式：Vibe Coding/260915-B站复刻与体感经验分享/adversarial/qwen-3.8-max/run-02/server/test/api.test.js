// API 冒烟测试：临时端口启动 Express 应用，逐接口验证
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

let srv;
let base;

before(async () => {
  const app = createApp();
  await new Promise((resolve) => {
    srv = app.listen(0, '127.0.0.1', resolve);
  });
  base = `http://127.0.0.1:${srv.address().port}`;
});

after(() => {
  srv.close();
});

async function getJSON(path) {
  const res = await fetch(base + path);
  const body = await res.json();
  return { status: res.status, body, type: res.headers.get('content-type') };
}

test('GET /health → ok + videos>0', async () => {
  const { status, body } = await getJSON('/health');
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.ok(body.videos > 0);
});

test('GET /api/channels → code=0，数组含 name/count', async () => {
  const { status, body } = await getJSON('/api/channels');
  assert.equal(status, 200);
  assert.equal(body.code, 0);
  assert.ok(Array.isArray(body.data) && body.data.length > 0);
  assert.ok(body.data[0].name && body.data[0].count > 0);
});

test('GET /api/videos → 默认分页结构完整', async () => {
  const { body } = await getJSON('/api/videos');
  assert.equal(body.code, 0);
  const d = body.data;
  assert.equal(d.page, 1);
  assert.equal(d.pageSize, 20);
  assert.equal(d.list.length, 20);
  assert.equal(d.total, 80);
  assert.equal(d.hasMore, true);
  const v = d.list[0];
  for (const key of ['id', 'title', 'cover', 'src', 'channel', 'duration', 'owner', 'stat']) {
    assert.ok(v[key] !== undefined, `缺少字段 ${key}`);
  }
});

test('GET /api/videos?channel=游戏 → 全部命中该频道', async () => {
  const { body } = await getJSON(`/api/videos?channel=${encodeURIComponent('游戏')}&pageSize=50`);
  assert.equal(body.code, 0);
  assert.ok(body.data.list.every((v) => v.channel === '游戏'));
  assert.equal(body.data.total, 22);
});

test('GET /api/videos?keyword= → 关键词过滤生效', async () => {
  const { body } = await getJSON(`/api/videos?keyword=${encodeURIComponent('游戏')}&pageSize=50`);
  assert.equal(body.code, 0);
  assert.ok(body.data.total > 0);
  assert.ok(body.data.list.every((v) =>
    v.title.includes('游戏') || v.owner.name.includes('游戏') || v.category.includes('游戏')
  ));
});

test('GET /api/videos?page=2 → 翻页不重复', async () => {
  const p1 = (await getJSON('/api/videos?page=1&pageSize=5')).body.data;
  const p2 = (await getJSON('/api/videos?page=2&pageSize=5')).body.data;
  const ids1 = new Set(p1.list.map((v) => v.id));
  assert.ok(p2.list.every((v) => !ids1.has(v.id)));
});

test('GET /api/videos/:id → 详情 + src + 相关推荐', async () => {
  const { list } = (await getJSON('/api/videos?pageSize=1')).body.data;
  const { status, body } = await getJSON(`/api/videos/${list[0].id}`);
  assert.equal(status, 200);
  assert.equal(body.code, 0);
  assert.equal(body.data.video.id, list[0].id);
  assert.ok(body.data.video.src.startsWith('/media/videos/'));
  assert.ok(Array.isArray(body.data.related) && body.data.related.length > 0);
  assert.ok(body.data.related.every((r) => r.id !== list[0].id));
});

test('GET /api/videos/:id 不存在 → 404 JSON', async () => {
  const { status, body, type } = await getJSON('/api/videos/BV-not-exist');
  assert.equal(status, 404);
  assert.equal(body.code, 404);
  assert.match(type, /application\/json/);
});

test('GET /api/search/suggest → 关键词联想 & 空词热搜', async () => {
  const withKw = await getJSON(`/api/search/suggest?keyword=${encodeURIComponent('游戏')}`);
  assert.equal(withKw.body.code, 0);
  assert.ok(withKw.body.data.length > 0);
  assert.ok(withKw.body.data.some((s) => s.includes('游戏')));
  const empty = await getJSON('/api/search/suggest');
  assert.equal(empty.body.code, 0);
  assert.ok(empty.body.data.length > 0);
});

test('GET /api/hot-searches → 非空去重列表', async () => {
  const { body } = await getJSON('/api/hot-searches');
  assert.equal(body.code, 0);
  assert.ok(body.data.length > 0);
  assert.equal(new Set(body.data).size, body.data.length);
});

test('P3-7：未匹配的 /api 路由 → JSON 404（非 HTML）', async () => {
  const { status, body, type } = await getJSON('/api/no-such-endpoint');
  assert.equal(status, 404);
  assert.match(type, /application\/json/);
  assert.equal(body.code, 404);
  assert.ok(body.message.includes('接口不存在'));
});

test('静态媒体：封面图与样例视频可访问', async () => {
  const { list } = (await getJSON('/api/videos?pageSize=1')).body.data;
  const cover = await fetch(base + list[0].cover);
  assert.equal(cover.status, 200);
  assert.ok(Number(cover.headers.get('content-length')) > 10000);
  const mp4 = await fetch(base + list[0].src, { method: 'HEAD' });
  assert.equal(mp4.status, 200);
  assert.match(mp4.headers.get('content-type'), /video\/mp4/);
});
