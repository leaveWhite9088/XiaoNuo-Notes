import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import './ChannelMenu.css';

/** 顶栏「首页」下拉里的全部分区入口，点击后回到首页并按分区筛选 */
export function ChannelMenu({ onPick }: { onPick: (channelId: string) => void }) {
  const { data: channels = [] } = useQuery({ queryKey: ['channels'], queryFn: api.channels });

  return (
    <div className="channel-menu">
      <header className="channel-menu__header">
        <span>全部分区</span>
        <button onClick={() => onPick('all')}>查看全部推荐</button>
      </header>
      <div className="channel-menu__grid">
        {channels.map((c) => (
          <button key={c.id} className="channel-menu__item" onClick={() => onPick(c.id)}>
            <span className="channel-menu__icon" style={{ background: `${c.color}22`, color: c.color }}>
              {c.icon}
            </span>
            <span className="channel-menu__name">{c.name}</span>
            <span className="channel-menu__count">{c.videoCount}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
