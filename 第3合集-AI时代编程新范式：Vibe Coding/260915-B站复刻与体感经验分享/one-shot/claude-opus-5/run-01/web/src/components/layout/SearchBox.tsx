/**
 * 顶栏搜索框：
 * - 未输入时下拉展示「搜索历史 + 大家都在搜」
 * - 输入时防抖请求 /api/search/suggest 展示联想词（命中片段高亮）
 * - 支持上下键选择、回车搜索、点击外部收起
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchHotSearches, fetchSuggest } from '../../api/bili';
import { useConfig } from '../../context/ConfigContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { clearHistory, pushHistory, readHistory } from '../../utils/searchHistory';
import { splitByKeyword } from '../../utils/format';
import { Icon } from '../common/Icon';
import type { HotSearchItem, SuggestItem } from '../../types';
import './search-box.css';

interface Props {
  initialKeyword?: string;
}

export function SearchBox({ initialKeyword = '' }: Props) {
  const navigate = useNavigate();
  const { config } = useConfig();
  const boxRef = useRef<HTMLDivElement>(null);

  const [keyword, setKeyword] = useState(initialKeyword);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [history, setHistory] = useState<string[]>([]);
  const [hot, setHot] = useState<HotSearchItem[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestItem[]>([]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const debounced = useDebouncedValue(keyword, 180);

  useEffect(() => setKeyword(initialKeyword), [initialKeyword]);

  useEffect(() => {
    setHistory(readHistory());
    fetchHotSearches().then(setHot).catch(() => setHot([]));
  }, []);

  // 占位词轮播
  useEffect(() => {
    const list = config.searchPlaceholders;
    if (list.length < 2) return;
    const timer = window.setInterval(() => setPlaceholderIndex((i) => (i + 1) % list.length), 4000);
    return () => window.clearInterval(timer);
  }, [config.searchPlaceholders]);

  // 联想词
  useEffect(() => {
    const kw = debounced.trim();
    if (!kw) {
      setSuggestions([]);
      return;
    }
    let alive = true;
    fetchSuggest(kw)
      .then((list) => alive && setSuggestions(list))
      .catch(() => alive && setSuggestions([]));
    return () => {
      alive = false;
    };
  }, [debounced]);

  useClickOutside(boxRef, () => setOpen(false), open);

  const options = useMemo(
    () => (keyword.trim() ? suggestions.map((s) => s.text) : history),
    [keyword, suggestions, history],
  );

  const go = (value: string) => {
    const kw = value.trim();
    if (!kw) return;
    setHistory(pushHistory(kw));
    setKeyword(kw);
    setOpen(false);
    setActive(-1);
    navigate(`/search?keyword=${encodeURIComponent(kw)}`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!options.length) return;
      setOpen(true);
      setActive((prev) => {
        const dir = event.key === 'ArrowDown' ? 1 : -1;
        const next = (prev + dir + options.length + 1) % (options.length + 1);
        return next;
      });
      return;
    }
    if (event.key === 'Enter') {
      go(active >= 0 && options[active] ? options[active] : keyword);
    }
    if (event.key === 'Escape') setOpen(false);
  };

  const placeholder = config.searchPlaceholders[placeholderIndex] ?? '搜索你感兴趣的内容';
  const showSuggest = Boolean(keyword.trim()) && suggestions.length > 0;

  return (
    <div className={`search-box ${open ? 'is-open' : ''}`} ref={boxRef}>
      <div className="search-box__field">
        <input
          className="search-box__input"
          value={keyword}
          placeholder={placeholder}
          aria-label="搜索"
          onChange={(e) => {
            setKeyword(e.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {keyword && (
          <button className="search-box__clear" title="清空" onClick={() => setKeyword('')}>
            <Icon name="close" size={14} />
          </button>
        )}
        <button className="search-box__submit" title="搜索" onClick={() => go(keyword)}>
          <Icon name="search" size={20} />
        </button>
      </div>

      <div className="search-box__panel">
        {showSuggest ? (
          <ul className="search-box__list">
            {suggestions.map((item, index) => (
              <li
                key={item.text}
                className={`search-box__item ${active === index ? 'is-active' : ''}`}
                onMouseEnter={() => setActive(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(item.text)}
              >
                <Icon name="search" size={14} className="search-box__item-icon" />
                <span className="text-ellipsis">
                  {splitByKeyword(item.text, keyword).map((part, i) =>
                    part.hit ? (
                      <em key={i} className="search-box__hit">
                        {part.text}
                      </em>
                    ) : (
                      <span key={i}>{part.text}</span>
                    ),
                  )}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <>
            {history.length > 0 && (
              <section className="search-box__section">
                <header className="search-box__section-head">
                  <span>搜索历史</span>
                  <button onClick={() => setHistory(clearHistory())}>清空</button>
                </header>
                <div className="search-box__tags">
                  {history.map((item) => (
                    <button
                      key={item}
                      className="search-box__tag"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => go(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </section>
            )}
            <section className="search-box__section">
              <header className="search-box__section-head">
                <span>
                  <Icon name="fire" size={14} /> 大家都在搜
                </span>
              </header>
              <ul className="search-box__hot">
                {hot.map((item) => (
                  <li
                    key={item.text}
                    className="search-box__hot-item"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go(item.text)}
                  >
                    <span className={`search-box__rank rank-${item.rank <= 3 ? item.rank : 'n'}`}>
                      {item.rank}
                    </span>
                    <span className="text-ellipsis">{item.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
