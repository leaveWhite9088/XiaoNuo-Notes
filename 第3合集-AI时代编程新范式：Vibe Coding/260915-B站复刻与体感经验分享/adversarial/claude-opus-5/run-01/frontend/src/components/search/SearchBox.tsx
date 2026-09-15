import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { Icon } from '../common/Icon';
import { SuggestPanel } from './SuggestPanel';
import './SearchBox.css';

export function SearchBox() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const [keyword, setKeyword] = useState(params.get('keyword') ?? '');
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounced = useDebouncedValue(keyword.trim(), 200);

  useOnClickOutside(boxRef, () => setFocused(false));

  useEffect(() => {
    setKeyword(params.get('keyword') ?? '');
  }, [params]);

  const squareQuery = useQuery({
    queryKey: ['search-square'],
    queryFn: api.searchSquare,
    enabled: focused,
  });

  const suggestQuery = useQuery({
    queryKey: ['suggest', debounced],
    queryFn: () => api.suggest(debounced),
    enabled: focused && debounced.length > 0,
  });

  const suggestions = debounced ? (suggestQuery.data ?? []) : [];
  const hotSearches = squareQuery.data?.hotSearches ?? [];
  const history = squareQuery.data?.history ?? [];

  // 输入框占位符跟随热搜榜首（与 B 站一致）
  const placeholder = useMemo(
    () => (hotSearches[0] ? hotSearches[0].showName : '搜索你感兴趣的视频'),
    [hotSearches],
  );

  useEffect(() => {
    setActiveIndex(-1);
  }, [debounced, focused]);

  const submit = (value: string) => {
    const q = value.trim();
    if (!q) return;
    setFocused(false);
    inputRef.current?.blur();
    navigate(`/search?keyword=${encodeURIComponent(q)}`);
    queryClient.invalidateQueries({ queryKey: ['search-square'] });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!suggestions.length) return;
      event.preventDefault();
      const dir = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((i) => {
        const next = i + dir;
        if (next < 0) return suggestions.length - 1;
        if (next >= suggestions.length) return -1;
        return next;
      });
      return;
    }
    if (event.key === 'Enter') {
      const picked = activeIndex >= 0 ? suggestions[activeIndex] : undefined;
      submit(picked ? picked.keyword : keyword);
    }
    if (event.key === 'Escape') {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`search-box ${focused ? 'search-box--focused' : ''}`} ref={boxRef}>
      <div className="search-box__field">
        <input
          ref={inputRef}
          className="search-box__input"
          value={keyword}
          placeholder={placeholder}
          aria-label="搜索"
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={onKeyDown}
        />
        {keyword && (
          <button
            className="search-box__clear"
            aria-label="清空"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setKeyword('');
              inputRef.current?.focus();
            }}
          >
            <Icon name="close" size={14} />
          </button>
        )}
        <button className="search-box__submit" aria-label="搜索" onClick={() => submit(keyword)}>
          <Icon name="search" size={20} />
        </button>
      </div>

      {focused && (
        <SuggestPanel
          keyword={debounced}
          suggestions={suggestions}
          hotSearches={hotSearches}
          history={history}
          loading={suggestQuery.isFetching}
          activeIndex={activeIndex}
          onHover={setActiveIndex}
          onPick={submit}
          onClearHistory={async () => {
            await api.clearSearchHistory();
            queryClient.invalidateQueries({ queryKey: ['search-square'] });
          }}
        />
      )}
    </div>
  );
}
