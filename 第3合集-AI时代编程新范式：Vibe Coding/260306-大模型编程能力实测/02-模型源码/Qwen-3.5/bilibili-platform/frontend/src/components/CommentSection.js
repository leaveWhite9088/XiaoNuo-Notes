import { useState, useEffect } from 'react';
import { commentApi } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

export default function CommentSection({ bvid }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const { isLogin } = useAuth();

  useEffect(() => {
    loadComments();
  }, [bvid, page]);

  async function loadComments() {
    try {
      const res = await commentApi.get(bvid, page);
      if (res.data.success) {
        setComments(res.data.data.replies || []);
      }
    } catch (error) {
      console.error('加载评论失败:', error);
    } finally {
      setLoading(false);
    }
  }

  async function submitComment() {
    if (!newComment.trim()) return;
    
    if (!isLogin) {
      alert('请先登录');
      return;
    }

    try {
      if (replyTo) {
        await commentApi.reply(bvid, replyTo.rpid, newComment);
      } else {
        await commentApi.send(bvid, newComment, 0);
      }
      setNewComment('');
      setReplyTo(null);
      loadComments();
    } catch (error) {
      alert('发送失败');
    }
  }

  function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  }

  function formatNum(num) {
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    return num;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">评论</h3>
        <span className="text-sm text-bili-gray-text">
          {comments.length} 条评论
        </span>
      </div>

      <div className="mb-6">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-bili-pink text-white flex items-center justify-center flex-shrink-0">
            {isLogin ? '我' : '游'}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyTo ? `回复 @${replyTo.member.uname}` : '发一条友善的评论'}
              className="w-full p-3 border border-bili-border rounded-md focus:outline-none focus:ring-2 focus:ring-bili-pink resize-none"
              rows={3}
            />
            <div className="flex justify-between items-center mt-2">
              {replyTo && (
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-sm text-bili-gray-text hover:text-bili-pink"
                >
                  取消回复
                </button>
              )}
              <button
                onClick={submitComment}
                className="bili-btn bili-btn-primary ml-auto"
              >
                发表评论
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-bili-gray-text">加载中...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-bili-gray-text">暂无评论，快来抢沙发吧~</div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.rpid} className="flex space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white flex items-center justify-center flex-shrink-0">
                {comment.member.uname[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-bili-text">{comment.member.uname}</span>
                  {comment.member.vip?.status && (
                    <span className="px-1.5 py-0.5 bg-bili-pink text-white text-xs rounded">大会员</span>
                  )}
                  <span className="text-xs text-bili-gray-text">{formatDate(comment.ctime)}</span>
                </div>
                <p className="mt-1 text-bili-text">{comment.content.message}</p>
                <div className="mt-2 flex items-center space-x-4 text-sm text-bili-gray-text">
                  <button 
                    onClick={() => setReplyTo(comment)}
                    className="hover:text-bili-pink"
                  >
                    回复
                  </button>
                  <span>{formatNum(comment.like)} 点赞</span>
                  {comment.reply && comment.reply.replies && comment.reply.replies.length > 0 && (
                    <span>{comment.reply.replies.length} 条回复</span>
                  )}
                </div>
                
                {comment.reply && comment.reply.replies && (
                  <div className="mt-3 space-y-3 bg-bili-gray/50 rounded-lg p-4">
                    {comment.reply.replies.slice(0, 3).map((reply) => (
                      <div key={reply.rpid} className="flex space-x-2">
                        <span className="font-medium text-bili-pink">{reply.member.uname}</span>
                        <span className="text-bili-text">{reply.content.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {comments.length > 0 && (
        <div className="mt-6 flex justify-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-bili-border rounded disabled:opacity-50 hover:bg-bili-hover"
          >
            上一页
          </button>
          <span className="px-4 py-2">{page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-bili-border rounded hover:bg-bili-hover"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
