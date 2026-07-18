import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { Danmaku } from '../components/video/Danmaku';
import { CommentSection } from '../components/video/CommentSection';
import { VideoCard } from '../components/video/VideoCard';
import { Button, Card, Loading } from '../components/common';
import { videoApi, danmakuApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { VideoInfo, VideoPlayUrl } from '../types';

export const VideoPage: React.FC = () => {
  const { bvid } = useParams<{ bvid: string }>();
  const { user } = useAuth();

  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [playUrl, setPlayUrl] = useState<VideoPlayUrl | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<VideoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'danmaku' | 'comments'>('comments');
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (bvid) {
      fetchVideoData();
    }
  }, [bvid]);

  const fetchVideoData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [infoRes, relatedRes] = await Promise.all([
        videoApi.getInfo(bvid!),
        videoApi.getRelated(bvid!)
      ]);

      if (infoRes.code === 0) {
        setVideoInfo(infoRes.data);
        const cid = infoRes.data.videos > 1 ? infoRes.data.pages[0]?.cid : infoRes.data.cid;
        if (cid) {
          fetchPlayUrl(bvid!, cid);
        }
      }
      if (relatedRes.code === 0) {
        setRelatedVideos(relatedRes.data);
      }
    } catch (err: any) {
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayUrl = async (bvid: string, cid: number) => {
    try {
      const res = await videoApi.getPlayUrl(bvid, cid, 80);
      if (res.code === 0 && res.data.result?.length > 0) {
        setPlayUrl(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch play URL:', error);
    }
  };

  const handleSendDanmaku = async (content: string, time: number) => {
    if (!user || !videoInfo) return;
    try {
      const cid = videoInfo.videos > 1 ? videoInfo.pages[0]?.cid : videoInfo.cid;
      if (!cid) return;
      const res = await danmakuApi.sendDanmaku(videoInfo.bvid, cid, content, time);
      if (res.code !== 0) {
        alert(res.message || '发送失败');
      }
    } catch (error) {
      console.error('Failed to send danmaku:', error);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 100000) return (num / 10000).toFixed(1) + '万';
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    if (num >= 1000) return (num / 1000).toFixed(1) + '千';
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <Loading text="加载中..." fullScreen />;
  }

  if (error || !videoInfo) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-bili-text-gray mb-4">{error || '视频不存在'}</p>
        <Button onClick={() => window.history.back()}>返回</Button>
      </div>
    );
  }

  const videoSrc = playUrl?.result?.[0]?.durl?.[0]?.url || '';
  const cid = videoInfo.videos > 1 ? videoInfo.pages[0]?.cid : videoInfo.cid;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-0 overflow-hidden">
            {videoSrc ? (
              <VideoPlayer src={videoSrc} cid={cid || 0} title={videoInfo.title} poster={videoInfo.cover} onTimeUpdate={setCurrentTime} />
            ) : (
              <div className="aspect-video bg-black flex items-center justify-center">
                <span className="text-white">视频加载失败</span>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <h1 className="text-xl font-bold text-bili-text mb-2">{videoInfo.title}</h1>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-bili-text-gray mb-3">
              <div className="flex items-center gap-3">
                <span>{formatNumber(videoInfo.stat.view)}播放</span>
                <span>{formatNumber(videoInfo.stat.danmaku)}弹幕</span>
                <span>{formatNumber(videoInfo.stat.reply)}评论</span>
                <span>{formatNumber(videoInfo.stat.favorite)}收藏</span>
                <span>{formatNumber(videoInfo.stat.like)}点赞</span>
              </div>
              <div className="text-bili-text-gray">
                {new Date(videoInfo.pubdate * 1000).toLocaleDateString()} 发布
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-bili-border">
              <div className="flex items-center gap-3">
                <img src={videoInfo.owner.face} alt={videoInfo.owner.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="font-medium text-bili-text">{videoInfo.owner.name}</div>
                  <div className="text-xs text-bili-text-gray">UP主</div>
                </div>
              </div>
              <Button variant="outline" size="sm">+ 关注</Button>
            </div>

            <div className="flex gap-2 mt-4">
              {user ? (
                <Button variant="primary" className="flex-1" onClick={() => {}}>收藏</Button>
              ) : (
                <Link to="/login" className="flex-1">
                  <Button variant="primary" className="w-full">登录后收藏</Button>
                </Link>
              )}
              <Button variant="secondary" className="flex-1">投币</Button>
              <Button variant="outline" className="flex-1">分享</Button>
              <Button variant="outline" onClick={() => window.open(`https://www.bilibili.com/video/${bvid}`, '_blank')}>
                跳转官网
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex gap-6 border-b border-bili-border mb-4">
              <button
                onClick={() => setActiveTab('comments')}
                className={`pb-2 text-sm font-medium transition-colors ${
                  activeTab === 'comments' ? 'text-bili-pink border-b-2 border-bili-pink' : 'text-bili-text-gray hover:text-bili-text'
                }`}
              >
                评论 ({videoInfo.stat.reply?.toLocaleString()})
              </button>
              <button
                onClick={() => setActiveTab('danmaku')}
                className={`pb-2 text-sm font-medium transition-colors ${
                  activeTab === 'danmaku' ? 'text-bili-pink border-b-2 border-bili-pink' : 'text-bili-text-gray hover:text-bili-text'
                }`}
              >
                弹幕 ({videoInfo.stat.danmaku?.toLocaleString()})
              </button>
            </div>

            {activeTab === 'comments' ? (
              <CommentSection bvid={bvid!} />
            ) : cid && (
              <Danmaku cid={cid} bvid={bvid!} currentTime={currentTime} onSend={handleSendDanmaku} showInput={!!user} />
            )}
          </Card>
        </div>

        <div className="lg:col-span-1">
          <h3 className="font-bold text-bili-text mb-4">相关推荐</h3>
          <div className="space-y-3">
            {relatedVideos.map(video => (
              <VideoCard key={video.aid} video={video} size="small" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};