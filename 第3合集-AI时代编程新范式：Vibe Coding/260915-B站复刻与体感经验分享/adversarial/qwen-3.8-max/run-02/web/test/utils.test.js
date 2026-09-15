// 前端工具函数单元测试（纯 JS，可直接 node --test 运行）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatCount, timeAgo } from '../src/utils.js';

test('formatCount：万 / 亿 / 原样 / 非法值', () => {
  assert.equal(formatCount(999), '999');
  assert.equal(formatCount(12345), '1.2万');
  assert.equal(formatCount(10000), '1.0万');
  assert.equal(formatCount(2099098), '209.9万');
  assert.equal(formatCount(150000000), '1.5亿');
  assert.equal(formatCount(null), '--');
  assert.equal(formatCount(NaN), '--');
});

test('timeAgo：刚刚 / 分钟 / 小时 / 天 / 日期', () => {
  const now = Date.now();
  assert.equal(timeAgo(now - 10 * 1000), '刚刚');
  assert.equal(timeAgo(now - 5 * 60 * 1000), '5分钟前');
  assert.equal(timeAgo(now - 3 * 3600 * 1000), '3小时前');
  assert.equal(timeAgo(now - 2 * 24 * 3600 * 1000), '2天前');
  const old = timeAgo(new Date('2024-03-05T08:00:00Z').getTime());
  assert.match(old, /^\d{4}-\d{2}-\d{2}$/);
});
