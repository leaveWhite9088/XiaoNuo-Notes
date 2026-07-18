import React, { useState, useEffect } from 'react';
import { Comment } from '../../types';
import { Button } from '../common';
import { useAuth } from '../../contexts/AuthContext';
import { commentApi } from '../../services/api';

interface CommentSectionProps {
  bvid: string;
  commentsPerPage?: number;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ bvid, commentsPerPage = 20 }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [replyTo, setReplyTo] = useState<{ rpid: number; uname: string } | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments(1);
  }, [bvid]);

  const fetchComments = async (pageNum: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await commentApi.getComments(bvid, pageNum);
      if (res.code === 0) {
        setComments(prev => pageNum === 1 ? res.data.list : [...prev, ...res.data.list]);
        setHasMore(res.data.list.length >= commentsPerPage);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;
    setSubmitting(true);
    try {
      const res = await commentApi.sendComment(bvid, newComment, replyTo?.rpid);
      if (res.code === 0) {
        setNewComment('');
        setReplyTo(null);
        fetchComments(1);
      } else {
        alert(res.message || '发送失败');
      }
    } catch (error) {
      console.error('Failed to send comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (rpid: number) => {
    if (!user) return;
    try {
      await commentApi.likeComment(rpid, 'add');
      setComments(prev => prev.map(comment => {
        if (comment.rpid === rpid) {
          return { ...comment, like: comment.like + 1, up_like: true };
        }
        return comment;
      }));
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const formatTime = (timestamp: number): string => {
    const diff = Math.floor((Date.now() / 1000 - timestamp) / 60);
    if (diff < 1) return '刚刚';
    if (diff < 60) return `${diff}分钟前`;
    if (diff < 1440) return `${Math.floor(diff / 60)}小时前`;
    if (diff < 10080) return `${Math.floor(diff / 1440)}天前`;
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const renderComment = (comment: Comment) => (
    <div key={comment.rpid} className="py-4 border-b border-bili-border last:border-0">
      <div className="flex gap-3">
        <img
          src={comment.member.avatar || '/default-avatar.png'}
          alt={comment.member.uname}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-bili-text">{comment.member.uname}</span>
            <span className="text-xs text-bili-text-gray">
              Lv.{comment.member.level_info.current_level}
            </span>
            {comment.is_up && (
              <span className="text-xs px-1.5 py-0.5 bg-bili-pink text-white rounded">UP主</span>
            )}
            <span className="text-xs text-bili-text-gray">{formatTime(comment.ctime)}</span>
          </div>
          <p className="text-bili-text mb-2 whitespace-pre-wrap break-words">{comment.content}</p>
          <div className="flex items-center gap-4 text-sm text-bili-text-gray">
            <button
              onClick={() => user && handleLike(comment.rpid)}
              className={`flex items-center gap-1 hover:text-bili-pink ${comment.up_like ? 'text-bili-pink' : ''}`}
            >
              <svg className="w-4 h-4" fill={comment.up_like ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span>{comment.like}</span>
            </button>
            <button
              onClick={() => user && setReplyTo({ rpid: comment.rpid, uname: comment.member.uname })}
              className="flex items-center gap-1 hover:text-bili-pink"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span>回复</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="comment-section">
      <h3 className="text-lg font-bold text-bili-text mb-4">评论 ({comments.length})</h3>

      {user ? (
        <div className="mb-6">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-sm text-bili-text-gray">
              <span>回复 @{replyTo.uname}</span>
              <button onClick={() => setReplyTo(null)} className="text-bili-pink">取消</button>
            </div>
          )}
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="发表你的看法..."
            className="w-full px-3 py-2 border border-bili-border rounded-lg focus:outline-none focus:border-bili-pink resize-none"
            rows={3}
          />
          <div className="mt-2 flex justify-end">
            <Button
              onClick={handleSubmitComment}
              loading={submitting}
              disabled={!newComment.trim()}
            >
              发表评论
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-bili-bg rounded text-center text-bili-text-gray">
          请<a href="/login" className="text-bili-pink">登录</a>后发表评论
        </div>
      )}

      <div className="space-y-4">
        {comments.map(renderComment)}
      </div>

      {hasMore && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={() => fetchComments(page + 1)}
            loading={loading}
          >
            加载更多
          </Button>
        </div>
      )}
    </div>
  );
};