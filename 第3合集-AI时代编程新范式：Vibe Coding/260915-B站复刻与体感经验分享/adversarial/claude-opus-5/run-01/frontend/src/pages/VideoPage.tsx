import { useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/endpoints';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { VideoInfo, VideoDesc } from '../components/video/VideoInfo';
import { ActionBar } from '../components/video/ActionBar';
import { UpCard } from '../components/video/UpCard';
import { RelatedList } from '../components/video/RelatedList';
import { CommentSection } from '../components/video/CommentSection';
import { Icon } from '../components/common/Icon';
import './VideoPage.css';

export function VideoPage() {
  const { bvid = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const progressRef = useRef(0);
  // React.StrictMode 开发模式下 effect 会挂载两次，用 ref 保证同一次进入只上报一次播放
  const reportedRef = useRef<string | null>(null);

  const video = useQuery({ queryKey: ['video', bvid], queryFn: () => api.video(bvid), enabled: Boolean(bvid) });
  const related = useQuery({ queryKey: ['related', bvid], queryFn: () => api.related(bvid, 12), enabled: Boolean(bvid) });
  const danmaku = useQuery({ queryKey: ['danmaku', bvid], queryFn: () => api.danmaku(bvid), enabled: Boolean(bvid) });
  const channels = useQuery({ queryKey: ['channels'], queryFn: api.channels });

  // 进入播放页上报一次播放（播放量 +1）；离开时只把最后进度写进观看历史，不再计播放
  useEffect(() => {
    if (!bvid) return;
    if (reportedRef.current !== bvid) {
      reportedRef.current = bvid;
      progressRef.current = 0;
      api
        .reportPlay(bvid)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['me', 'history'] });
          queryClient.invalidateQueries({ queryKey: ['video', bvid] });
        })
        .catch(() => undefined);
    }
    return () => {
      if (progressRef.current > 0) {
        api.reportProgress(bvid, progressRef.current).catch(() => undefined);
        queryClient.invalidateQueries({ queryKey: ['me', 'history'] });
      }
    };
  }, [bvid, queryClient]);

  if (video.isLoading) {
    return (
      <div className="video-page">
        <div className="video-page__inner container">
          <div className="video-page__main">
            <div className="skeleton video-page__skeleton-player" />
            <div className="skeleton video-page__skeleton-line" />
          </div>
          <aside className="video-page__side">
            <div className="skeleton video-page__skeleton-side" />
          </aside>
        </div>
      </div>
    );
  }

  if (video.isError || !video.data) {
    return (
      <div className="video-page video-page--error">
        <p>视频不见了，可能已被删除或链接有误。</p>
        <button className="video-page__back" onClick={() => navigate('/')}>
          返回首页
        </button>
      </div>
    );
  }

  const detail = video.data;
  const channelName = channels.data?.find((c) => c.id === detail.channelId)?.name ?? '推荐';

  return (
    <div className="video-page">
      <div className="video-page__inner container">
        <div className="video-page__main">
          <div className="video-page__toolbar">
            <Link className="video-page__back" to="/">
              <Icon name="arrowLeft" size={14} />
              返回首页
            </Link>
          </div>

          <VideoInfo video={detail} channelName={channelName} />

          <VideoPlayer
            key={detail.bvid}
            src={detail.playUrl}
            poster={detail.cover}
            title={detail.title}
            danmaku={danmaku.data ?? []}
            onProgress={(t) => {
              progressRef.current = t;
            }}
          />

          <ActionBar key={detail.bvid} video={detail} />
          <VideoDesc video={detail} />
          <CommentSection key={detail.bvid} bvid={detail.bvid} total={detail.stat.reply} />
        </div>

        <aside className="video-page__side">
          <UpCard key={detail.bvid} owner={detail.owner} currentBvid={detail.bvid} />
          <RelatedList videos={related.data ?? []} loading={related.isLoading} />
        </aside>
      </div>
    </div>
  );
}
