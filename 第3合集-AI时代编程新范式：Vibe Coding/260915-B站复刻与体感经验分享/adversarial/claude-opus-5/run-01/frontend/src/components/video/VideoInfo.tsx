import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { formatCount, formatDateTime } from '../../utils/format';
import type { VideoDetail } from '../../types';
import './VideoInfo.css';

/** 播放器上方的标题区与下方的简介 / 标签区 */
export function VideoInfo({ video, channelName }: { video: VideoDetail; channelName: string }) {
  return (
    <>
      <nav className="video-info__crumb">
        <Link to="/">首页</Link>
        <Icon name="arrowRight" size={12} />
        <Link to={`/?channel=${video.channelId}`}>{channelName}</Link>
        <Icon name="arrowRight" size={12} />
        <span>{video.partitionName}</span>
      </nav>

      <h1 className="video-info__title">{video.title}</h1>

      <div className="video-info__meta">
        <span>
          <Icon name="play" size={14} /> {formatCount(video.stat.view)} 播放
        </span>
        <span>
          <Icon name="danmaku" size={14} /> {formatCount(video.stat.danmaku)} 弹幕
        </span>
        <span>{formatDateTime(video.pubdate)}</span>
        {video.pubLocation && <span>IP 属地：{video.pubLocation}</span>}
        <span className="video-info__bvid">{video.bvid}</span>
        <span className="video-info__copyright">{video.copyright === 1 ? '自制' : '转载'}</span>
      </div>
    </>
  );
}

export function VideoDesc({ video }: { video: VideoDetail }) {
  const [expanded, setExpanded] = useState(false);
  const desc = video.desc?.trim();

  return (
    <div className="video-desc">
      <div className="video-desc__tags">
        {video.tags.map((t) => (
          <span className="video-desc__tag" key={t}>
            {t}
          </span>
        ))}
      </div>
      {desc ? (
        <>
          <p className={`video-desc__text ${expanded ? '' : 'text-clamp-2'}`}>{desc}</p>
          {desc.length > 60 && (
            <button className="video-desc__toggle" onClick={() => setExpanded((v) => !v)}>
              {expanded ? '收起' : '展开更多'}
              <Icon name="arrowDown" size={12} />
            </button>
          )}
        </>
      ) : (
        <p className="video-desc__text video-desc__text--empty">UP 主没有填写简介。</p>
      )}
    </div>
  );
}
