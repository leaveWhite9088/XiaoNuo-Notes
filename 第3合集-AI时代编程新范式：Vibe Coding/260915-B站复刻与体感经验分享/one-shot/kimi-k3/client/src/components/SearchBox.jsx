import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function SearchBox() {
  const [kw, setKw] = useState('');
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ type: 'hot', list: [] });
  const [active, setActive] = useState(-1);
  const boxRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onDocClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const fetchSuggest = (value) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        setData(await api.suggest(value));
      } catch {
        setData({ type: 'hot', list: [] });
      }
    }, 180);
  };

  const doSearch = (value) => {
    const query = (value ?? kw).trim();
    if (!query) return;
    setOpen(false);
    setKw(query);
    navigate(`/?q=${encodeURIComponent(query)}`);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, data.list.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === 'Enter') {
      doSearch(active >= 0 ? data.list[active] : kw);
      setActive(-1);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="search-box" ref={boxRef}>
      <input
        className="search-input"
        placeholder="搜索视频、UP主"
        value={kw}
        onFocus={() => {
          setOpen(true);
          fetchSuggest(kw);
        }}
        onChange={(e) => {
          setKw(e.target.value);
          setOpen(true);
          setActive(-1);
          fetchSuggest(e.target.value);
        }}
        onKeyDown={onKeyDown}
      />
      <button className="search-btn" onClick={() => doSearch()} aria-label="搜索">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M10 2a8 8 0 1 0 4.9 14.3l5 5a1 1 0 0 0 1.4-1.4l-5-5A8 8 0 0 0 10 2zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12z" />
        </svg>
      </button>
      {open && data.list.length > 0 && (
        <div className="search-panel">
          <div className="search-panel-title">
            {data.type === 'hot' ? 'bilibili热搜' : '搜索建议'}
          </div>
          {data.list.map((item, i) => (
            <div
              key={item}
              className={`search-item ${i === active ? 'active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => doSearch(item)}
            >
              {data.type === 'hot' && (
                <span className={`hot-rank ${i < 3 ? 'top' : ''}`}>{i + 1}</span>
              )}
              <span className="search-item-text">{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
