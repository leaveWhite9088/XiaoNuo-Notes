import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import CategoryBar from '../components/CategoryBar';
import VideoCard from '../components/VideoCard';
import type { Category, VideoCard as VideoCardType } from '../types';

export default function Home() {
  const [params, setParams] = useSearchParams();
  const cat = params.get('cat') || 'tuijian';
  const [cats, setCats] = useState<Category[]>([]);
  const [list, setList] = useState<VideoCardType[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hidden, setHidden] = useState<number[]>([]);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    api.categories().then(setCats).catch(() => setCats([]));
  }, []);

  /**
   * 加载信息流。每次调用都会取消上一个在途请求（AbortController），
   * 因此切换分区后，旧分区的慢响应不会覆盖/混排新分区列表。
   */
  const load = useCallback(
    async (p: number) => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      setError('');
      if (p === 1) setList([]);
      try {
        const r = await api.feed(cat, p, 24, ctrl.signal);
        setList((prev) => (p === 1 ? r.list : [...prev, ...r.list]));
        setPage(p);
        setHasMore(r.hasMore);
        setTotal(r.total);
        setLoading(false);
      } catch (e) {
        if (ctrl.signal.aborted) return; // 被新请求取代，静默丢弃
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      }
    },
    [cat]
  );

  useEffect(() => {
    setHidden([]);
    load(1);
    return () => abortRef.current?.abort();
  }, [load]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) load(page + 1);
      },
      { rootMargin: '800px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [load, page, hasMore, loading]);

  const pick = (c: string) => {
    const p = new URLSearchParams(params);
    if (c === 'tuijian') p.delete('cat');
    else p.set('cat', c);
    setParams(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const shown = list.filter((v) => !hidden.includes(v.id));

  return (
    <div className="home">
      <CategoryBar cats={cats} active={cat} onPick={pick} />
      {error && (
        <div className="empty">
          <p>信息流加载失败：{error}</p>
          <p>请确认后端已启动（http://localhost:5142 ）</p>
          <button className="chip" onClick={() => load(page)}>重试</button>
        </div>
      )}
      {!error && shown.length === 0 && loading && (
        <div className="video-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div className="skeleton-card" key={i}>
              <div className="skeleton skeleton-cover" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line short" />
            </div>
          ))}
        </div>
      )}
      {!error && !loading && shown.length === 0 && list.length > 0 && (
        <div className="empty">
          <p>你已隐藏本页全部 {list.length} 个视频</p>
          <button className="chip" onClick={() => setHidden([])}>
            恢复显示
          </button>
        </div>
      )}
      {!error && !loading && shown.length === 0 && list.length === 0 && (
        <div className="empty">
          <p>该分区暂无内容（未知或空的分类：{cat}）</p>
          <button className="chip chip-active" onClick={() => pick('tuijian')}>
            返回推荐
          </button>
        </div>
      )}
      {!error && shown.length > 0 && (
        <>
          <div className="video-grid">
            {shown.map((v) => (
              <VideoCard key={v.id} v={v} onRemove={(id) => setHidden((h) => [...h, id])} />
            ))}
          </div>
          <div className="feed-footer" ref={sentinelRef}>
            {loading ? (
              <span className="loading-text">加载中…</span>
            ) : hasMore ? (
              <button className="load-more" onClick={() => load(page + 1)}>
                加载更多
              </button>
            ) : (
              <span className="end-text">—— 已展示本分区全部 {total} 个视频 ——</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
