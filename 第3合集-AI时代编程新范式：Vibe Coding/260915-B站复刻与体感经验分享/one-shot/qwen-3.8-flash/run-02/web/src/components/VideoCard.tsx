import { Link, useNavigate } from "react-router-dom";
import { Summary, fmtCount, fmtDuration } from "../api/client";

/** 首页视频卡片：hover 时封面放大 + 浮层数据 + 标题变粉 */
export default function VideoCard({ v }: { v: Summary }) {
  const navigate = useNavigate();
  return (
    <div
      className="video-card"
      onClick={() => navigate(`/video/${v.id}`)}
      title={v.title}
      role="link"
    >
      <div className="cover-wrap">
        <img className="cover" src={v.cover} alt={v.title} loading="lazy" />
        <span className="duration">{fmtDuration(v.duration)}</span>
        <div className="hover-mask">
          <span>▶ {fmtCount(v.stats.view)} 播放</span>
          <span>✎ {fmtCount(v.stats.danmaku)} 弹幕</span>
        </div>
      </div>
      <div className="card-title">{v.title}</div>
      <div className="card-meta">
        <img className="card-face" src={v.author.face} alt="" loading="lazy" onClick={(e) => e.stopPropagation()} />
        <span className="card-up">{v.author.name}</span>
        <span className="card-stats">{fmtCount(v.stats.view)}播放 · {fmtCount(v.stats.danmaku)}弹幕</span>
      </div>
    </div>
  );
}

/** 详情页右侧相关推荐小卡 */
export function RelatedCard({ v }: { v: Summary }) {
  return (
    <Link to={`/video/${v.id}`} className="related-card" title={v.title}>
      <div className="related-cover">
        <img src={v.cover} alt={v.title} loading="lazy" />
        <span className="duration">{fmtDuration(v.duration)}</span>
      </div>
      <div className="related-info">
        <div className="related-title">{v.title}</div>
        <div className="related-up">{v.author.name}</div>
        <div className="related-stats">{fmtCount(v.stats.view)}播放 · {fmtCount(v.stats.danmaku)}弹幕</div>
      </div>
    </Link>
  );
}
