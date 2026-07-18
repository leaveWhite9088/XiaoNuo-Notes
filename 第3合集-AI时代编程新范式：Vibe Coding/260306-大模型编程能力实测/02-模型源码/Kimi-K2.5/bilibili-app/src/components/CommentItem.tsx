import { Avatar, Button, Space } from 'antd';
import { LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import type { Comment } from '../types';
import { formatTime } from '../utils/format';

interface CommentItemProps {
  comment: Comment;
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  const levelColors = ['#BFBFBF', '#BFBFBF', '#95D475', '#FB7299', '#FBC32A'];
  const levelColor = levelColors[comment.member?.level_info?.current_level || 0] || '#BFBFBF';

  return (
    <div style={{ display: 'flex', padding: '16px 0', borderBottom: '1px solid #E3E5E7' }}>
      <Avatar
        src={comment.member?.avatar}
        size={48}
        style={{ marginRight: 16, flexShrink: 0 }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <span
            style={{
              color: '#FB7299',
              fontSize: 14,
              fontWeight: 500,
              marginRight: 8,
            }}
          >
            {comment.member?.uname}
          </span>
          <span
            style={{
              backgroundColor: levelColor,
              color: '#fff',
              fontSize: 10,
              padding: '0 6px',
              borderRadius: 4,
              height: 16,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            LV{comment.member?.level_info?.current_level || 0}
          </span>
        </div>
        <div
          style={{
            fontSize: 14,
            color: '#18191C',
            lineHeight: 1.6,
            marginBottom: 8,
            wordBreak: 'break-word',
          }}
          dangerouslySetInnerHTML={{ __html: comment.message }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            color: '#9499A0',
          }}
        >
          <span>{formatTime(comment.ctime)}</span>
          <Space size={16}>
            <Button type="text" size="small" icon={<LikeOutlined />} style={{ color: '#9499A0' }}>
              {comment.like || '点赞'}
            </Button>
            <Button type="text" size="small" icon={<DislikeOutlined />} style={{ color: '#9499A0' }}>
              踩
            </Button>
            {comment.rcount > 0 && (
              <Button type="text" size="small" style={{ color: '#00AEEC' }}>
                {comment.rcount}条回复
              </Button>
            )}
          </Space>
        </div>
      </div>
    </div>
  );
};
