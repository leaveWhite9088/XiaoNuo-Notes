// 数据层单元测试：node --test
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import * as store from '../src/data-store.js';

before(() => {
  const n = store.load();
  assert.ok(n > 0, 'load() 应返回正数');
});

test('count 与 listVideos 全量 total 一致', () => {
  const { total } = store.listVideos({});
  assert.equal(store.count(), total);
  assert.equal(total, 80);
});

test('getVideo：存在的 id 返回完整结构；不存在返回 null', () => {
  const { list } = store.listVideos({ pageSize: 1 });
  const v = store.getVideo(list[0].id);
  assert.ok(v);
  assert.equal(v.id, list[0].id);
  assert.match(v.duration, /^\d+:\d{2}$/);
  assert.ok(v.src.startsWith('/media/videos/'));
  assert.ok(v.cover.startsWith('/media/covers/'));
  assert.ok(v.owner.name);
  assert.equal(store.getVideo('BV-not-exist'), null);
});

test('getChannels：计数之和等于总数，频道名非空', () => {
  const channels = store.getChannels();
  assert.ok(channels.length > 0);
  const sum = channels.reduce((a, c) => a + c.count, 0);
  assert.equal(sum, store.count());
  for (const c of channels) assert.ok(c.name && c.count > 0);
});

test('每条视频的 channel 都出现在 getChannels 中（含未映射归入"其他"的逻辑）', () => {
  const names = new Set(store.getChannels().map((c) => c.name));
  const { list } = store.listVideos({ pageSize: 100 });
  for (const v of list) assert.ok(names.has(v.channel), `channel 缺失: ${v.channel}`);
});

test('listVideos：频道筛选只返回该频道', () => {
  const target = store.getChannels()[0].name;
  const data = store.listVideos({ channel: target, pageSize: 100 });
  assert.equal(data.total, store.getChannels()[0].count);
  assert.ok(data.list.every((v) => v.channel === target));
});

test('listVideos：关键词匹配标题 / UP主 / 分区', () => {
  const { list } = store.listVideos({ pageSize: 100 });
  const sample = list[0];
  // 标题子串
  const frag = sample.title.slice(2, 6);
  const byTitle = store.listVideos({ keyword: frag, pageSize: 100 });
  assert.ok(byTitle.list.some((v) => v.id === sample.id));
  // UP 主名
  const byOwner = store.listVideos({ keyword: sample.owner.name, pageSize: 100 });
  assert.ok(byOwner.list.every((v) =>
    v.title.includes(sample.owner.name) ||
    v.owner.name.includes(sample.owner.name) ||
    v.category.includes(sample.owner.name)
  ));
  assert.ok(byOwner.total >= 1);
  // 不存在的关键词
  assert.equal(store.listVideos({ keyword: 'zzz不存在的关键词zzz' }).total, 0);
});

test('listVideos：分页边界正确', () => {
  const total = store.count();
  const p1 = store.listVideos({ page: 1, pageSize: 5 });
  assert.equal(p1.list.length, 5);
  assert.equal(p1.hasMore, true);
  const lastPage = Math.ceil(total / 5);
  const pLast = store.listVideos({ page: lastPage, pageSize: 5 });
  assert.equal(pLast.hasMore, false);
  assert.equal(pLast.list.length, total - (lastPage - 1) * 5);
  // 超出范围页码 → 空列表但不报错
  const pOver = store.listVideos({ page: lastPage + 1, pageSize: 5 });
  assert.deepEqual(pOver.list, []);
  assert.equal(pOver.hasMore, false);
  // 非法参数回退默认
  const pBad = store.listVideos({ page: -3, pageSize: 0 });
  assert.equal(pBad.page, 1);
  assert.ok(pBad.list.length > 0);
});

test('getRelated：不含自身、上限 12、全部为有效 id', () => {
  const { list } = store.listVideos({ pageSize: 1 });
  const rel = store.getRelated(list[0].id, 12);
  assert.ok(rel.length > 0 && rel.length <= 12);
  assert.ok(rel.every((r) => r.id !== list[0].id));
  assert.ok(rel.every((r) => store.getVideo(r.id)));
  assert.deepEqual(store.getRelated('BV-not-exist'), []);
});

test('suggest：空关键词返回热搜；关键词命中联想；乱码返回空', () => {
  const hot = store.suggest('');
  assert.ok(hot.length > 0 && hot.length <= 8);
  const { list } = store.listVideos({ pageSize: 1 });
  const frag = list[0].title.slice(2, 6);
  const sug = store.suggest(frag);
  assert.ok(sug.length > 0);
  assert.ok(sug.some((s) => s.toLowerCase().includes(frag.toLowerCase())));
  assert.deepEqual(store.suggest('zzz不存在zzz'), []);
});

test('getHotSearches：去重且限量', () => {
  const hot = store.getHotSearches(8);
  assert.ok(hot.length <= 8);
  assert.equal(new Set(hot).size, hot.length);
});
