import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useSearchParams,
  useParams,
  useLocation,
} from "react-router-dom";
import {
  Search,
  Upload,
  Mail,
  Clock,
  Star,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Play,
  Flame,
  ArrowUp,
  Plus,
  Check,
  X,
  ThumbsUp,
  Share2,
  MessageSquare,
  MonitorPlay,
  Menu,
  Radio,
  Music,
  Gamepad2,
  BookOpen,
  Grid2X2,
  Heart,
  Volume2,
  Send,
  Download,
  Compass,
  SlidersHorizontal,
} from "lucide-react";
export async function api(path, signal) {
  const r = await fetch("/api" + path, { signal });
  if (!r.ok)
    throw new Error(
      r.status === 404 ? "这个视频暂时找不到了" : "加载失败，请稍后重试",
    );
  return r.json();
}
const read = (key, fallback = []) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
function Logo() {
  return (
    <span className="logo">
      bilibili<span className="logo-tv">▱</span>
    </span>
  );
}
function Cover({ src, alt, ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      onError={(e) => {
        if (e.currentTarget.getAttribute("src") !== "/fallback.svg") {
          e.currentTarget.src = "/fallback.svg";
        }
      }}
      {...props}
    />
  );
}
function App() {
  const location = useLocation();
  const homeSnapshots = useRef(new Map());
  const closeModal = useCallback(() => setModal(null), []);
  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [user, setUser] = useState(() => read("bili-user", null));
  const toastTimer = useRef();
  const notify = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              key={location.key}
              snapshots={homeSnapshots}
              setModal={setModal}
              user={user}
              notify={notify}
            />
          }
        />
        <Route
          path="/video/:id"
          element={
            <Detail
              key={location.pathname}
              setModal={setModal}
              user={user}
              notify={notify}
            />
          }
        />
        <Route
          path="*"
          element={
            <div className="empty">
              <h2>这个页面走丢了</h2>
              <Link to="/">返回首页</Link>
            </div>
          }
        />
      </Routes>
      {modal && (
        <Modal
          type={modal}
          openModal={setModal}
          close={closeModal}
          user={user}
          login={(name) => {
            const next = { name };
            setUser(next);
            write("bili-user", next);
            setModal(null);
            notify("欢迎回来，" + name);
          }}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
        </div>
      )}
    </>
  );
}
function Header({ hero = false, setModal, user }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [focus, setFocus] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(-1);
  const [menu, setMenu] = useState("");
  const searchRef = useRef();
  const menuCloseTimer = useRef();
  useEffect(() => () => clearTimeout(menuCloseTimer.current), []);
  useEffect(() => {
    setQuery(params.get("q") || "");
    setSelected(-1);
  }, [params]);
  useEffect(() => {
    const abort = new AbortController();
    setSelected(-1);
    setSuggestions([]);
    const timer = setTimeout(
      () =>
        api("/search/suggestions?q=" + encodeURIComponent(query), abort.signal)
          .then((next) => {
            if (!abort.signal.aborted) {
              setSuggestions(next);
              setSelected(-1);
            }
          })
          .catch(() => {}),
      150,
    );
    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [query]);
  useEffect(() => {
    const handler = (e) => {
      if (!searchRef.current?.contains(e.target)) {
        setFocus(false);
        setSelected(-1);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);
  const search = (value) => {
    const q = (typeof value === "string" ? value : query).trim();
    navigate(q ? "/?q=" + encodeURIComponent(q) : "/");
    setQuery(q);
    setFocus(false);
    setSelected(-1);
  };
  return (
    <header className={"header " + (hero ? "header-hero" : "header-solid")}>
      <nav className="top-nav">
        <Link className="home-link" to="/">
          <MonitorPlay size={20} />
          <span>首页</span>
          <ChevronDown size={12} />
        </Link>
        {["番剧", "直播", "游戏中心", "会员购", "漫画", "赛事"].map((item) => (
          <div
            className="nav-item"
            key={item}
            onMouseEnter={() => {
              clearTimeout(menuCloseTimer.current);
              setMenu(item);
            }}
            onMouseLeave={() => {
              menuCloseTimer.current = setTimeout(() => setMenu(""), 150);
            }}
          >
            <button
              onClick={() => setMenu(menu === item ? "" : item)}
              aria-expanded={menu === item}
            >
              {item}
            </button>
            {menu === item && (
              <div className="nav-popover">
                <strong>{item}精选</strong>
                <p>发现你感兴趣的精彩内容</p>
                {[
                  item === "番剧"
                    ? "动画"
                    : item === "游戏中心"
                      ? "游戏"
                      : item === "赛事"
                        ? "运动"
                        : "生活",
                  "音乐",
                  "知识",
                ].map((v, i) => (
                  <Link
                    key={i}
                    to={"/?category=" + encodeURIComponent(v)}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/?category=" + encodeURIComponent(v));
                      setMenu("");
                    }}
                  >
                    <span className={"menu-dot dot-" + i} />
                    {v}推荐
                    <ChevronRight size={14} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        <button className="download-link" onClick={() => setModal("download")}>
          <Download size={16} />
          下载客户端
        </button>
      </nav>
      <div className="search-wrap" ref={searchRef}>
        <form
          className={"search-box " + (focus ? "focused" : "")}
          onSubmit={(e) => {
            e.preventDefault();
            search(
              focus && selected >= 0 ? (suggestions[selected] ?? query) : query,
            );
          }}
        >
          <input
            aria-label="搜索视频"
            value={query}
            placeholder="在这里，发现你喜欢的世界"
            onFocus={() => setFocus(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(-1);
              setFocus(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelected((s) => Math.min(s + 1, suggestions.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelected((s) => Math.max(s - 1, -1));
              }
              if (e.key === "Escape") {
                setFocus(false);
                setSelected(-1);
              }
            }}
          />
          {query && (
            <button
              type="button"
              aria-label="清空搜索"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                setSelected(-1);
                setFocus(true);
              }}
            >
              <X size={15} />
            </button>
          )}
          <button className="search-submit" aria-label="搜索" type="submit">
            <Search size={21} />
          </button>
        </form>
        {focus && (
          <div className="search-panel">
            <div className="panel-title">
              {query ? "搜索建议" : "大家都在搜"}
              <span>发现新的兴趣</span>
            </div>
            {suggestions.length ? (
              suggestions.map((s, i) => (
                <button
                  className={selected === i ? "selected" : ""}
                  key={s}
                  onClick={() => search(s)}
                >
                  <span className={i < 3 ? "hot-number" : "rank-number"}>
                    {query ? <Search size={15} /> : i + 1}
                  </span>
                  {s}
                  {!query && i < 2 && <em>热</em>}
                </button>
              ))
            ) : (
              <p className="muted">暂无建议，按回车搜索「{query}」</p>
            )}
          </div>
        )}
      </div>
      <div className="user-nav">
        <button className="avatar-login" onClick={() => setModal("login")}>
          {user ? user.name.slice(0, 2) : "登录"}
        </button>
        {[
          [Heart, "大会员", "vip"],
          [Mail, "消息", "messages"],
          [Radio, "动态", "dynamic"],
          [Star, "收藏", "favorites"],
          [Clock, "历史", "history"],
          [Lightbulb, "创作中心", "creator"],
        ].map(([Icon, label, type]) => (
          <button
            className="user-action"
            key={type}
            onClick={() => setModal(type)}
          >
            <Icon size={21} />
            <span>{label}</span>
          </button>
        ))}
        <button
          className="mobile-menu-button"
          aria-label="打开功能菜单"
          onClick={() => setModal("navigation")}
        >
          <Menu size={22} />
        </button>
        <button className="upload-button" onClick={() => setModal("upload")}>
          <Upload size={18} />
          投稿
        </button>
      </div>
    </header>
  );
}
function Channels({ category, onCategory }) {
  const [more, setMore] = useState(false);
  const channels = [
    "番剧",
    "国创",
    "综艺",
    "动画",
    "鬼畜",
    "舞蹈",
    "娱乐",
    "科技",
    "美食",
    "汽车",
    "运动",
    "电影",
    "电视剧",
    "纪录片",
    "游戏",
    "音乐",
    "影视",
    "知识",
    "资讯",
    "生活",
    "时尚",
    "动物圈",
  ];
  return (
    <section className="channels">
      <div className="channel-special">
        <button onClick={() => onCategory("全部")}>
          <span className="special-circle coral">
            <Radio size={25} />
          </span>
          动态
        </button>
        <button onClick={() => onCategory("全部")}>
          <span className="special-circle orange">
            <Flame size={27} />
          </span>
          热门
        </button>
      </div>
      <div className="channel-grid">
        {channels.map((c) => (
          <button
            key={c}
            onClick={() => onCategory(c)}
            className={category === c ? "active" : ""}
          >
            {c}
          </button>
        ))}
        <div className="more-channel">
          <button
            className={more ? "active" : ""}
            onClick={() => setMore(!more)}
          >
            更多
            <ChevronDown size={13} />
          </button>
          {more && (
            <div className="more-menu">
              {["全部", ...channels].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onCategory(c);
                    setMore(false);
                  }}
                >
                  {c === "全部" ? "全部分区" : c}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="channel-all" onClick={() => onCategory("全部")}>
          <Grid2X2 size={14} />
          全部
        </button>
      </div>
      <div className="channel-links">
        {[
          [BookOpen, "专栏", "知识"],
          [Radio, "直播", "生活"],
          [Compass, "活动", "运动"],
          [Music, "课堂", "音乐"],
          [MessageSquare, "社区中心", "生活"],
          [Lightbulb, "新歌热榜", "音乐"],
        ].map(([Icon, label, c]) => (
          <button key={label} onClick={() => onCategory(c)}>
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
function VideoCard({ video, compact = false }) {
  return (
    <Link
      to={"/video/" + video.id}
      className={"video-card " + (compact ? "compact" : "")}
      aria-label={"播放：" + video.title}
    >
      <div className="cover-wrap">
        <Cover src={video.cover} alt={video.title} loading="lazy" />
        <div className="cover-shade" />
        <div className="card-stats">
          <span>
            <MonitorPlay size={14} />
            {video.views}
          </span>
          <span className="danmaku-count">
            <MessageSquare size={13} />
            {video.danmaku}
          </span>
          <span className="duration">{video.duration}</span>
        </div>
        <div className="hover-play">
          <Play size={27} fill="currentColor" />
        </div>
        <span className="preview-label">点击观看</span>
      </div>
      <div className="card-copy">
        <h3>{video.title}</h3>
        <div className="video-meta">
          {video.verified && <span className="recommend-tag">优质</span>}
          <span className="up-icon">UP</span>
          <span className="author">{video.author}</span>
          <span className="video-date">· 9-10</span>
        </div>
      </div>
    </Link>
  );
}
function Carousel({ banners, onCategory }) {
  const [index, setIndex] = useState(0);
  const [pause, setPause] = useState(false);
  useEffect(() => {
    if (pause || !banners.length) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % banners.length),
      6000,
    );
    return () => clearInterval(timer);
  }, [pause, banners.length]);
  if (!banners.length) return null;
  const b = banners[index];
  return (
    <div
      className="carousel"
      style={{ background: b.color }}
      onMouseEnter={() => setPause(true)}
      onMouseLeave={() => setPause(false)}
      onFocus={() => setPause(true)}
      onBlur={() => setPause(false)}
    >
      <button
        className="carousel-main"
        onClick={() => onCategory(b.category)}
        aria-label={b.title}
      >
        <Cover src={b.image} alt={b.title} />
        <div className="carousel-gradient" />
        <span className="carousel-badge">bilibili 秋日企划</span>
        <div className="carousel-art">
          <span>{b.kicker}</span>
          <strong>
            {b.title.split("，")[0]}
            <br />
            {b.title.split("，")[1]}
          </strong>
          <i>THE MOMENTS WE LOVE</i>
        </div>
        <div className="carousel-caption">
          <h2>{b.subtitle}</h2>
        </div>
      </button>
      <div className="carousel-bottom">
        <div className="carousel-dots">
          {banners.map((x, i) => (
            <button
              key={x.id}
              aria-label={"切换推荐 " + (i + 1)}
              aria-current={i === index}
              className={i === index ? "active" : ""}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <div className="carousel-arrows">
          <button
            aria-label="上一张推荐"
            onClick={() =>
              setIndex((index - 1 + banners.length) % banners.length)
            }
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="下一张推荐"
            onClick={() => setIndex((index + 1) % banners.length)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
function Home({ setModal, user, notify, snapshots }) {
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "全部";
  const q = params.get("q") || "";
  const saved = useRef(snapshots.current.get(location.key));
  const [data, setData] = useState(
    saved.current?.data || {
      videos: [],
      banners: [],
      total: 0,
      hasMore: false,
    },
  );
  const [loading, setLoading] = useState(!saved.current);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(saved.current?.refresh || 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const generation = useRef(0);
  const moreRequest = useRef(null);
  // Each history entry owns its exact list/order and scroll position.
  useLayoutEffect(() => {
    window.scrollTo(0, saved.current?.scrollY || 0);
    const rememberScroll = () => {
      const entry = snapshots.current.get(location.key);
      if (entry) entry.scrollY = window.scrollY;
    };
    window.addEventListener("scroll", rememberScroll, { passive: true });
    return () => {
      rememberScroll();
      window.removeEventListener("scroll", rememberScroll);
      generation.current++;
      moreRequest.current?.abort();
    };
  }, [location.key, snapshots]);
  const commit = (next) => {
    snapshots.current.set(location.key, {
      data: next,
      refresh,
      scrollY: window.scrollY,
    });
    setData(next);
  };
  const changeCategory = (c) => setParams(c === "全部" ? {} : { category: c });
  const refreshFeed = () => {
    generation.current++;
    moreRequest.current?.abort();
    setRefresh((x) => x + 1);
  };
  useEffect(() => {
    const token = ++generation.current;
    const abort = new AbortController();
    moreRequest.current?.abort();
    moreRequest.current = null;
    setLoadingMore(false);
    if (saved.current && refresh === saved.current.refresh) return;
    setLoading(true);
    setError("");
    api("/home?" + new URLSearchParams({ category, q }), abort.signal)
      .then((next) => {
        if (abort.signal.aborted || generation.current !== token) return;
        const n = next.videos.length ? refresh % next.videos.length : 0;
        commit({
          ...next,
          videos: [...next.videos.slice(n), ...next.videos.slice(0, n)],
        });
      })
      .catch((e) => {
        if (!abort.signal.aborted && generation.current === token)
          setError(e.message);
      })
      .finally(() => {
        if (!abort.signal.aborted && generation.current === token)
          setLoading(false);
      });
    return () => {
      abort.abort();
      generation.current++;
      moreRequest.current?.abort();
    };
  }, [category, q, refresh]);
  const loadMore = async () => {
    if (loading || loadingMore || !data.hasMore || moreRequest.current) return;
    const token = generation.current;
    const abort = new AbortController();
    moreRequest.current = abort;
    setLoadingMore(true);
    try {
      const next = await api(
        "/home?" + new URLSearchParams({ category, q, page: data.page + 1 }),
        abort.signal,
      );
      if (abort.signal.aborted || generation.current !== token) return;
      commit({ ...next, videos: [...data.videos, ...next.videos] });
    } catch (e) {
      if (!abort.signal.aborted && generation.current === token)
        notify(e.message);
    } finally {
      if (moreRequest.current === abort) moreRequest.current = null;
      if (!abort.signal.aborted && generation.current === token)
        setLoadingMore(false);
    }
  };
  return (
    <>
      <section className="hero">
        <Header hero setModal={setModal} user={user} />
        <Link to="/" className="hero-logo" aria-label="哔哩哔哩首页">
          <Logo />
          <small>干杯~</small>
        </Link>
        <div className="hero-slogan">
          让每一份热爱，都有回响。<span>HELLO, AUTUMN</span>
        </div>
        <span className="hero-note">秋日的第一份心动，在这里发生</span>
      </section>
      <main className="home-main">
        <Channels category={category} onCategory={changeCategory} />
        <div className="feed-toolbar">
          <div className="feed-tabs">
            <button
              className={category === "全部" && !q ? "selected" : ""}
              onClick={() => setParams({})}
            >
              <span className="tiny-bili">▰</span>推荐
            </button>
            {q ? (
              <span className="results-label">
                「{q}」的搜索结果 <small>{data.total} 个视频</small>
              </span>
            ) : category !== "全部" ? (
              <span className="results-label">
                {category} <small>{data.total} 个视频</small>
              </span>
            ) : (
              <>
                <span className="feed-divider" />
                <span className="feed-greeting">
                  发现你喜欢的，遇见你热爱的
                </span>
                <span className="fresh-label">每日新鲜放送</span>
              </>
            )}
          </div>
          <button
            className="refresh-button"
            onClick={refreshFeed}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? "spin" : ""} />
            换一换
          </button>
        </div>
        {error ? (
          <div className="empty">
            <h2>内容暂时加载失败</h2>
            <p>{error}</p>
            <button className="primary" onClick={refreshFeed}>
              重新加载
            </button>
          </div>
        ) : loading ? (
          <div className="video-grid skeleton-grid">
            {Array.from({ length: 10 }, (_, i) => (
              <div className="skeleton" key={i}>
                <div />
                <p />
                <span />
              </div>
            ))}
          </div>
        ) : data.videos.length ? (
          <>
            <section className="video-grid">
              {category === "全部" && !q && (
                <Carousel banners={data.banners} onCategory={changeCategory} />
              )}{" "}
              {data.videos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </section>
            <div className="load-more">
              {data.hasMore ? (
                <button onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? "正在加载…" : "看看更多精彩内容"}
                  <ChevronDown size={17} />
                </button>
              ) : (
                <span>已经到底啦，换个分区发现更多精彩 (｡･ω･｡)</span>
              )}
            </div>
          </>
        ) : (
          <div className="empty">
            <Search size={44} />
            <h2>{q ? "没有找到相关视频" : "这个分区正在准备更多精彩内容"}</h2>
            <p>
              {q ? "试试「音乐」「生活」「猫咪」等关键词" : "先去推荐页看看吧"}
            </p>
            <button className="primary" onClick={() => setParams({})}>
              返回推荐
            </button>
          </div>
        )}
        <footer>
          <Logo />
          <span>热爱，让我们相遇</span>
          <p>
            首页交互演示 · 非哔哩哔哩官方网站 · 图片来自
            Unsplash，播放内容为公开演示样片
          </p>
        </footer>
      </main>
      <div className="floating-tools">
        <button onClick={() => setModal("feedback")}>
          <MessageSquare size={18} />
          <span>反馈</span>
        </button>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="回到顶部"
        >
          <ArrowUp size={21} />
          <span>顶部</span>
        </button>
      </div>
    </>
  );
}
function Detail({ setModal, user, notify }) {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [dm, setDm] = useState(true);
  const [text, setText] = useState("");
  const [floatingDm, setFloatingDm] = useState(null);
  const dmSequence = useRef(0);
  const [playError, setPlayError] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const videoRef = useRef();
  useEffect(() => {
    const abort = new AbortController();
    setVideo(null);
    setError("");
    setPlayError(false);
    setFollowing(false);
    setLiked(read("bili-likes").includes(id));
    setSaved(read("bili-favorites").some((v) => v.id === id));
    setComments(read("bili-comments-" + id));
    setFloatingDm(null);
    setText("");
    setComment("");
    api("/videos/" + id, abort.signal)
      .then((v) => {
        setVideo(v);
        write(
          "bili-history",
          [
            { id: v.id, title: v.title, cover: v.cover },
            ...read("bili-history").filter((x) => x.id !== id),
          ].slice(0, 30),
        );
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    window.scrollTo(0, 0);
    return () => abort.abort();
  }, [id]);
  const like = () => {
    const list = read("bili-likes");
    write("bili-likes", liked ? list.filter((x) => x !== id) : [...list, id]);
    setLiked(!liked);
  };
  const save = () => {
    const list = read("bili-favorites");
    write(
      "bili-favorites",
      saved
        ? list.filter((x) => x.id !== id)
        : [...list, { id, title: video.title, cover: video.cover }],
    );
    setSaved(!saved);
    notify(saved ? "已取消收藏" : "已加入我的收藏");
  };
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify("视频链接已复制");
    } catch {
      notify("请复制地址栏链接分享");
    }
  };
  return (
    <>
      <Header setModal={setModal} user={user} />
      <main className="detail-main">
        <Link to="/" className="back-home">
          <ChevronLeft size={17} />
          返回首页
        </Link>
        {error ? (
          <div className="empty">
            <h2>{error}</h2>
            <Link to="/">去首页看看</Link>
          </div>
        ) : !video ? (
          <div className="detail-loading">正在加载视频…</div>
        ) : (
          <div className="detail-layout">
            <article>
              <h1>{video.title}</h1>
              <div className="detail-meta">
                <span>
                  <MonitorPlay size={15} />
                  {video.views}
                </span>
                <span>
                  <MessageSquare size={15} />
                  {video.danmaku}
                </span>
                <span>{video.date} 18:00:00</span>
                <span className="muted">演示视频</span>
              </div>
              <div className="player">
                <video
                  ref={videoRef}
                  key={video.id}
                  controls
                  playsInline
                  preload="metadata"
                  poster={video.cover}
                  src={video.media}
                  onError={() => setPlayError(true)}
                  aria-label="视频播放器"
                />
                {dm && floatingDm && (
                  <div
                    className="danmaku"
                    key={floatingDm.id}
                    data-send-id={floatingDm.id}
                  >
                    {floatingDm.text}
                  </div>
                )}
                {playError && (
                  <div className="player-error">
                    样片加载失败，请检查网络连接
                    <button
                      onClick={() => {
                        setPlayError(false);
                        videoRef.current?.load();
                      }}
                    >
                      重新加载
                    </button>
                  </div>
                )}
              </div>
              <div className="danmaku-bar">
                <span>
                  <span className="live-dot" />
                  正在一起看
                </span>
                <button
                  className={"dm-toggle " + (dm ? "on" : "")}
                  aria-pressed={dm}
                  onClick={() => setDm(!dm)}
                >
                  弹<Check size={13} />
                </button>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (text.trim()) {
                      setFloatingDm({
                        id: ++dmSequence.current,
                        text: text.trim(),
                      });
                      setText("");
                      notify(
                        dm ? "弹幕已发送" : "弹幕已发送，开启弹幕即可查看",
                      );
                    }
                  }}
                >
                  <input
                    maxLength={60}
                    aria-label="发送弹幕"
                    placeholder="发个友善的弹幕见证当下"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <button type="submit">发送</button>
                </form>
              </div>
              <div className="video-actions">
                <button className={liked ? "active" : ""} onClick={like}>
                  <ThumbsUp size={27} />
                  {video.likes + (liked ? 1 : 0)}
                </button>
                <button onClick={() => notify("演示模式暂不支持投币")}>
                  <span className="coin-icon">币</span>投币
                </button>
                <button
                  aria-label={saved ? "取消收藏视频" : "收藏视频"}
                  className={saved ? "active" : ""}
                  onClick={save}
                >
                  <Star size={28} fill={saved ? "currentColor" : "none"} />
                  {saved ? "已收藏" : "收藏"}
                </button>
                <button onClick={share}>
                  <Share2 size={27} />
                  分享
                </button>
                <span>一起记录每一份热爱</span>
              </div>
              <div className="description">
                <p>{video.description}</p>
                <p className="sample-note">
                  播放说明：此站为交互复刻，当前播放公开样片「{video.mediaLabel}
                  」，并非标题所述的原视频。
                </p>
                <Link to={"/?category=" + encodeURIComponent(video.category)}>
                  {video.category}
                </Link>
                <Link to="/?category=生活">记录生活</Link>
              </div>
              <section className="comments">
                <h2>
                  评论 <small>{comments.length}</small>
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!comment.trim()) return;
                    const next = [
                      {
                        name: user?.name || "热心观众",
                        text: comment.trim(),
                        id: Date.now(),
                      },
                      ...comments,
                    ];
                    setComments(next);
                    write("bili-comments-" + id, next);
                    setComment("");
                  }}
                >
                  <div className="comment-avatar">
                    {user?.name?.slice(0, 1) || "我"}
                  </div>
                  <textarea
                    aria-label="评论内容"
                    placeholder="发一条友善的评论"
                    maxLength={500}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button className="primary" disabled={!comment.trim()}>
                    发布
                  </button>
                </form>
                {comments.length ? (
                  comments.map((c) => (
                    <div className="comment-row" key={c.id}>
                      <div className="comment-avatar">{c.name.slice(0, 1)}</div>
                      <div>
                        <strong>{c.name}</strong>
                        <p>{c.text}</p>
                        <small>刚刚 · 本地评论</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="comment-empty">
                    还没有评论，来聊聊你的感受吧～
                  </p>
                )}
              </section>
            </article>
            <aside className="detail-sidebar">
              <div className="creator">
                <Cover src={video.avatar} alt={video.author} />
                <div>
                  <strong>
                    {video.author}
                    <span>UP</span>
                  </strong>
                  <p>认真分享，热爱生活</p>
                  <button
                    onClick={() => {
                      setFollowing(!following);
                      notify(
                        following ? "已取消关注" : "已关注 " + video.author,
                      );
                    }}
                    className={following ? "followed" : ""}
                  >
                    {following ? <Check size={16} /> : <Plus size={16} />}{" "}
                    {following ? "已关注" : "关注"} <span>12.8万</span>
                  </button>
                </div>
              </div>
              <div className="related-title">
                接下来播放<span>为你推荐</span>
              </div>
              <div className="related-list">
                {video.related.map((v) => (
                  <VideoCard key={v.id} video={v} compact />
                ))}
              </div>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
function Modal({ type, close, user, login, openModal }) {
  const [name, setName] = useState(user?.name || "");
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const box = useRef();
  useEffect(() => {
    const prev = document.activeElement;
    box.current?.focus();
    const handler = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const targets = [
          ...box.current.querySelectorAll(
            "button,input,textarea,a[href],[tabindex]",
          ),
        ].filter(
          (node) =>
            !node.matches(":disabled") &&
            node.tabIndex >= 0 &&
            !node.closest("[hidden],[inert]") &&
            getComputedStyle(node).display !== "none" &&
            getComputedStyle(node).visibility !== "hidden",
        );
        e.preventDefault();
        if (!targets.length) {
          box.current.focus();
          return;
        }
        const index = targets.indexOf(document.activeElement);
        const next =
          index < 0
            ? e.shiftKey
              ? targets.length - 1
              : 0
            : (index + (e.shiftKey ? -1 : 1) + targets.length) % targets.length;
        targets[next].focus();
      }
    };
    document.addEventListener("keydown", handler);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = old;
      prev?.focus();
    };
  }, [close]);
  useEffect(() => {
    box.current?.focus();
  }, [type]);
  const titles = {
    login: user ? "个人空间" : "欢迎来到哔哩哔哩",
    navigation: "功能菜单",
    favorites: "我的收藏",
    history: "观看历史",
    messages: "消息中心",
    dynamic: "关注动态",
    vip: "大会员",
    creator: "创作中心",
    upload: "投稿",
    download: "下载客户端",
    feedback: "意见反馈",
  };
  const list =
    type === "favorites" ? read("bili-favorites") : read("bili-history");
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={box}
        tabIndex={-1}
      >
        <button className="modal-close" aria-label="关闭弹窗" onClick={close}>
          <X size={21} />
        </button>
        <h2 id="modal-title">{titles[type]}</h2>
        {type === "login" ? (
          <>
            <div className="modal-brand">
              <Logo />
            </div>
            <p className="muted">设置一个昵称，开启本地体验</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (name.trim()) login(name.trim());
              }}
            >
              <input
                aria-label="昵称"
                placeholder="请输入昵称"
                maxLength={16}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button className="primary wide" disabled={!name.trim()}>
                进入体验
              </button>
            </form>
            <p className="modal-note">仅保存在当前浏览器，不连接真实账号</p>
          </>
        ) : type === "navigation" ? (
          <div className="mobile-navigation">
            {[
              ["收藏", "favorites"],
              ["历史", "history"],
              ["大会员", "vip"],
              ["消息", "messages"],
              ["动态", "dynamic"],
              ["创作中心", "creator"],
              ["投稿", "upload"],
              ["下载客户端", "download"],
            ].map(([label, target]) => (
              <button key={target} onClick={() => openModal(target)}>
                {label}
                <ChevronRight size={16} />
              </button>
            ))}
            {["番剧", "动画", "游戏", "音乐", "运动", "知识", "生活"].map(
              (category) => (
                <Link
                  key={category}
                  to={"/?category=" + encodeURIComponent(category)}
                  onClick={close}
                >
                  {category}推荐
                  <ChevronRight size={16} />
                </Link>
              ),
            )}
          </div>
        ) : ["favorites", "history"].includes(type) ? (
          <div className="collection-list">
            {list.length ? (
              list.map((v) => (
                <Link key={v.id} to={"/video/" + v.id} onClick={close}>
                  <Cover src={v.cover} alt="" />
                  <span>{v.title}</span>
                  <ChevronRight size={16} />
                </Link>
              ))
            ) : (
              <div className="modal-empty">
                <Star size={42} />
                <p>
                  {type === "favorites"
                    ? "还没有收藏，去视频详情页收藏喜欢的内容吧"
                    : "还没有观看记录，点击首页视频开始探索吧"}
                </p>
              </div>
            )}
          </div>
        ) : type === "feedback" ? (
          submitted ? (
            <div className="modal-empty">
              <Check size={40} />
              <p>反馈已保存在本机，谢谢你的建议。</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                write("bili-feedback", [...read("bili-feedback"), feedback]);
                setSubmitted(true);
              }}
            >
              <textarea
                aria-label="反馈内容"
                placeholder="说说你希望改进的地方…"
                value={feedback}
                maxLength={1000}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <button className="primary wide" disabled={!feedback.trim()}>
                保存反馈
              </button>
              <p className="modal-note">演示模式下仅保存到当前浏览器</p>
            </form>
          )
        ) : (
          <div className="modal-empty">
            {type === "upload" || type === "creator" ? (
              <Upload size={44} />
            ) : type === "messages" ? (
              <Mail size={44} />
            ) : type === "dynamic" ? (
              <Radio size={44} />
            ) : type === "download" ? (
              <MonitorPlay size={44} />
            ) : (
              <Heart size={44} />
            )}
            <h3>
              {
                {
                  messages: "消息列表是空的",
                  dynamic: "你关注的精彩，即将在这里相遇",
                  vip: "大会员，更多好内容",
                  upload: "让更多人看见你的热爱",
                  creator: "每一份创作都值得被看见",
                  download: "随时随地，发现精彩",
                }[type]
              }
            </h3>
            <p>
              {["upload", "creator"].includes(type)
                ? "V0 提供首页与视频观看体验，暂未接入视频上传服务。"
                : type === "vip"
                  ? "这是页面演示，不提供会员购买或支付。"
                  : type === "download"
                    ? "此复刻为网页应用，可通过浏览器访问 localhost:3302。"
                    : "演示模式未连接真实账号消息与动态服务。"}
            </p>
            <button className="primary" onClick={close}>
              继续探索
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
export default App;
