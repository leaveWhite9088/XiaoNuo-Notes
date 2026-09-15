import { useEffect, useState } from 'react';

const SLIDES = [
  { img: 'https://picsum.photos/seed/bili-banner-1/2060/360', title: '年度动画大赏 · 提名作品限时展映' },
  { img: 'https://picsum.photos/seed/bili-banner-2/2060/360', title: '暑期游戏嘉年华 · 新游试玩抢先体验' },
  { img: 'https://picsum.photos/seed/bili-banner-3/2060/360', title: '知识狂欢节 · 百位UP主联合直播' }
];

export default function Banner() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="banner">
      {SLIDES.map((s, i) => (
        <div key={s.img} className={`banner-slide ${i === idx ? 'on' : ''}`}>
          <img src={s.img} alt={s.title} />
          <div className="banner-title">{s.title}</div>
        </div>
      ))}
      <button className="banner-arrow left" onClick={() => setIdx((idx + SLIDES.length - 1) % SLIDES.length)}>‹</button>
      <button className="banner-arrow right" onClick={() => setIdx((idx + 1) % SLIDES.length)}>›</button>
      <div className="banner-dots">
        {SLIDES.map((_, i) => (
          <span key={i} className={`dot ${i === idx ? 'on' : ''}`} onClick={() => setIdx(i)} />
        ))}
      </div>
    </div>
  );
}
