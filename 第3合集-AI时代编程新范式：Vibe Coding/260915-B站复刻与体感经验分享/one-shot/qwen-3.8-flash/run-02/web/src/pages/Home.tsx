import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CategoryTabs from "../components/CategoryTabs";
import VideoCard from "../components/VideoCard";
import { Category, Summary, fetchCategories, fetchFeed } from "../api/client";

const PAGE_SIZE = 12;

export default function Home() {
  const [params, setParams] = useSearchParams();
  const tid = Number(params.get("tid") ?? 0);
  const q = params.get("q") ?? "";

  const [cats, setCats] = useState<Category[]>([]);
  const [list, setList] = useState<Summary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shuffle, setShuffle] = useState(0);

  useEffect(() => { fetchCategories().then(setCats).catch(() => {}); }, []);

  const load = useCallback((p: number, append: boolean, shuf: boolean) => {
    setLoading(true);
    setError("");
    fetchFeed({ tid, q, page: p, pageSize: PAGE_SIZE, shuffle: shuf })
      .then((d) => {
        setList((old) => (append ? [...old, ...d.list] : d.list));
        setTotal(d.total);
        setPage(p);
      })
      .catch((e) => setError(String(e.message || e) + "（若后端未启动或数据未生成：先 npm run seed && npm run dev）"))
      .finally(() => setLoading(false));
  }, [tid, q]);

  useEffect(() => { load(1, false, shuffle > 0); }, [load, shuffle]);

  const setTid = (t: number) => {
    const next = new URLSearchParams(params);
    if (t) next.set("tid", String(t)); else next.delete("tid");
    setParams(next, { replace: true });
  };
  const clearQ = () => {
    const next = new URLSearchParams(params);
    next.delete("q");
    setParams(next, { replace: true });
  };

  return (
    <div className="home">
      <div className="home-toolbar">
        <CategoryTabs cats={cats} tid={tid} onChange={setTid} />
        <button className="shuffle-btn" onClick={() => setShuffle((s) => s + 1)} title="随机换一批真实视频">
          ⟳ 换一换
        </button>
      </div>

      {q && (
        <div className="search-result-tip">
          搜索结果：「{q}」 共 {total} 条 <button onClick={clearQ}>清除 ✕</button>
        </div>
      )}
      {error && <div className="feed-error">⚠ {error}</div>}

      <div className="feed-grid">
        {list.map((v) => <VideoCard key={v.id + (shuffle ? "-" + shuffle : "")} v={v} />)}
        {loading && Array.from({ length: 4 }).map((_, i) => <div key={"sk" + i} className="video-card skeleton" />)}
        {!loading && !list.length && !error && <div className="feed-empty">该分类下暂无视频</div>}
      </div>

      {!loading && list.length < total && (
        <div className="load-more-row">
          <button className="load-more" onClick={() => load(page + 1, true, false)}>加载更多（剩余 {total - list.length} 条）</button>
        </div>
      )}
      {list.length > 0 && <div className="feed-count">已加载 {list.length} / {total} 条真实视频</div>}
    </div>
  );
}
