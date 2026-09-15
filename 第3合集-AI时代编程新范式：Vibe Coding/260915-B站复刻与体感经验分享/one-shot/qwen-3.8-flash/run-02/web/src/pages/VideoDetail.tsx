import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RelatedCard } from "../components/VideoCard";
import { Summary, Video, fetchRelated, fetchVideo, fmtCount, fmtDate, fmtDuration } from "../api/client";

/** 详情页：真实视频源实际播放 + 真实数据 + 相关推荐 + 返回首页 */
export default function VideoDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [related, setRelated] = useState<Summary[]>([]);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setVideo(null); setRelated([]); setError(""); setLiked(false);
    window.scrollTo(0, 0);
    fetchVideo(id).then(setVideo).catch((e) => setError(String(e.message || e)));
    fetchRelated(id).then(setRelated).catch(() => {});
  }, [id]);

  if (error) {
    return (
      <div className="detail-error">
        <p>😱 视频加载失败：{error}</p>
        <button className="back-btn" onClick={() => navigate("/")}>← 返回首页</button>
      </div>
    );
  }
  if (!video) return <div className="detail-loading">加载中…</div>;

  const s = video.stats;
  return (
    <div className="detail">
      <div className="detail-main">
        <div className="detail-breadcrumb">
          <button className="back-btn" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}>← 返回</button>
          <Link to="/" className="crumb-home">首页</Link>
          <span>›</span>
          <Link to={`/?tid=${video.tid}`}>{video.tname}</Link>
        </div>

        <div className="player-frame">
          <video
            key={video.id}
            className="player"
            src={video.src}
            poster={video.cover}
            controls
            autoPlay
            muted
            playsInline
          />
          <div className="player-tip">▶ 演示播放器：真实视频源（本地 /media），点击控制条可播放/暂停/全屏</div>
        </div>

        <h1 className="detail-title">{video.title}</h1>
        <div className="detail-stats">
          <span>▶ {fmtCount(s.view)} · 发射时间：{fmtDate(video.pubdate)}</span>
          <span className="sep">|</span>
          <span>◎ {fmtCount(s.danmaku)} 弹幕 · 时长 {fmtDuration(video.duration)}</span>
        </div>

        <div className="action-row">
          <button className={"act like" + (liked ? " on" : "")} onClick={() => setLiked(!liked)}>
            👍 {fmtCount(s.like + (liked ? 1 : 0))}
          </button>
          <button className="act" title="演示：未接币系统">🪙 {fmtCount(s.coin)}</button>
          <button className="act" title="演示：本地收藏">⭐ {fmtCount(s.favorite)}</button>
          <button className="act" title="演示">↗ 分享 {fmtCount(s.share)}</button>
        </div>

        <div className="up-row">
          <img src={video.author.face} alt="" className="up-face" />
          <div className="up-info">
            <div className="up-name">{video.author.name}</div>
            <div className="up-sub">UP主 · mid {video.author.mid}（真实数据）</div>
          </div>
          <button className="follow-btn">＋ 关注</button>
        </div>

        <div className="desc-box">
          <div className="desc-label">简介</div>
          <div className="desc-text">{video.desc && video.desc !== "-" ? video.desc : "（该视频作者未填写简介）"}</div>
          <div className="tag-row">
            {video.tags.map((t) => <Link key={t} to={`/?q=${encodeURIComponent(t)}`} className="video-tag">#{t}</Link>)}
          </div>
        </div>

        <div className="comment-fake">
          <div className="comment-head">评论 {fmtCount(s.reply)}</div>
          <div className="comment-input">评论功能为复刻演示简化项（真实条数：{s.reply}）</div>
        </div>
      </div>

      <aside className="detail-side">
        <div className="side-title">相关推荐 · 真实同区视频</div>
        {related.map((v) => <RelatedCard key={v.id} v={v} />)}
      </aside>
    </div>
  );
}
