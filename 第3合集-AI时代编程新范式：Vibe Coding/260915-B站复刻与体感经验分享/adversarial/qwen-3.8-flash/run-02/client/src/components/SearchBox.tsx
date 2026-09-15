import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { SuggestItem } from '../types';
import { showToast } from '../utils/toast';
import { IconSearch } from './icons';

let hotPromise: Promise<SuggestItem[]> | null = null;

async function fetchSuggest(q: string): Promise<{ items: SuggestItem[]; live: boolean }> {
  if (q === '') {
    if (!hotPromise) {
      hotPromise = api.suggest('').then((r) => {
        // 空热词视为失败：清除缓存，允许后端恢复后重新拉取
        if (!r.items.length) {
          hotPromise = null;
          throw new Error('empty hotwords');
        }
        return r.items;
      }, (e) => {
        hotPromise = null;
        throw e;
      });
    }
    return { items: await hotPromise, live: false };
  }
  return api.suggest(q);
}

function Highlight({ text, kw }: { text: string; kw: string }) {
  const i = kw ? text.toLowerCase().indexOf(kw.toLowerCase()) : -1;
  if (i < 0) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, i)}
      <em>{text.slice(i, i + kw.length)}</em>
      {text.slice(i + kw.length)}
    </span>
  );
}

export default function SearchBox() {
  const [kw, setKw] = useState('');
  const [items, setItems] = useState<SuggestItem[]>([]);
  const [live, setLive] = useState(false);
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const reqRef = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const token = ++reqRef.current;
    timerRef.current = window.setTimeout(async () => {
      try {
        const r = await fetchSuggest(kw.trim());
        if (reqRef.current !== token) return;
        setItems(r.items);
        setLive(r.live);
        setHi(-1);
        setOpen(true);
      } catch {
        if (reqRef.current === token) setItems([]);
      }
    }, 250);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [kw, open]);

  const goSearch = (text: string) => {
    if (!text.trim()) {
      showToast('请输入搜索关键词');
      return;
    }
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(text.trim())}`);
  };

  const pick = (item: SuggestItem) => {
    setOpen(false);
    if (item.kind === 'title' && item.id) navigate(`/video/${item.id}`);
    else goSearch(item.text);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter') goSearch(kw);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHi((h) => (items.length ? (h + 1) % items.length : -1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHi((h) => (items.length ? (h - 1 + items.length) % items.length : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (hi >= 0 && items[hi]) pick(items[hi]);
      else goSearch(kw);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="searchbox" ref={boxRef}>
      <div className={`search-input ${open && items.length ? 'search-input-active' : ''}`}>
        <input
          value={kw}
          placeholder="bilibili 热 search 榜"
          onChange={(e) => setKw(e.target.value)}
          onFocus={() => {
            setOpen(true);
            if (!kw.trim()) {
              fetchSuggest('')
                .then((r) => {
                  setItems(r.items);
                  setLive(false);
                })
                .catch(() => setItems([]));
            }
          }}
          onKeyDown={onKeyDown}
        />
        <button className="search-btn" aria-label="搜索" onClick={() => goSearch(kw)}>
          <IconSearch />
        </button>
      </div>
      {open && items.length > 0 && (
        <ul className="suggest" onMouseDown={(e) => e.preventDefault()}>
          {items.map((it, i) => (
            <li
              key={`${it.kind}-${i}-${it.text}`}
              className={i === hi ? 'active' : ''}
              onMouseEnter={() => setHi(i)}
              onClick={() => pick(it)}
            >
              <span className="suggest-icon">{it.kind === 'hot' ? '🔥' : ''}</span>
              <span className="suggest-text">
                <Highlight text={it.text} kw={kw.trim()} />
              </span>
              {it.kind === 'title' && <span className="suggest-tag">视频</span>}
            </li>
          ))}
          <li className="suggest-footer">{live ? '来自 bilibili 实时搜索建议' : '来自本地推荐数据'}</li>
        </ul>
      )}
    </div>
  );
}
