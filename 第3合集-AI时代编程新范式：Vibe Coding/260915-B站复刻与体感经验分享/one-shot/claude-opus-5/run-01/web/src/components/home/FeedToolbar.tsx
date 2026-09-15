/** 信息流工具条：当前分区标题 + 排序筛选 + 换一换。 */
import { Icon } from '../common/Icon';
import { useConfig } from '../../context/ConfigContext';
import './feed-toolbar.css';

interface Props {
  channelId: string;
  sort: string;
  onSortChange: (sort: string) => void;
  onShuffle: () => void;
  shuffling?: boolean;
}

export function FeedToolbar({ channelId, sort, onSortChange, onShuffle, shuffling }: Props) {
  const { config } = useConfig();
  const channel = config.channels.find((c) => c.id === channelId);

  return (
    <div className="feed-toolbar">
      <div className="feed-toolbar__title">
        <h2>{channelId === 'all' ? '推荐' : channel?.name ?? '推荐'}</h2>
        <span className="feed-toolbar__desc text-ellipsis">
          {channelId === 'all' ? '根据你的观看习惯为你推荐' : channel?.desc}
        </span>
      </div>

      <div className="feed-toolbar__right">
        <div className="feed-toolbar__sorts">
          {config.sorts.map((item) => (
            <button
              key={item.id}
              className={`feed-toolbar__sort ${sort === item.id ? 'is-active' : ''}`}
              onClick={() => onSortChange(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <button
          className={`feed-toolbar__shuffle ${shuffling ? 'is-loading' : ''}`}
          onClick={onShuffle}
        >
          <Icon name="refresh" size={16} />
          换一换
        </button>
      </div>
    </div>
  );
}
