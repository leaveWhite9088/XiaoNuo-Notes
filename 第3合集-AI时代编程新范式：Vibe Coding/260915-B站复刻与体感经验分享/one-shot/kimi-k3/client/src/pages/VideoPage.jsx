import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import DanmakuLayer from '../components/DanmakuLayer.jsx';
import { formatCount, formatDuration, formatTime } from '../utils/format.js';

function ActionButton({ icon, label, count, active, onClick }) {
  return (
    <button className={`action-btn ${active ? 'on' : ''}`} onClick={onClick}>
      {icon}
      <span className="action-text">{count != null ? formatCount(count) : label}</span>
    </button>
  );
}

export default function VideoPage() {
  const { bvid } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [playing, setPlaying] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [danmakuOn, setDanmakuOn] = useState(true);
  const [myDanmaku, setMyDanmaku] = useState('');
  const [sent, setSent] = useState([]);
  const [liked, setLiked] = useState(false);
  const [coined, setCoined] = useState(false);
  const [faved, setFaved] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [sortHot, setSortHot] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [myComments, setMyComments] = useState([]);
  const videoRef = useRef(null);

  useEffect(() => {
    setData(null);
    setError('');
    setLiked(false); setCoined(false); setFaved(false); setFollowed(false);
    setMyComments([]);
    setDescOpen(false);
    window.scrollTo(0, 0);
    api.video(bvid).then(setData).catch(() => setError('视频走丢了…回到首页再看看吧'));
  }, [bvid]);

  if (error) {
    return (
      <main className="video-page">
        <div className="empty-state">
          <div className="empty-text">{error}</div>
          <Link className="clear-search" to="/">返回首页</Link>
        </div>
      </main>
    );
  }
  if (!data) return <main className="video-page"><div className="loading-text">加载中…</div></main>;

  const comments = [...myComments, ...data.comments].sort((a, b) =>
    sortHot ? b.likes - a.likes : b.time - a.time
  );

  const sendDanmaku = () => {
    const text = myDanmaku.trim();
    if (!text) return;
    setSent((old) => [...old, { id: Date.now(), text, top: 10 + Math.random() * 50 }]);
    setMyDanmaku('');
  };

  const postComment = () => {
    const text = commentText.trim();
    if (!text) return;
    setMyComments((old) => [
      {
        id: `me-${Date.now()}`,
        user: { name: 'bili_260909', avatar: 'https://picsum.photos/seed/me-avatar/80/80' },
        content: text,
        likes: 0,
        time: Date.now(),
        replies: []
      },
      ...old
    ]);
    setCommentText('');
  };

  return (
    <main className="video-page">
      <div className="crumb">
        <Link to="/">首页</Link>
        <span className="crumb-sep">›</span>
        <span>{data.category}</span>
        <span className="crumb-sep">›</span>
        <span className="crumb-bvid">{data.bvid}</span>
      </div>

      <div className="video-layout">
        <div className="video-main">
          <h1 className="video-title">{data.title}</h1>
          <div className="video-stats-line">
            <span>{formatCount(data.views)} 播放</span>
            <span>{formatCount(data.danmaku)} 弹幕</span>
            <span>{formatTime(data.pubdate)}</span>
            <span className="bvid-text">{data.bvid}</span>
          </div>

          <div className="player-wrap">
            <video
              ref={videoRef}
              className="player"
              src={data.videoUrl}
              poster={data.cover}
              controls
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
            {danmakuOn && <DanmakuLayer playing={playing} />}
            {danmakuOn &&
              sent.map((d) => (
                <span
                  key={d.id}
                  className="danmaku mine"
                  style={{ top: `${d.top}%`, animationDuration: '7s' }}
                >
                  {d.text}
                </span>
              ))}
          </div>

          <div className="danmaku-bar">
            <button
              className={`danmaku-toggle ${danmakuOn ? 'on' : ''}`}
              onClick={() => setDanmakuOn(!danmakuOn)}
            >
              弹幕{danmakuOn ? '开' : '关'}
            </button>
            <input
              className="danmaku-input"
              placeholder="发个弹幕见证当下"
              value={myDanmaku}
              onChange={(e) => setMyDanmaku(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendDanmaku()}
            />
            <button className="danmaku-send" onClick={sendDanmaku}>发送</button>
          </div>

          <div className="action-bar">
            <ActionButton
              active={liked}
              count={data.likes + (liked ? 1 : 0)}
              onClick={() => setLiked(!liked)}
              icon={<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M2 10h4v11H2zM22 11a2 2 0 0 0-2-2h-5.3l1-4.4A2.3 2.3 0 0 0 13.4 2L8 9v12h10.4a2 2 0 0 0 2-1.6l1.5-7A2 2 0 0 0 22 11z" /></svg>}
            />
            <ActionButton
              active={coined}
              count={data.coins + (coined ? 1 : 0)}
              onClick={() => setCoined(!coined)}
              icon={<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">币</text></svg>}
            />
            <ActionButton
              active={faved}
              count={data.favs + (faved ? 1 : 0)}
              onClick={() => setFaved(!faved)}
              icon={<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" /></svg>}
            />
            <ActionButton
              label="分享"
              count={data.shares}
              onClick={() => alert('链接已复制（演示）：https://www.bilibili.com/video/' + data.bvid)}
              icon={<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M14 5v3C7 9 4 14 3 19c2-3 5-5 11-5v3l7-6z" /></svg>}
            />
          </div>

          <div className={`desc-box ${descOpen ? 'open' : ''}`} onClick={() => setDescOpen(!descOpen)}>
            <div className="desc-tags">
              {data.tags.map((t) => <span key={t} className="tag">#{t}</span>)}
            </div>
            <p className="desc-text">{data.desc}</p>
            <span className="desc-toggle">{descOpen ? '收起' : '展开更多'}</span>
          </div>

          <div className="comment-section">
            <div className="comment-header">
              <span className="comment-count">{comments.length} 评论</span>
              <button className={`sort-tab ${sortHot ? 'on' : ''}`} onClick={() => setSortHot(true)}>最热</button>
              <button className={`sort-tab ${!sortHot ? 'on' : ''}`} onClick={() => setSortHot(false)}>最新</button>
            </div>
            <div className="comment-editor">
              <img className="comment-avatar" src="https://picsum.photos/seed/me-avatar/80/80" alt="我" />
              <input
                className="comment-input"
                placeholder="发一条友善的评论"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && postComment()}
              />
              <button className="comment-post" onClick={postComment}>发布</button>
            </div>
            {comments.map((c) => (
              <div key={c.id} className="comment">
                <img className="comment-avatar" src={c.user.avatar} alt={c.user.name} />
                <div className="comment-body">
                  <div className="comment-user">{c.user.name}</div>
                  <div className="comment-content">{c.content}</div>
                  <div className="comment-meta">
                    <span>{formatTime(c.time)}</span>
                    <span className="comment-like">👍 {formatCount(c.likes)}</span>
                    <span className="comment-reply">回复</span>
                  </div>
                  {c.replies.map((r) => (
                    <div key={r.id} className="comment reply">
                      <img className="comment-avatar small" src={r.user.avatar} alt={r.user.name} />
                      <div className="comment-body">
                        <div className="comment-user">{r.user.name}</div>
                        <div className="comment-content">{r.content}</div>
                        <div className="comment-meta">
                          <span>{formatTime(r.time)}</span>
                          <span className="comment-like">👍 {formatCount(r.likes)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="video-side">
          <div className="up-card">
            <img className="up-avatar" src={data.up.avatar} alt={data.up.name} />
            <div className="up-info">
              <div className="up-name">{data.up.name}</div>
              <div className="up-fans">{formatCount(data.up.fans)} 粉丝</div>
            </div>
            <button
              className={`follow-btn ${followed ? 'on' : ''}`}
              onClick={() => setFollowed(!followed)}
            >
              {followed ? '已关注' : '+ 关注'}
            </button>
          </div>

          <div className="related-title">接下来播放</div>
          <div className="related-list">
            {data.related.map((r) => (
              <div key={r.bvid} className="related-item" onClick={() => navigate(`/video/${r.bvid}`)}>
                <div className="related-cover-wrap">
                  <img className="related-cover" src={r.cover} alt={r.title} loading="lazy" />
                  <span className="duration-badge small">{formatDuration(r.duration)}</span>
                </div>
                <div className="related-info">
                  <div className="related-vtitle">{r.title}</div>
                  <div className="related-up">{r.up.name}</div>
                  <div className="related-meta">
                    {formatCount(r.views)} 播放 · {formatCount(r.danmaku)} 弹幕
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
