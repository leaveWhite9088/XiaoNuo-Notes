import { Card, Tag } from 'antd';
import { PlayCircleOutlined, LikeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { VideoInfo } from '../types';
import { formatNumber, formatVideoDuration } from '../utils/format';

interface VideoCardProps {
  video: VideoInfo;
}

export const VideoCard = ({ video }: VideoCardProps) => {
  return (
    <Link to={`/video/${video.bvid}`} style={{ textDecoration: 'none' }}>
      <Card
        hoverable
        cover={
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <img
              alt={video.title}
              src={video.pic}
              style={{
                width: '100%',
                height: 160,
                objectFit: 'cover',
                borderRadius: '8px 8px 0 0',
              }}
            />
            <Tag
              style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: '#fff',
                border: 'none',
                fontSize: 12,
              }}
            >
              {formatVideoDuration(video.duration)}
            </Tag>
          </div>
        }
        bodyStyle={{ padding: '12px' }}
        style={{
          borderRadius: 8,
          border: 'none',
          background: '#fff',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        className="video-card"
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: '#18191C',
            lineHeight: 1.5,
            height: 42,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
          title={video.title}
        >
          {video.title}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: '#9499A0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ color: '#00AEEC', fontWeight: 500 }}>{video.owner.name}</span>
          <div style={{ display: 'flex', gap: 12 }}>
            <span>
              <PlayCircleOutlined style={{ marginRight: 4 }} />
              {formatNumber(video.stat.view)}
            </span>
            <span>
              <LikeOutlined style={{ marginRight: 4 }} />
              {formatNumber(video.stat.like)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};
