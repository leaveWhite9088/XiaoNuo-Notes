import { useRef } from 'react';
import { Icon } from '../common/Icon';
import type { Channel } from '../../types';
import './ChannelNav.css';

interface ChannelNavProps {
  channels: Channel[];
  active: string;
  onChange: (channelId: string) => void;
}

/** 首页分区导航：横向图标条，点击即筛选当前信息流 */
export function ChannelNav({ channels, active, onChange }: ChannelNavProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (delta: number) => {
    trackRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <nav className="channel-nav">
      <button className="channel-nav__arrow" aria-label="向左" onClick={() => scrollBy(-360)}>
        <Icon name="arrowLeft" size={18} />
      </button>

      <div className="channel-nav__track" ref={trackRef}>
        <button
          className={`channel-nav__item ${active === 'all' ? 'is-active' : ''}`}
          onClick={() => onChange('all')}
        >
          <span className="channel-nav__icon" style={{ background: 'rgba(251,114,153,.14)', color: '#fb7299' }}>
            <Icon name="fire" size={18} />
          </span>
          <span className="channel-nav__name">推荐</span>
        </button>

        {channels.map((c) => (
          <button
            key={c.id}
            className={`channel-nav__item ${active === c.id ? 'is-active' : ''}`}
            onClick={() => onChange(c.id)}
            title={`${c.name} · ${c.videoCount} 个视频`}
          >
            <span className="channel-nav__icon" style={{ background: `${c.color}26`, color: c.color }}>
              {c.icon}
            </span>
            <span className="channel-nav__name">{c.name}</span>
          </button>
        ))}
      </div>

      <button className="channel-nav__arrow" aria-label="向右" onClick={() => scrollBy(360)}>
        <Icon name="arrowRight" size={18} />
      </button>
    </nav>
  );
}
