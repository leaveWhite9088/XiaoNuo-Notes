/**
 * 播放页：左侧标题 / 播放器 / 互动 / 简介 / 评论，右侧 UP 主卡片与相关推荐。
 * 进入时写入观看历史，顶部面包屑可直接返回首页或回到对应分区。
 */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AppHeader } from '../components/layout/AppHeader';
import { AppFooter } from '../components/layout/AppFooter';
import { SideToolbar } from '../components/layout/SideToolbar';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { ActionBar } from '../components/video/ActionBar';
import { UpCard } from '../components/video/UpCard';
import { RelatedList } from '../components/video/RelatedList';
import { CommentSection } from '../components/video/CommentSection';
import { Icon } from '../components/common/Icon';
import { fetchDanmaku, fetchVideo, sendDanmaku } from '../api/bili';
import { useAsync } from '../hooks/useAsync';
import { formatCount, formatDateTime } from '../utils/format';
import { pushWatchHistory } from '../utils/watchHistory';
import type { DanmakuItem } from '../types';
import './video.css';

export function VideoPage() {
  const { bvid = '' } = useParams();
  const [wide, setWide] = useState(false);
  const [descOpen, setDescOpen] = useState(false);

  const { data: video, loading, error } = useAsync(() => fetchVideo(bvid), [bvid]);
  const { data: danmaku } = useAsync(() => fetchDanmaku(bvid), [bvid]);

  useEffect(() => {
    if (video) {
      document.title = `${video.title}_哔哩哔哩_bilibili`;
      pushWatchHistory(video);
    }
    return () => {
      document.title = '哔哩哔哩 (゜-゜)つロ 干杯~-bilibili';
    };
  }, [video]);

  const onSendDanmaku = async (text: string, progress: number): Promise<DanmakuItem | null> => {
    try {
      return await sendDanmaku(bvid, { text, p: progress });
    } catch {
      return null;
    }
  };

  return (
    <div className="video-page">
      <AppHeader />

      {error && <div className="video-page__error">加载失败：{error}</div>}

      {loading && !video && (
        <div className="video-page__main container">
          <div className="video-page__left">
            <div className="skeleton" style={{ height: 28, width: '60%' }} />
            <div className="skeleton" style={{ aspectRatio: '16 / 9', marginTop: 16 }} />
          </div>
        </div>
      )}

      {video && (
        <main className={`video-page__main container ${wide ? 'is-wide' : ''}`}>
          <div className="video-page__left">
            <nav className="video-page__crumb">
              <Link to="/">
                <Icon name="chevron-left" size={14} /> 返回首页
              </Link>
              <span>/</span>
              <Link to={`/?channel=${video.channelId}`}>{video.channelName}</Link>
              <span>/</span>
              <span className="video-page__crumb-current">{video.subChannel}</span>
            </nav>

            <h1 className="video-page__title">{video.title}</h1>

            <div className="video-page__meta">
              <span>
                <Icon name="view" size={14} /> {formatCount(video.stats.view)}
              </span>
              <span>
                <Icon name="danmaku" size={14} /> {formatCount(video.stats.danmaku)}
              </span>
              <span>{formatDateTime(video.publishedAt)}</span>
              <span className="video-page__bvid">{video.bvid}</span>
              <span className="video-page__copyright">
                {video.copyright === '自制' ? '未经作者授权 禁止转载' : '转载稿件'}
              </span>
            </div>

            <VideoPlayer
              src={video.videoUrl}
              poster={video.cover}
              danmaku={danmaku ?? []}
              wide={wide}
              onToggleWide={() => setWide((v) => !v)}
              onSendDanmaku={onSendDanmaku}
            />

            <ActionBar
              bvid={video.bvid}
              stats={{
                like: video.stats.like,
                coin: video.stats.coin,
                favorite: video.stats.favorite,
                share: video.stats.share,
              }}
            />

            <section className={`video-page__desc ${descOpen ? 'is-open' : ''}`}>
              <p>{video.desc}</p>
              <div className="video-page__tags">
                {video.tags.map((tag) => (
                  <Link key={tag} to={`/search?keyword=${encodeURIComponent(tag)}`}>
                    {tag}
                  </Link>
                ))}
              </div>
              <button className="video-page__desc-toggle" onClick={() => setDescOpen((v) => !v)}>
                {descOpen ? '收起' : '展开更多'}
                <Icon name={descOpen ? 'chevron-up' : 'chevron-down'} size={12} />
              </button>
            </section>

            <CommentSection bvid={video.bvid} replyCount={video.stats.reply} />
          </div>

          <aside className="video-page__right">
            <UpCard up={video.up} channelName={video.channelName} />
            <RelatedList videos={video.related} currentBvid={video.bvid} />
          </aside>
        </main>
      )}

      <SideToolbar />
      <AppFooter />
    </div>
  );
}
