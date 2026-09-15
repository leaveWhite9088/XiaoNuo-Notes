import { Icon } from '../common/Icon';
import type { FeedSort } from '../../types';
import './FeedToolbar.css';

const SORTS: { id: FeedSort; label: string }[] = [
  { id: 'recommend', label: '推荐' },
  { id: 'hot', label: '最多播放' },
  { id: 'latest', label: '最新发布' },
  { id: 'danmaku', label: '最多弹幕' },
];

interface FeedToolbarProps {
  title: string;
  total: number;
  sort: FeedSort;
  refreshing: boolean;
  onSortChange: (sort: FeedSort) => void;
  onRefresh: () => void;
}

/** 信息流上方的排序 tab 与「换一换」 */
export function FeedToolbar({
  title,
  total,
  sort,
  refreshing,
  onSortChange,
  onRefresh,
}: FeedToolbarProps) {
  return (
    <div className="feed-toolbar">
      <h2 className="feed-toolbar__title">
        {title}
        <span className="feed-toolbar__total">{total} 个视频</span>
      </h2>

      <div className="feed-toolbar__right">
        <div className="feed-toolbar__tabs">
          {SORTS.map((s) => (
            <button
              key={s.id}
              className={`feed-toolbar__tab ${sort === s.id ? 'is-active' : ''}`}
              onClick={() => onSortChange(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button className="feed-toolbar__refresh" onClick={onRefresh} disabled={refreshing}>
          <Icon name="refresh" size={15} className={refreshing ? 'is-spinning' : ''} />
          换一换
        </button>
      </div>
    </div>
  );
}
