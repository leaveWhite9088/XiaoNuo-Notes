import { useEffect, useRef, useState } from 'react';

const POOL = [
  '前排围观', '2333333', 'AWSL', '这画质绝了', '名场面预定',
  '高能预警', '考古', '三连了', 'UP主牛逼', '前排合影',
  '每日一刷', '承包这个笑容', '泪目', '爷青回', '冲冲冲'
];

// 简化弹幕层：视频播放时定时从右侧飞入，顶部/底部轨道随机
export default function DanmakuLayer({ playing }) {
  const [items, setItems] = useState([]);
  const idRef = useRef(0);
  const poolIdx = useRef(0);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      const id = ++idRef.current;
      const text = POOL[poolIdx.current++ % POOL.length];
      const top = 8 + Math.random() * 55;
      const dur = 6 + Math.random() * 4;
      setItems((old) => [...old.slice(-18), { id, text, top, dur }]);
      setTimeout(() => {
        setItems((old) => old.filter((x) => x.id !== id));
      }, dur * 1000);
    }, 700);
    return () => clearInterval(t);
  }, [playing]);

  return (
    <div className="danmaku-layer">
      {items.map((d) => (
        <span
          key={d.id}
          className="danmaku"
          style={{ top: `${d.top}%`, animationDuration: `${d.dur}s` }}
        >
          {d.text}
        </span>
      ))}
    </div>
  );
}
