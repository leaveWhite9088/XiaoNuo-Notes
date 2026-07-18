import { useEffect, useRef, useState } from 'react';
import type { Danmaku } from '../types';

interface DanmakuLayerProps {
  danmakus: Danmaku[];
  currentTime: number;
  isPlaying: boolean;
}

interface DanmakuItem extends Danmaku {
  left: number;
  top: number;
  speed: number;
  id: string;
}

export const DanmakuLayer = ({ danmakus, currentTime, isPlaying }: DanmakuLayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDanmakus, setActiveDanmakus] = useState<DanmakuItem[]>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(currentTime);

  useEffect(() => {
    if (!isPlaying) return;

    const newDanmakus = danmakus.filter(
      (d) => Math.abs(d.time - currentTime) < 0.5 && d.time > lastTimeRef.current
    );

    if (newDanmakus.length > 0) {
      const containerHeight = containerRef.current?.clientHeight || 400;
      const trackHeight = 30;
      const maxTracks = Math.floor(containerHeight / trackHeight);

      const newItems: DanmakuItem[] = newDanmakus.map((d, index) => ({
        ...d,
        id: `${d.time}-${index}-${Date.now()}`,
        left: containerRef.current?.clientWidth || 800,
        top: Math.floor(Math.random() * maxTracks) * trackHeight + 10,
        speed: 100 + Math.random() * 50,
      }));

      setActiveDanmakus((prev) => [...prev, ...newItems].slice(-50));
    }

    lastTimeRef.current = currentTime;
  }, [currentTime, isPlaying, danmakus]);

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    let lastTimestamp = performance.now();

    const animate = (timestamp: number) => {
      const deltaTime = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      setActiveDanmakus((prev) =>
        prev
          .map((d) => ({
            ...d,
            left: d.left - d.speed * deltaTime,
          }))
          .filter((d) => d.left > -500)
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 10,
      }}
    >
      {activeDanmakus.map((d) => (
        <div
          key={d.id}
          style={{
            position: 'absolute',
            left: d.left,
            top: d.top,
            color: d.color === 16777215 ? '#fff' : `#${d.color.toString(16).padStart(6, '0')}`,
            fontSize: d.size,
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            whiteSpace: 'nowrap',
            willChange: 'transform',
          }}
        >
          {d.text}
        </div>
      ))}
    </div>
  );
};
