import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CoverImg } from './FallbackImg';
import type { VideoCard as VideoCardType } from '../types';
import { fmtDate, fmtDuration, fmtNum } from '../utils/format';
import { showToast } from '../utils/toast';
import { IconClock, IconClose, IconDanmaku, IconEye, IconUser } from './icons';

function Highlight({ text, kw }: { text: string; kw?: string }) {
  const k = (kw || '').trim();
  const i = k ? text.toLowerCase().indexOf(k.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <em>{text.slice(i, i + k.length)}</em>
      {text.slice(i + k.length)}
    </>
  );
}

export default function VideoCard({
  v,
  onRemove,
  variant = 'grid',
  hl,
}: {
  v: VideoCardType;
  onRemove?: (id: number) => void;
  variant?: 'grid' | 'row';
  hl?: string;
}) {
  const [preview, setPreview] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);
  const navigate = useNavigate();

  const enter = () => {
    timerRef.current = window.setTimeout(() => setPreview(true), 350);
  };
  const leave = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setPreview(false);
  };
  const go = () => navigate(`/video/${v.id}`);

  const cover = (
    <div className="cover">
      <CoverImg src={v.pic} alt={v.title} />
      {preview && <video className="preview" src={v.stream} poster={v.pic} muted autoPlay loop playsInline />}
      <span className="duration">{fmtDuration(v.duration)}</span>
      <span className="hover-stats">
        <IconEye width={14} height={14} />
        {fmtNum(v.stat.view)}
        <IconDanmaku width={14} height={14} />
        {fmtNum(v.stat.danmaku)}
      </span>
      {onRemove && (
        <button
          className="remove-btn"
          title="不感兴趣"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(v.id);
            showToast('已减少此类内容推荐');
          }}
        >
          <IconClose width={12} height={12} />
        </button>
      )}
    </div>
  );

  if (variant === 'row') {
    return (
      <article className="video-row" onClick={go}>
        <div className="video-row-cover">{cover}</div>
        <div className="video-row-body">
          <h3 className="title">
            <Highlight text={v.title} kw={hl} />
          </h3>
          <div className="meta-row">
            <span className="up">{v.owner.name}</span>
            <span className="dot">·</span>
            <span>{v.tname}</span>
            <span className="dot">·</span>
            <span>{fmtDate(v.pubdate)}</span>
          </div>
          <div className="meta-row stats">
            <IconEye width={15} height={15} /> {fmtNum(v.stat.view)}播放
            <IconDanmaku width={15} height={15} /> {fmtNum(v.stat.danmaku)}弹幕
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="video-card" onMouseEnter={enter} onMouseLeave={leave} onClick={go}>
      {cover}
      <h3 className="title">
        <Highlight text={v.title} kw={hl} />
      </h3>
      <div className="meta-row">
        <IconEye width={15} height={15} /> {fmtNum(v.stat.view)}
        <span className="dot">·</span>
        <IconClock width={15} height={15} /> {fmtDate(v.pubdate)}
      </div>
      <div className="meta-row up">
        <IconUser width={13} height={13} />
        <span className="up-name">{v.owner.name}</span>
      </div>
    </article>
  );
}
