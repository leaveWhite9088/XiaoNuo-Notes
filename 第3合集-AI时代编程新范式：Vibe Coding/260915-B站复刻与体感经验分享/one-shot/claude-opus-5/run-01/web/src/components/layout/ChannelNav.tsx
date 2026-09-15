/**
 * 分区导航条：平铺展示主要分区，右侧「更多」hover 展开全部分区面板。
 * 点击分区即切换首页信息流（分类筛选）。
 */
import { useNavigate } from 'react-router-dom';
import { HoverPanel } from '../common/HoverPanel';
import { Icon } from '../common/Icon';
import { useConfig } from '../../context/ConfigContext';
import './channel-nav.css';

interface Props {
  activeId: string;
  onSelect?: (channelId: string) => void;
}

export function ChannelNav({ activeId, onSelect }: Props) {
  const { config } = useConfig();
  const navigate = useNavigate();

  const select = (id: string) => {
    if (onSelect) onSelect(id);
    else navigate(id === 'all' ? '/' : `/?channel=${id}`);
  };

  return (
    <nav className="channel-nav">
      <div className="channel-nav__inner">
        <ul className="channel-nav__list">
          {config.channels.map((channel) => (
            <li key={channel.id}>
              <button
                className={`channel-nav__item ${activeId === channel.id ? 'is-active' : ''}`}
                onClick={() => select(channel.id)}
                title={channel.desc}
              >
                <span className="channel-nav__icon">{channel.icon}</span>
                {channel.name}
              </button>
            </li>
          ))}
        </ul>

        <HoverPanel
          className="channel-nav__more"
          align="right"
          panelClassName="channel-panel"
          trigger={
            <span className="channel-nav__more-btn">
              更多
              <Icon name="chevron-down" size={14} />
            </span>
          }
        >
          {config.morePanel.map((group) => (
            <section key={group.group} className="channel-panel__group">
              <h4>{group.group}</h4>
              <div className="channel-panel__grid">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    className={`channel-panel__item ${activeId === item.id ? 'is-active' : ''}`}
                    onClick={() => select(item.id)}
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </HoverPanel>
      </div>
    </nav>
  );
}
