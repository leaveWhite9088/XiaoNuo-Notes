import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Danmaku as DanmakuType } from '../../types';

interface DanmakuProps {
  cid: number;
  bvid: string;
  currentTime: number;
  onSend?: (content: string, time: number) => void;
  showInput?: boolean;
}

export const Danmaku: React.FC<DanmakuProps> = ({
  cid,
  bvid,
  currentTime,
  onSend,
  showInput = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [danmakuList, setDanmakuList] = useState<DanmakuType[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [sendTime, setSendTime] = useState(0);
  const activeDanmakuRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const rafRef = useRef<number>();

  useEffect(() => {
    const fetchDanmaku = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/danmaku/video/${bvid}?cid=${cid}`);
        const data = await res.json();
        if (data.code === 0) {
          setDanmakuList(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch danmaku:', error);
      } finally {
        setLoading(false);
      }
    };

    if (cid) {
      fetchDanmaku();
    }
  }, [cid, bvid]);

  useEffect(() => {
    if (danmakuList.length === 0) return;

    let lastTime = 0;

    const renderFrame = (time: number) => {
      const newDanmakus = danmakuList.filter(d => {
        const danmakuTime = d.date / 1000;
        return danmakuTime >= time - 0.1 && danmakuTime <= time + 5 && danmakuTime > lastTime;
      });

      if (newDanmakus.length > 0) {
        newDanmakus.forEach(danmaku => {
          const el = document.createElement('div');
          el.className = 'danmaku-item absolute text-white text-sm font-bold transition-all duration-300';
          el.style.left = '100%';
          el.style.top = `${Math.random() * 80 + 10}%`;
          el.textContent = danmaku.content;
          el.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
          el.style.padding = '2px 8px';
          el.style.borderRadius = '4px';
          el.style.zIndex = '10';

          containerRef.current?.appendChild(el);

          const duration = 5 + Math.random() * 3;
          const startTime = performance.now();
          const distance = window.innerWidth * 0.8;

          const animate = (now: number) => {
            const elapsed = (now - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            const currentPos = 100 - (progress * 100);

            el.style.left = `${currentPos}%`;

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              el.remove();
            }
          };

          requestAnimationFrame(animate);
        });
        lastTime = time;
      }

      rafRef.current = requestAnimationFrame(renderFrame);
    };

    rafRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [danmakuList]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || !onSend) return;

    onSend(inputValue, sendTime);
    setInputValue('');
  }, [inputValue, sendTime, onSend]);

  return (
    <div className="danmaku-container relative">
      <div
        ref={containerRef}
        className="danmaku-track absolute inset-0 overflow-hidden pointer-events-none"
        style={{ height: '80%' }}
      />
      {showInput && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="发送弹幕..."
            className="flex-1 px-3 py-1.5 text-sm border border-bili-border rounded focus:outline-none focus:border-bili-pink"
          />
          <input
            type="number"
            value={sendTime}
            onChange={(e) => setSendTime(parseFloat(e.target.value) || 0)}
            placeholder="时间(秒)"
            className="w-24 px-3 py-1.5 text-sm border border-bili-border rounded focus:outline-none focus:border-bili-pink"
            step="0.1"
          />
          <button
            onClick={handleSend}
            className="px-4 py-1.5 bg-bili-pink text-white text-sm rounded hover:bg-bili-pinkHover"
          >
            发送
          </button>
        </div>
      )}
    </div>
  );
};