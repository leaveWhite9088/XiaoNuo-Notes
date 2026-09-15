import { useEffect, useRef, useState, type RefObject } from 'react';
import type { Danmaku } from '../../types';
import './DanmakuLayer.css';

interface LiveDanmaku extends Danmaku {
  key: string;
  lane: number;
  bornAt: number;
}

interface DanmakuLayerProps {
  danmaku: Danmaku[];
  videoRef: RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  opacity: number;
  /** 用户手动发送的弹幕，立即上屏 */
  pending: Danmaku[];
  onConsumePending: () => void;
}

const LANES = 8;
const LIFETIME = 7000;

/** 弹幕层：按播放进度把弹幕滚动上屏（纯前端模拟，不写回服务端） */
export function DanmakuLayer({
  danmaku,
  videoRef,
  enabled,
  opacity,
  pending,
  onConsumePending,
}: DanmakuLayerProps) {
  const [live, setLive] = useState<LiveDanmaku[]>([]);
  const firedRef = useRef(new Set<string>());
  const laneRef = useRef(0);
  const lastTimeRef = useRef(0);

  // 跟随播放进度投放弹幕
  useEffect(() => {
    if (!enabled) {
      setLive([]);
      return;
    }
    let raf = 0;
    const tick = () => {
      const video = videoRef.current;
      if (video && !video.paused) {
        const t = video.currentTime;
        if (t < lastTimeRef.current - 0.4) firedRef.current.clear(); // 回拖或循环后重放
        lastTimeRef.current = t;
        const arrivals = danmaku.filter(
          (d) => d.time <= t && d.time > t - 0.6 && !firedRef.current.has(d.id),
        );
        if (arrivals.length) {
          for (const d of arrivals) firedRef.current.add(d.id);
          setLive((prev) => [
            ...prev,
            ...arrivals.map((d) => ({
              ...d,
              key: `${d.id}-${Math.round(t * 10)}`,
              lane: (laneRef.current = (laneRef.current + 1) % LANES),
              bornAt: Date.now(),
            })),
          ]);
        }
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [danmaku, enabled, videoRef]);

  // 自己发的弹幕直接上屏
  useEffect(() => {
    if (pending.length === 0) return;
    setLive((prev) => [
      ...prev,
      ...pending.map((d) => ({
        ...d,
        key: `${d.id}-self`,
        lane: (laneRef.current = (laneRef.current + 1) % LANES),
        bornAt: Date.now(),
      })),
    ]);
    onConsumePending();
  }, [pending, onConsumePending]);

  // 过期回收：动画结束后移出 DOM
  useEffect(() => {
    const id = window.setInterval(() => {
      const deadline = Date.now() - LIFETIME;
      setLive((prev) => (prev.some((d) => d.bornAt < deadline) ? prev.filter((d) => d.bornAt >= deadline) : prev));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!enabled) return null;

  return (
    <div className="danmaku-layer" style={{ opacity }} aria-hidden="true">
      {live.map((d) => (
        <span
          key={d.key}
          className={`danmaku-item danmaku-item--${d.mode === 'top' ? 'top' : 'scroll'}`}
          style={{
            top: `${6 + d.lane * 10}%`,
            color: d.color,
            animationDuration: `${d.mode === 'top' ? 4 : 7}s`,
          }}
        >
          {d.text}
        </span>
      ))}
    </div>
  );
}
