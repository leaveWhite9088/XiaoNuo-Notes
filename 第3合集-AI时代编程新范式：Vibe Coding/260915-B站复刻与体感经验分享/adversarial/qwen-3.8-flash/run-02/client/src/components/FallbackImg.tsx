import { useEffect, useState } from 'react';
import { IconPlay } from './icons';

/** 远程封面加载失败时显示占位块 */
export function CoverImg({ src, alt }: { src: string; alt: string }) {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [src]);
  if (bad) {
    return (
      <div className="img-fallback" title={alt}>
        <IconPlay width={26} height={26} />
        <span>封面加载失败</span>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={() => setBad(true)} />;
}

/** 远程头像加载失败时显示首字母圆形占位 */
export function FaceImg({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [src]);
  if (bad) {
    return (
      <div className={`${className} face-fallback`} title={alt}>
        {alt.slice(0, 1)}
      </div>
    );
  }
  return <img className={className} src={src} alt={alt} referrerPolicy="no-referrer" onError={() => setBad(true)} />;
}
