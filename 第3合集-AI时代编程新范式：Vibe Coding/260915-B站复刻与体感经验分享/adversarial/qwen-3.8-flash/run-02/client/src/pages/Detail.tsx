import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { CoverImg, FaceImg } from '../components/FallbackImg';
import { IconCoin, IconDanmaku, IconEye, IconLike, IconShare, IconStar } from '../components/icons';
import type { Category, DetailData, VideoComment } from '../types';
import { fmtDate, fmtDuration, fmtFullDate, fmtNum } from '../utils/format';
import { showToast } from '../utils/toast';

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<DetailData | null>(null);
  const [error, setError] = useState('');
  const [cats, setCats] = useState<Category[]>([]);
  const [liked, setLiked] = useState(false);
  const [coined, setCoined] = useState(false);
  const [faved, setFaved] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [draft, setDraft] = useState('');
  const [danmaku, setDanmaku] = useState('');
  const [descOpen, setDescOpen] = useState(false);
  const [streamBad, setStreamBad] = useState(false);
  const [playerNonce, setPlayerNonce] = useState(0);

  useEffect(() => {
    api.categories().then(setCats).catch(() => setCats([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    let dead = false;
    setData(null);
    setError('');
    setLiked(false);
    setCoined(false);
    setFaved(false);
    setFollowed(false);
    setDescOpen(false);
    setStreamBad(false);
    api
      .detail(id)
      .then((d) => {
        if (dead) return;
        setData(d);
        setComments(d.comments);
      })
      .catch((e) => {
        if (!dead) setError(e instanceof Error ? e.message : String(e));
      });
    window.scrollTo(0, 0);
    return () => {
      dead = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="empty detail-page">
        <p>视频加载失败：{error}</p>
        <p>请确认后端已启动（http://localhost:5142 ）</p>
        <Link to="/">← 返回首页</Link>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="detail-page">
        <div className="skeleton skeleton-player" />
      </div>
    );
  }

  const { video: v, related } = data;
  const catName = cats.find((c) => c.id === v.cat)?.name || v.tname;
  const descLong = v.desc.length > 88;

  const postComment = () => {
    const text = draft.trim();
    if (!text) {
      showToast('评论不能为空');
      return;
    }
    setComments((cs) => [
      { id: Date.now(), uname: '演示用户', level: 0, content: text, like: 0, ctime: Math.floor(Date.now() / 1000) },
      ...cs,
    ]);
    setDraft('');
    showToast('评论发布成功（本地演示）');
  };

  const share = () => {
    navigator.clipboard
      ?.writeText(window.location.href)
      .then(() => showToast('链接已复制'))
      .catch(() => showToast('复制失败，请手动复制地址'));
  };

  return (
    <div className="detail-page">
      <div className="detail-container">
        <div className="detail-main">
          <div className="crumbs">
            <Link to="/">首页</Link>
            <span> / </span>
            <Link to={`/?cat=${v.cat}`}>{catName}</Link>
            <span> / </span>
            <span className="crumb-cur">{v.tname || catName}</span>
          </div>

          <div className="player-wrap">
            <video
              key={`${v.bvid}-${playerNonce}`}
              className="player"
              src={v.stream}
              poster={v.pic}
              controls
              autoPlay
              muted
              playsInline
              onError={() => setStreamBad(true)}
            />
            {streamBad && (
              <div className="stream-error">
                <b>演示播放流不可达</b>
                <p>
                  详情页使用开放示例视频（media.w3.org / test-videos.co.uk），当前网络可能无法访问；
                  封面、标题、UP 主与播放数据仍为 B 站真实快照
                </p>
                <button
                  onClick={() => {
                    setStreamBad(false);
                    setPlayerNonce((n) => n + 1);
                  }}
                >
                  重试播放
                </button>
              </div>
            )}
          </div>

          <div className="danmaku-bar">
            <IconDanmaku width={16} height={16} />
            <input
              value={danmaku}
              onChange={(e) => setDanmaku(e.target.value)}
              placeholder="发个友善的弹幕见证当下～"
              onKeyDown={(e) => e.key === 'Enter' && danmaku.trim() && (showToast('弹幕发送成功（演示）'), setDanmaku(''))}
            />
            <button
              onClick={() => {
                if (!danmaku.trim()) return showToast('弹幕内容为空');
                showToast('弹幕发送成功（演示）');
                setDanmaku('');
              }}
            >
              发送
            </button>
            <span className="dm-count">弹幕 {fmtNum(v.stat.danmaku)}</span>
          </div>

          <h1 className="detail-title">{v.title}</h1>
          <div className="detail-meta">
            <span className="bvid-tag">{v.bvid}</span>
            <span>{fmtFullDate(v.pubdate)}</span>
            <span className="tname-tag">{v.tname}</span>
            <span className="meta-views">
              <IconEye width={15} height={15} /> {fmtNum(v.stat.view)}
              <IconDanmaku width={15} height={15} /> {fmtNum(v.stat.danmaku)}
            </span>
          </div>

          <div className="action-bar">
            <button
              className={`action ${liked ? 'action-on' : ''}`}
              onClick={() => {
                setLiked(!liked);
                showToast(liked ? '已取消点赞' : '点赞成功 +1');
              }}
            >
              <IconLike /> {fmtNum(v.stat.like + (liked ? 1 : 0))}
              <i>点赞</i>
            </button>
            <button
              className={`action ${coined ? 'action-on' : ''}`}
              onClick={() => {
                if (coined) return;
                setCoined(true);
                showToast('投币成功 -1 枚');
              }}
            >
              <IconCoin /> {fmtNum(v.stat.coin + (coined ? 1 : 0))}
              <i>投币</i>
            </button>
            <button
              className={`action ${faved ? 'action-on' : ''}`}
              onClick={() => {
                setFaved(!faved);
                showToast(faved ? '已取消收藏' : '收藏成功');
              }}
            >
              <IconStar /> {fmtNum(v.stat.favorite + (faved ? 1 : 0))}
              <i>收藏</i>
            </button>
            <button className="action" onClick={share}>
              <IconShare /> {fmtNum(v.stat.share)}
              <i>分享</i>
            </button>
          </div>

          <div className="up-row">
            <FaceImg className="up-face" src={v.owner.face} alt={v.owner.name} />
            <div className="up-info">
              <b>{v.owner.name}</b>
              <i>
                点赞 {fmtNum(v.stat.like)} · 弹幕 {fmtNum(v.stat.danmaku)}
              </i>
            </div>
            <button
              className={followed ? 'follow followed' : 'follow'}
              onClick={() => {
                setFollowed(!followed);
                showToast(followed ? `已取消关注 ${v.owner.name}` : `关注成功：${v.owner.name}`);
              }}
            >
              {followed ? '已关注' : '+ 关注'}
            </button>
          </div>

          <div className="intro">
            <div className="intro-title">简介</div>
            <p className={descOpen || !descLong ? '' : 'clamp'}>{v.desc || '这是一条空简介'}</p>
            {descLong && (
              <button className="link-btn" onClick={() => setDescOpen(!descOpen)}>
                {descOpen ? '展开收起 ▲' : '展开全部 ▼'}
              </button>
            )}
          </div>

          <section className="comments">
            <h2>
              评论 <em>{comments.length}</em>
            </h2>
            <div className="comment-post">
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="发一条友善的评论（本地演示，不上传）" />
              <div className="comment-post-foot">
                <button onClick={postComment}>发布</button>
              </div>
            </div>
            <ul className="comment-list">
              {comments.map((c) => (
                <li key={c.id}>
                  <div className="c-face">{c.uname.slice(0, 1)}</div>
                  <div className="c-body">
                    <div className="c-head">
                      <b>{c.uname}</b>
                      <span className="lv">Lv{c.level}</span>
                    </div>
                    <p>{c.content}</p>
                    <div className="c-foot">
                      <span>{fmtDate(c.ctime)}</span>
                      <button onClick={() => showToast('已点赞该评论（本地演示）')}>
                        <IconLike width={14} height={14} /> {fmtNum(c.like)}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="detail-aside">
          <h2>相关推荐</h2>
          <div className="rel-list">
            {related.map((r) => (
              <div key={r.id} className="rel-card" onClick={() => navigate(`/video/${r.id}`)}>
                <div className="rel-cover">
                  <CoverImg src={r.pic} alt={r.title} />
                  <span className="duration">{fmtDuration(r.duration)}</span>
                </div>
                <div className="rel-body">
                  <h3>{r.title}</h3>
                  <p>
                    {r.owner.name} · <IconEye width={13} height={13} /> {fmtNum(r.stat.view)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link className="back-home" to="/">
            ← 返回首页
          </Link>
        </aside>
      </div>
    </div>
  );
}
