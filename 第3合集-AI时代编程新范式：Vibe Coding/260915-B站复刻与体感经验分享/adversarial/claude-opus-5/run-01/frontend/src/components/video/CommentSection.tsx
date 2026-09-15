import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import { Icon } from '../common/Icon';
import { formatCount, formatRelativeTime } from '../../utils/format';
import type { Comment } from '../../types';
import './CommentSection.css';

type SortKey = 'hot' | 'time';

/** 评论区：最热 / 最新切换、点赞、发表（本地态） */
export function CommentSection({ bvid, total }: { bvid: string; total: number }) {
  const [sort, setSort] = useState<SortKey>('hot');
  const [draft, setDraft] = useState('');
  const [mine, setMine] = useState<Comment[]>([]);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const { data = [], isLoading } = useQuery({
    queryKey: ['comments', bvid, sort],
    queryFn: () => api.comments(bvid, sort),
  });

  const comments = [...mine, ...data];

  const publish = () => {
    const content = draft.trim();
    if (!content) return;
    setMine((prev) => [
      {
        id: `local-${Date.now()}`,
        bvid,
        content,
        like: 0,
        replyCount: 0,
        ctime: Math.floor(Date.now() / 1000),
        user: { mid: 0, name: '干杯的旅行者', face: '/media/avatars/mine.jpg', level: 6 },
      },
      ...prev,
    ]);
    setDraft('');
  };

  return (
    <section className="comments">
      <header className="comments__header">
        <h3>
          评论 <span>{formatCount(total + mine.length)}</span>
        </h3>
        <div className="comments__sort">
          <button className={sort === 'hot' ? 'is-active' : ''} onClick={() => setSort('hot')}>
            最热
          </button>
          <i />
          <button className={sort === 'time' ? 'is-active' : ''} onClick={() => setSort('time')}>
            最新
          </button>
        </div>
      </header>

      <div className="comments__editor">
        <img src="/media/avatars/mine.jpg" alt="" className="comments__avatar" />
        <input
          value={draft}
          placeholder="发一条友善的评论"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && publish()}
        />
        <button className="comments__publish" onClick={publish}>
          发布
        </button>
      </div>

      {isLoading && <div className="comments__hint">评论加载中…</div>}

      <ul className="comments__list">
        {comments.map((c) => (
          <li className="comment" key={c.id}>
            <img className="comments__avatar" src={c.user.face} alt="" loading="lazy" />
            <div className="comment__body">
              <div className="comment__name">
                {c.user.name}
                <span className="comment__level">LV{c.user.level}</span>
              </div>
              <p className="comment__content">{c.content}</p>
              <div className="comment__meta">
                <span>{formatRelativeTime(c.ctime)}</span>
                <button
                  className={liked[c.id] ? 'is-liked' : ''}
                  onClick={() => setLiked((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                >
                  <Icon name="like" size={14} /> {formatCount(c.like + (liked[c.id] ? 1 : 0))}
                </button>
                <button>
                  <Icon name="reply" size={14} /> 回复{c.replyCount ? ` ${c.replyCount}` : ''}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
