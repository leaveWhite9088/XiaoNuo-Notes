import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getVideoInfo, getVideoComments, getVideoDanmaku, getProxyVideoUrl, sendComment, sendDanmaku } from '../api';
import { ThumbsUp, MessageSquare, Share2, Star, Send } from 'lucide-react';

const VideoDetail: React.FC = () => {
  const { bvid } = useParams<{ bvid: string }>();
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [playUrl, setPlayUrl] = useState<string>('');
  const [comments, setComments] = useState<any[]>([]);
  const [danmaku, setDanmaku] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [danmakuInput, setDanmakuInput] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!bvid) return;
    
    const fetchData = async () => {
      try {
        const infoRes = await getVideoInfo(bvid);
        setVideoInfo(infoRes.info);
        
        // Handle play url
        // infoRes.play_url might be durl or dash
        if (infoRes.play_url && infoRes.play_url.durl) {
            setPlayUrl(getProxyVideoUrl(infoRes.play_url.durl[0].url));
        } else if (infoRes.play_url && infoRes.play_url.dash) {
             // DASH is complex for simple video tag, usually needs dash.js
             // Fallback: try to find a durl or just pick the first video stream from dash if we can't parse
             // For simplicity, let's assume durl is available or we just use the first video representation
             // Actually, bilibili usually returns dash.
             // If we only have DASH, we might need a better player. 
             // But let's check if we can get mp4.
             // Usually, without specific platform flags, it returns dash.
             // Let's try to just take the first video url from dash to proxy
             if (infoRes.play_url.dash.video && infoRes.play_url.dash.video.length > 0) {
                 setPlayUrl(getProxyVideoUrl(infoRes.play_url.dash.video[0].baseUrl));
             }
        }

        const commentsRes = await getVideoComments(bvid);
        if (commentsRes && commentsRes.replies) {
            setComments(commentsRes.replies);
        }

        const danmakuRes = await getVideoDanmaku(bvid);
        setDanmaku(danmakuRes);

      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [bvid]);

  const handleSendComment = async () => {
    if (!bvid || !commentInput.trim()) return;
    try {
      await sendComment(bvid, commentInput);
      setCommentInput('');
      // Refresh comments
      const commentsRes = await getVideoComments(bvid);
        if (commentsRes && commentsRes.replies) {
            setComments(commentsRes.replies);
        }
    } catch (e) {
      alert('发送评论失败，请先登录');
    }
  };

  const handleSendDanmaku = async () => {
    if (!bvid || !danmakuInput.trim()) return;
    try {
      const time = videoRef.current?.currentTime || 0;
      await sendDanmaku(bvid, danmakuInput, time);
      setDanmakuInput('');
      // Optimistically add danmaku
      setDanmaku([...danmaku, { text: danmakuInput, time, color: 16777215 }]);
    } catch (e) {
      alert('发送弹幕失败，请先登录');
    }
  };

  // Simple Danmaku Overlay
  const [visibleDanmaku, setVisibleDanmaku] = useState<any[]>([]);
  
  useEffect(() => {
    const updateDanmaku = () => {
        if (!videoRef.current) return;
        const time = videoRef.current.currentTime;
        // Show danmaku within 5 seconds window? 
        // Actually, danmaku should fly across screen. 
        // Simple implementation: Show danmaku that matches current time +/- 1s
        const current = danmaku.filter(d => Math.abs(d.time - time) < 1);
        setVisibleDanmaku(current);
    };
    
    const interval = setInterval(updateDanmaku, 500);
    return () => clearInterval(interval);
  }, [danmaku]);

  if (!videoInfo) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Player & Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-black rounded-lg overflow-hidden relative aspect-video group">
            <video 
                ref={videoRef}
                src={playUrl} 
                controls 
                className="w-full h-full"
                autoPlay
            />
            {/* Danmaku Overlay - Very simple version */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                {visibleDanmaku.map((d, i) => (
                    <div key={i} className="absolute text-white text-shadow font-bold animate-danmaku whitespace-nowrap" style={{
                        top: `${(i % 10) * 10}%`,
                        left: '100%',
                        animation: 'danmaku 10s linear infinite' // This is just a placeholder, real danmaku needs complex positioning
                    }}>
                        {d.text}
                    </div>
                ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
             <h1 className="text-xl font-bold mb-2">{videoInfo.title}</h1>
             <div className="flex items-center text-gray-500 text-sm mb-4 space-x-4">
                <span>播放: {videoInfo.stat?.view}</span>
                <span>弹幕: {videoInfo.stat?.danmaku}</span>
                <span>{new Date(videoInfo.pubdate * 1000).toLocaleDateString()}</span>
             </div>
             
             <div className="flex items-center gap-6 border-b border-gray-100 pb-4 mb-4">
                <button className="flex items-center gap-1 text-gray-600 hover:text-bilibili-blue">
                    <ThumbsUp size={20} /> <span>{videoInfo.stat?.like}</span>
                </button>
                <button className="flex items-center gap-1 text-gray-600 hover:text-bilibili-blue">
                    <Star size={20} /> <span>{videoInfo.stat?.favorite}</span>
                </button>
                <button className="flex items-center gap-1 text-gray-600 hover:text-bilibili-blue">
                    <Share2 size={20} /> <span>{videoInfo.stat?.share}</span>
                </button>
             </div>

             <div className="text-gray-700 text-sm whitespace-pre-wrap">
                 {videoInfo.desc}
             </div>
             
             <div className="mt-4">
                <a href={`https://www.bilibili.com/video/${bvid}`} target="_blank" rel="noreferrer" className="text-bilibili-blue hover:underline">
                    跳转至Bilibili官网观看 &rarr;
                </a>
             </div>
          </div>
          
          {/* Comments Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
             <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                 <MessageSquare size={20} /> 评论 ({videoInfo.stat?.reply})
             </h3>
             
             <div className="flex gap-2 mb-6">
                 <input 
                    type="text" 
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="发一条友善的评论"
                    className="flex-1 bg-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-bilibili-blue"
                 />
                 <button 
                    onClick={handleSendComment}
                    className="bg-bilibili-blue text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors"
                 >
                     发布
                 </button>
             </div>

             <div className="space-y-6">
                 {comments.map((comment: any) => (
                     <div key={comment.rpid} className="flex gap-3">
                         <img src={comment.member.avatar} alt={comment.member.uname} className="w-10 h-10 rounded-full" />
                         <div className="flex-1">
                             <div className="flex items-center justify-between mb-1">
                                 <span className="font-medium text-gray-800">{comment.member.uname}</span>
                                 <span className="text-xs text-gray-400">{new Date(comment.ctime * 1000).toLocaleDateString()}</span>
                             </div>
                             <p className="text-gray-700 text-sm">{comment.content.message}</p>
                         </div>
                     </div>
                 ))}
             </div>
          </div>
        </div>

        {/* Right Column: Danmaku List & Sidebar */}
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm h-[600px] flex flex-col">
                <h3 className="font-bold mb-4">弹幕列表</h3>
                <div className="flex-1 overflow-y-auto space-y-1 text-sm text-gray-600 mb-4">
                    {danmaku.map((d, i) => (
                        <div key={i} className="flex justify-between hover:bg-gray-50 px-1">
                            <span className="truncate flex-1">{d.text}</span>
                            <span className="text-gray-400 text-xs w-12 text-right">
                                {Math.floor(d.time / 60)}:{Math.floor(d.time % 60).toString().padStart(2, '0')}
                            </span>
                        </div>
                    ))}
                </div>
                
                <div className="flex gap-2">
                     <input 
                        type="text" 
                        value={danmakuInput}
                        onChange={(e) => setDanmakuInput(e.target.value)}
                        placeholder="发个弹幕见证当下"
                        className="flex-1 bg-gray-100 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-bilibili-blue"
                     />
                     <button 
                        onClick={handleSendDanmaku}
                        className="bg-bilibili-pink text-white px-3 py-1.5 rounded text-sm hover:bg-pink-600"
                     >
                         <Send size={14} />
                     </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;
