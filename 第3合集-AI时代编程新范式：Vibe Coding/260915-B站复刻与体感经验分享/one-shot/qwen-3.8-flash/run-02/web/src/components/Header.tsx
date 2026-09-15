import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Category, fetchSuggest } from "../api/client";

const NAV = ["首页", "番剧", "直播", "游戏中心", "会员购", "漫画", "图集", "专栏"];

export default function Header({ onSearch }: { onSearch: (q: string) => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [sug, setSug] = useState<string[]>([]);
  const [hot, setHot] = useState<string[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [zoneOpen, setZoneOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSuggest("").then((d) => setHot(d.list)).catch(() => {});
    fetch("/api/categories").then((r) => r.json()).then((j) => setCats(j.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    if (!q.trim()) { setSug(hot); return; }
    const t = setTimeout(() => {
      fetchSuggest(q.trim()).then((d) => setSug(d.list)).catch(() => setSug([]));
    }, 250);
    return () => clearTimeout(t);
  }, [q, open, hot]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const doSearch = (word: string) => {
    setOpen(false);
    onSearch(word || q.trim());
    navigate(`/?q=${encodeURIComponent(word || q.trim())}`);
  };

  return (
    <header className="bili-header">
      <div className="header-inner">
        <Link to="/" className="logo-link" title="回到首页">
          <img src="/media/logo.png" alt="bilibili" className="logo" />
        </Link>

        <nav className="main-nav" onMouseLeave={() => setZoneOpen(false)}>
          <Link to="/" className="nav-item active">首页</Link>
          <div className="nav-item zone" onMouseEnter={() => setZoneOpen(true)}>
            分区 ▾
            {zoneOpen && (
              <div className="zone-menu" onMouseLeave={() => setZoneOpen(false)}>
                <Link to="/" onClick={() => onSearch("")}>全部</Link>
                {cats.slice(0, 16).map((c) => (
                  <Link key={c.tid} to={`/?tid=${c.tid}`} onClick={() => setZoneOpen(false)}>{c.name}</Link>
                ))}
              </div>
            )}
          </div>
          {NAV.slice(1).map((n) => (
            <a key={n} href="#home" className="nav-item" onClick={(e) => { e.preventDefault(); navigate("/"); }}>{n}</a>
          ))}
        </nav>

        <div className="search-box" ref={boxRef}>
          <input
            className="search-input"
            placeholder="搜索视频、UP主"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => { if (e.key === "Enter") doSearch(""); if (e.key === "Escape") setOpen(false); }}
          />
          <button className="search-btn" onClick={() => doSearch("")} aria-label="搜索">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
          </button>

          {open && (
            <div className="suggest-panel">
              <div className="suggest-title">
                {q.trim() ? "搜索建议" : "bilibili 热搜"}
                {!q.trim() && <span className="suggest-live-tag">真实热搜</span>}
              </div>
              {sug.length === 0 && <div className="suggest-empty">无建议</div>}
              {sug.map((s, i) => (
                <div key={s + i} className="suggest-item" onMouseDown={() => doSearch(s)}>
                  {!q.trim() && <span className={i < 3 ? "rank rank-top" : "rank"}>{i + 1}</span>}
                  <span className="suggest-text">{s}</span>
                </div>
              ))}
              <div className="suggest-foot">回车搜索「{q.trim() || hot[0] || ""}」</div>
            </div>
          )}
        </div>

        <div className="header-right">
          <button className="pill-btn">创作中心</button>
          <button className="pill-btn pink">大会员</button>
          <img src="/media/logo.png" alt="我的" className="my-face" title="登录（复刻演示）" />
        </div>
      </div>
    </header>
  );
}
