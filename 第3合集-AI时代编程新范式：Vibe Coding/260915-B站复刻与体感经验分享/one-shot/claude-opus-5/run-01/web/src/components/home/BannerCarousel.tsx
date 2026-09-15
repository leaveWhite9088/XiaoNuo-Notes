/** 首页头部轮播：自动轮播 + hover 左右箭头 + 底部指示点，点击进入播放页。 */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import type { Banner } from '../../types';
import './banner-carousel.css';

interface Props {
  banners: Banner[];
  interval?: number;
}

export function BannerCarousel({ banners, interval = 5000 }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (paused || banners.length < 2) return;
    timer.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, interval);
    return () => window.clearInterval(timer.current);
  }, [paused, banners.length, interval]);

  if (banners.length === 0) return <div className="banner skeleton" />;

  const step = (dir: number) => setIndex((i) => (i + dir + banners.length) % banners.length);

  return (
    <div
      className="banner"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {banners.map((banner, i) => (
        <Link
          key={banner.id}
          to={`/video/${banner.bvid}`}
          className={`banner__slide ${i === index ? 'is-active' : ''}`}
          tabIndex={i === index ? 0 : -1}
        >
          <img src={banner.image} alt={banner.title} />
          <div className="banner__caption">
            <span className="banner__tag">{banner.subTitle}</span>
            <p className="text-ellipsis">{banner.title}</p>
          </div>
        </Link>
      ))}

      <button className="banner__arrow banner__arrow--prev" onClick={() => step(-1)} title="上一张">
        <Icon name="chevron-left" size={20} />
      </button>
      <button className="banner__arrow banner__arrow--next" onClick={() => step(1)} title="下一张">
        <Icon name="chevron-right" size={20} />
      </button>

      <div className="banner__dots">
        {banners.map((banner, i) => (
          <button
            key={banner.id}
            className={i === index ? 'is-active' : ''}
            onClick={() => setIndex(i)}
            aria-label={`第 ${i + 1} 张`}
          />
        ))}
      </div>
    </div>
  );
}
