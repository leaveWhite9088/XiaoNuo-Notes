/**
 * 弹幕引擎：按播放进度把弹幕投放到轨道上。
 * 数据里的 p 是 0~1 的进度百分比，这样演示片源时长与"稿件时长"不一致时，
 * 弹幕依然能均匀铺满整条进度条。
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { DanmakuItem } from '../types';

export interface ActiveDanmaku extends DanmakuItem {
  key: string;
  lane: number;
}

const LANES = 10;
const MAX_ACTIVE = 80;

export function useDanmakuEngine(
  videoRef: RefObject<HTMLVideoElement>,
  list: DanmakuItem[],
  enabled: boolean,
) {
  const [active, setActive] = useState<ActiveDanmaku[]>([]);
  const lastProgress = useRef(0);
  const lane = useRef(0);
  const serial = useRef(0);

  const push = useCallback((items: DanmakuItem[]) => {
    if (items.length === 0) return;
    setActive((prev) => {
      const added = items.map((item) => ({
        ...item,
        key: `${item.id}-${serial.current++}`,
        lane: item.mode === 'top' ? 0 : lane.current++ % LANES,
      }));
      return [...prev, ...added].slice(-MAX_ACTIVE);
    });
  }, []);

  useEffect(() => {
    lastProgress.current = 0;
    setActive([]);
  }, [list]);

  useEffect(() => {
    if (!enabled) {
      setActive([]);
      return;
    }
    let raf = 0;
    const tick = () => {
      const video = videoRef.current;
      if (video && !video.paused && video.duration > 0) {
        const progress = video.currentTime / video.duration;
        if (progress < lastProgress.current) {
          // 用户往回拖动进度条
          lastProgress.current = Math.max(0, progress - 0.002);
        }
        const due = list.filter((d) => d.p > lastProgress.current && d.p <= progress);
        push(due);
        lastProgress.current = progress;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, list, push, videoRef]);

  const remove = useCallback((key: string) => {
    setActive((prev) => prev.filter((item) => item.key !== key));
  }, []);

  /** 自己发的弹幕：立即出现在画面上 */
  const emit = useCallback(
    (item: DanmakuItem) => {
      push([item]);
    },
    [push],
  );

  return { active, remove, emit, lanes: LANES };
}
