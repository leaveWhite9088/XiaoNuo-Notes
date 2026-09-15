import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import VideoCard from '../components/VideoCard';
import type { FeedPage, SuggestItem } from '../types';

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [data, setData] = useState<FeedPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hots, setHots] = useState<SuggestItem[]>([]);

  useEffect(() => {
    api.suggest('').then((r) => setHots(r.items)).catch(() => setHots([]));
  }, []);

  useEffect(() => {
    if (!q) {
      setData(null);
      return;
    }
    let dead = false;
    setLoading(true);
    setError('');
    setData(null);
    api
      .search(q, 1)
      .then((r) => {
        if (!dead) {
          setData(r);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!dead) {
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        }
      });
    return () => {
      dead = true;
    };
  }, [q]);

  if (!q) {
    return (
      <div className="search-page">
        <div className="empty">
          <p>还没有输入搜索词，试试热搜：</p>
          <div className="hot-chips">
            {hots.map((h) => (
              <Link key={h.text} className="chip" to={`/search?q=${encodeURIComponent(h.text)}`}>
                {h.text}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page">
      <div className="search-head">
        搜索 <em>「{q}」</em>
        {data && <span> 找到 {data.total} 个结果</span>}
        <span className="search-head-tip">（数据来自本地快照，按标题/UP主/子分区匹配）</span>
      </div>
      {error && <div className="empty">搜索失败：{error}</div>}
      {loading && <div className="loading-text">搜索中…</div>}
      {data && data.list.length === 0 && !loading && (
        <div className="empty">
          <p>
            没有找到与「{q}」相关的视频，试试：
          </p>
          <div className="hot-chips">
            {hots.slice(0, 6).map((h) => (
              <Link key={h.text} className="chip" to={`/search?q=${encodeURIComponent(h.text)}`}>
                {h.text}
              </Link>
            ))}
          </div>
        </div>
      )}
      {data && data.list.length > 0 && (
        <div className="result-list">
          {data.list.map((v) => (
            <VideoCard key={v.id} v={v} variant="row" hl={q} />
          ))}
        </div>
      )}
    </div>
  );
}
