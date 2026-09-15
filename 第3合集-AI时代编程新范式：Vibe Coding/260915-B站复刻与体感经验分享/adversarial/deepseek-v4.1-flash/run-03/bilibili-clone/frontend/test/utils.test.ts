import { describe, expect, it, vi } from 'vitest';
import {
  avatarColor,
  debounce,
  fallbackCover,
  formatCount,
  formatDuration,
  mediaUrl,
  nameInitial,
  PLACEHOLDER_COVER,
} from '@/utils';

describe('格式化工具', () => {
  it('formatCount 按 万 / 亿 收敛', () => {
    expect(formatCount(999)).toBe('999');
    expect(formatCount(12_345)).toBe('1.2万');
    expect(formatCount(1_450_000)).toBe('145万');
    expect(formatCount(120_000_000)).toBe('1.2亿');
    expect(formatCount(0)).toBe('0');
  });

  it('formatDuration 支持 mm:ss 与 h:mm:ss', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(65)).toBe('01:05');
    expect(formatDuration(3725)).toBe('1:02:05');
    expect(formatDuration(-3)).toBe('00:00');
  });

  it('mediaUrl 对空值回退到占位图，对正常路径原样返回', () => {
    expect(mediaUrl('/media/covers/a.webp')).toBe('/media/covers/a.webp');
    expect(mediaUrl('')).toBe(PLACEHOLDER_COVER);
    expect(mediaUrl(undefined)).toBe(PLACEHOLDER_COVER);
    expect(fallbackCover('测试')).toContain('data:image/svg+xml');
  });

  it('头像工具函数稳定且可预期', () => {
    expect(nameInitial('哔哩哔哩')).toBe('哔');
    expect(nameInitial('')).toBe('?');
    expect(avatarColor('同一个名字')).toBe(avatarColor('同一个名字'));
    expect(avatarColor('a')).toMatch(/^#/);
  });

  it('debounce 只执行最后一次', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const wrapped = debounce(fn, 100);
    wrapped('a');
    wrapped('b');
    wrapped('c');
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(120);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
    vi.useRealTimers();
  });
});
