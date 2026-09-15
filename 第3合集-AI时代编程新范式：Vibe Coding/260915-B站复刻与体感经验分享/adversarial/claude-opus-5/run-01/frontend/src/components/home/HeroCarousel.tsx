import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import type { Banner, VideoCard } from '../../types';
import { formatCount } from '../../utils/format';
import './HeroCarousel.css';

interface HeroCarouselProps {
  banners: Banner[];
  sideVideos: VideoCard[];
}

/** 首页头部：左侧大图轮播 + 右侧 2x2 精选卡（对应 B 站首页顶部推荐位） */
export function HeroCarousel({ banners, sideVideos }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || banners.length <= 1) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % banners.length), 4200);
    return () => window.clearInterval(id);
  }, [paused, banners.length]);

  if (banners.length === 0) {
    return <div className="hero skeleton hero--loading" />;
  }


  return (
    <section className="hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="hero__main">
        {banners.map((b, i) => (
          <Link
            key={b.id}
            className={`hero__slide ${i === index ? 'is-active' : ''}`}
            to={`/video/${b.bvid}`}
            tabIndex={i === index ? 0 : -1}
          >
            <img src={b.image} alt={b.title} />
            <span className="hero__gradient" />
            <span className="hero__badge">{b.badge}</span>
            <span className="hero__title text-clamp-2">{b.title}</span>
          </Link>
        ))}

        <button
          className="hero__nav hero__nav--prev"
          aria-label="上一张"
          onClick={() => setIndex((i) => (i - 1 + banners.length) % banners.length)}
        >
          <Icon name="arrowLeft" size={20} />
        </button>
        <button
          className="hero__nav hero__nav--next"
          aria-label="下一张"
          onClick={() => setIndex((i) => (i + 1) % banners.length)}
        >
          <Icon name="arrowRight" size={20} />
        </button>

        <div className="hero__dots">
          {banners.map((b, i) => (
            <button
              key={b.id}
              className={`hero__dot ${i === index ? 'is-active' : ''}`}
              aria-label={`第 ${i + 1} 张`}
              onMouseEnter={() => setIndex(i)}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>

      <div className="hero__side">
        {sideVideos.slice(0, 4).map((v) => (
          <Link className="hero__side-card" key={v.bvid} to={`/video/${v.bvid}`}>
            <img src={v.cover} alt={v.title} loading="lazy" />
            <span className="hero__side-mask" />
            <span className="hero__side-title text-ellipsis">{v.title}</span>
            <span className="hero__side-stat">
              <Icon name="play" size={12} /> {formatCount(v.stat.view)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
