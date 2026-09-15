/**
 * 评论区：评论输入框 + 热评列表（楼中楼回复、点赞、加载更多）。
 * 数据来自 /api/videos/:bvid/comments，点赞只在前端本地生效。
 */
import { useEffect, useState } from 'react';
import { fetchComments } from '../../api/bili';
import { formatCount, formatRelativeTime } from '../../utils/format';
import { Icon } from '../common/Icon';
import type { Comment } from '../../types';
import './comment-section.css';

interface Props {
  bvid: string;
  replyCount: number;
}

export function CommentSection({ bvid, replyCount }: Props) {
  const [items, setItems] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [sort, setSort] = useState<'hot' | 'time'>('hot');

  useEffect(() => {
    setItems([]);
    setPage(1);
  }, [bvid]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchComments(bvid, page)
      .then((res) => {
        if (!alive) return;
        setItems((prev) => (page === 1 ? res.items : [...prev, ...res.items]));
        setHasMore(res.hasMore);
        setLoading(false);
      })
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [bvid, page]);

  const publish = () => {
    const content = draft.trim();
    if (!content) return;
    const mine: Comment = {
      id: `local-${Date.now()}`,
      user: { name: '哔哩哔哩用户', avatar: '/media/avatars/avatar-7.jpg', level: 6, isVip: true },
      content,
      likes: 0,
      dislikes: 0,
      publishedAt: new Date().toISOString(),
      top: false,
      replies: [],
    };
    setItems((prev) => [mine, ...prev]);
    setDraft('');
  };

  const sorted =
    sort === 'hot'
      ? items
      : [...items].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

  return (
    <section className="comments">
      <header className="comments__head">
        <h3>
          评论 <span>{formatCount(replyCount)}</span>
        </h3>
        <div className="comments__sort">
          <button className={sort === 'hot' ? 'is-active' : ''} onClick={() => setSort('hot')}>
            最热
          </button>
          <i>|</i>
          <button className={sort === 'time' ? 'is-active' : ''} onClick={() => setSort('time')}>
            最新
          </button>
        </div>
      </header>

      <div className="comments__editor">
        <img src="/media/avatars/avatar-7.jpg" alt="我的头像" />
        <div className="comments__input">
          <input
            value={draft}
            placeholder="发一条友善的评论"
            maxLength={120}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && publish()}
          />
          <button onClick={publish} disabled={!draft.trim()}>
            发布
          </button>
        </div>
      </div>

      <ul className="comments__list">
        {sorted.map((comment) => (
          <li key={comment.id} className="comment">
            <img className="comment__avatar" src={comment.user.avatar} alt="" loading="lazy" />
            <div className="comment__body">
              <div className="comment__name">
                <span className={comment.user.isVip ? 'is-vip' : ''}>{comment.user.name}</span>
                <i className="comment__level">LV{comment.user.level}</i>
                {comment.top && <i className="comment__top">置顶</i>}
              </div>
              <p className="comment__text">{comment.content}</p>
              <div className="comment__meta">
                <span>{formatRelativeTime(comment.publishedAt)}</span>
                <button
                  className={liked[comment.id] ? 'is-liked' : ''}
                  onClick={() => setLiked((prev) => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                >
                  <Icon name="like" size={14} />
                  {formatCount(comment.likes + (liked[comment.id] ? 1 : 0))}
                </button>
                <button>
                  <Icon name="dislike" size={14} />
                </button>
                <button>回复</button>
              </div>

              {comment.replies.length > 0 && (
                <ul className="comment__replies">
                  {comment.replies.map((reply) => (
                    <li key={reply.id}>
                      <img src={reply.user.avatar} alt="" loading="lazy" />
                      <div>
                        <span className="comment__reply-name">{reply.user.name}</span>
                        <span className="comment__reply-text">：{reply.content}</span>
                        <div className="comment__meta comment__meta--reply">
                          <span>{formatRelativeTime(reply.publishedAt)}</span>
                          <span>{formatCount(reply.likes)} 赞</span>
                          <button>回复</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="comments__footer">
        {loading && <span>评论加载中…</span>}
        {!loading && hasMore && (
          <button className="comments__more" onClick={() => setPage((p) => p + 1)}>
            点击查看更多评论
          </button>
        )}
        {!loading && !hasMore && items.length > 0 && <span>已经到底啦 ~</span>}
      </div>
    </section>
  );
}
