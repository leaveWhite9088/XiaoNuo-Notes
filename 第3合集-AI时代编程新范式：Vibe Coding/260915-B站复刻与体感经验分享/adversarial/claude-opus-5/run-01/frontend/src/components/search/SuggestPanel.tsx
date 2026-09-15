import { Icon } from '../common/Icon';
import { splitHighlight } from '../../utils/format';
import type { HotSearch, SearchSuggestion } from '../../types';
import './SuggestPanel.css';

interface SuggestPanelProps {
  keyword: string;
  suggestions: SearchSuggestion[];
  hotSearches: HotSearch[];
  history: string[];
  loading: boolean;
  activeIndex: number;
  onHover: (index: number) => void;
  onPick: (keyword: string) => void;
  onClearHistory: () => void;
}

const TYPE_LABEL: Record<SearchSuggestion['type'], string> = {
  hot: '热搜',
  up: 'UP主',
  tag: '标签',
  video: '视频',
};

/** 搜索框下拉：无输入时展示历史 + bilibili 热搜，有输入时展示联想结果 */
export function SuggestPanel({
  keyword,
  suggestions,
  hotSearches,
  history,
  loading,
  activeIndex,
  onHover,
  onPick,
  onClearHistory,
}: SuggestPanelProps) {
  if (keyword) {
    return (
      <div className="suggest-panel fade-in">
        {suggestions.length === 0 && (
          <div className="suggest-panel__empty">{loading ? '搜索中…' : '没有找到相关建议'}</div>
        )}
        <ul className="suggest-panel__list">
          {suggestions.map((item, index) => (
            <li key={`${item.type}-${item.keyword}`}>
              <button
                className={`suggest-item ${index === activeIndex ? 'suggest-item--active' : ''}`}
                onMouseEnter={() => onHover(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onPick(item.keyword)}
              >
                {item.type === 'up' && item.cover ? (
                  <img className="suggest-item__avatar" src={item.cover} alt="" loading="lazy" />
                ) : (
                  <Icon name={item.type === 'hot' ? 'fire' : 'search'} size={16} />
                )}
                <span className="suggest-item__text text-ellipsis">
                  {splitHighlight(item.keyword, keyword).map((part, i) =>
                    part.hit ? (
                      <em key={i}>{part.text}</em>
                    ) : (
                      <span key={i}>{part.text}</span>
                    ),
                  )}
                </span>
                <span className="suggest-item__type">{TYPE_LABEL[item.type]}</span>
                {item.extra && <span className="suggest-item__extra">{item.extra}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="suggest-panel fade-in">
      {history.length > 0 && (
        <section className="suggest-panel__section">
          <header className="suggest-panel__header">
            <span>搜索历史</span>
            <button className="suggest-panel__clear" onMouseDown={(e) => e.preventDefault()} onClick={onClearHistory}>
              清空
            </button>
          </header>
          <div className="suggest-panel__chips">
            {history.map((h) => (
              <button
                key={h}
                className="suggest-chip"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onPick(h)}
              >
                <span className="text-ellipsis">{h}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="suggest-panel__section">
        <header className="suggest-panel__header">
          <span>bilibili 热搜</span>
        </header>
        <ul className="suggest-panel__hot">
          {hotSearches.map((h) => (
            <li key={h.rank}>
              <button
                className="hot-item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onPick(h.keyword)}
              >
                <span className={`hot-item__rank hot-item__rank--${h.rank <= 3 ? 'top' : 'normal'}`}>
                  {h.rank}
                </span>
                <span className="hot-item__text text-ellipsis">{h.showName}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
