import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { useAuth } from '../hooks/useAuth';
import { useDanmaku } from '../hooks/useDanmaku';
import { danmakuApi } from '../utils/api';
import QRCode from 'qrcode.react';
import { userApi } from '../utils/api';

export default function VideoPlayer({ bvid, cid }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const { isLogin } = useAuth();
  const [videoUrl, setVideoUrl] = useState('');
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [danmakuList, setDanmakuList] = useState([]);
  const [showDanmakuInput, setShowDanmakuInput] = useState(false);
  const [danmakuText, setDanmakuText] = useState('');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [qrcode, setQrcode] = useState(null);
  const [qrcodeStatus, setQrcodeStatus] = useState(null);

  const {
    containerRef: danmakuContainerRef,
    enabled: danmakuEnabled,
    toggle: toggleDanmaku,
    opacity: danmakuOpacity,
    setOpacity: setDanmakuOpacity,
    fontSize: danmakuFontSize,
    setFontSize: setDanmakuFontSize
  } = useDanmaku(videoRef, danmakuList);

  useEffect(() => {
    loadVideo();
    loadDanmaku();
  }, [bvid]);

  useEffect(() => {
    loadDanmaku();
  }, [cid]);

  async function loadVideo() {
    try {
      const res = await fetch(`http://localhost:3001/api/videos/detail/${bvid}`);
      const data = await res.json();
      if (data.success && data.data.playUrl) {
        setVideoUrl(data.data.playUrl);
      }
    } catch (error) {
      console.error('加载视频失败:', error);
    }
  }

  async function loadDanmaku() {
    try {
      const res = await danmakuApi.get(bvid);
      if (res.data.success) {
        const parsed = res.data.data.map(item => {
          const [time, mode, fontsize, color] = item.p.split(',');
          return {
            time: parseFloat(time),
            mode: parseInt(mode),
            fontsize: parseInt(fontsize),
            color: parseInt(color),
            content: item.content
          };
        });
        setDanmakuList(parsed);
      }
    } catch (error) {
      console.error('加载弹幕失败:', error);
    }
  }

  useEffect(() => {
    let scanInterval;
    if (loginModalOpen && qrcode?.qrcodeKey) {
      scanInterval = setInterval(async () => {
        try {
          const res = await userApi.getLoginStatus(qrcode.qrcodeKey);
          setQrcodeStatus(res.data.data);
          
          if (res.data.data.isLogin) {
            setTimeout(() => {
              setLoginModalOpen(false);
              window.location.reload();
            }, 1000);
          }
        } catch (error) {
          console.error('检查扫码状态失败:', error);
        }
      }, 2000);
    }
    
    return () => clearInterval(scanInterval);
  }, [loginModalOpen, qrcode]);

  async function openLoginModal() {
    try {
      const res = await userApi.getQRCode();
      if (res.data.success) {
        setQrcode(res.data.data);
        setLoginModalOpen(true);
      }
    } catch (error) {
      console.error('获取二维码失败:', error);
    }
  }

  async function sendDanmaku() {
    if (!danmakuText.trim()) return;
    
    if (!isLogin) {
      setLoginModalOpen(true);
      return;
    }

    try {
      await danmakuApi.send(bvid, danmakuText, playerRef.current.getCurrentTime(), 1, 16777215, 25);
      setDanmakuList(prev => [...prev, {
        time: playerRef.current.getCurrentTime(),
        mode: 1,
        fontsize: 25,
        color: 16777215,
        content: danmakuText
      }]);
      setDanmakuText('');
      setShowDanmakuInput(false);
    } catch (error) {
      alert('发送失败，请重试');
    }
  }

  function handleSeekMouseDown() {
    setSeeking(true);
  }

  function handleSeekChange(e) {
    setPlayed(parseFloat(e.target.value));
  }

  function handleSeekMouseUp(e) {
    setSeeking(false);
    playerRef.current.seekTo(parseFloat(e.target.value));
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <div className="relative">
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          width="100%"
          height="100%"
          playing={playing}
          volume={volume}
          muted={muted}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onProgress={({ played, loaded }) => {
            setPlayed(played);
            setLoaded(loaded);
          }}
          onDuration={setDuration}
          config={{
            file: {
              attributes: {
                crossOrigin: 'true',
                ref: videoRef
              }
            }
          }}
        />
        
        {danmakuEnabled && (
          <div
            ref={danmakuContainerRef}
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ zIndex: 10 }}
          />
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setPlaying(!playing)}
            className="text-white hover:text-bili-pink transition-colors"
          >
            {playing ? '⏸️' : '▶️'}
          </button>
          
          <div className="flex-1 flex items-center space-x-2">
            <span className="text-white text-xs">{formatTime(duration * played)}</span>
            <input
              type="range"
              min={0}
              max={0.999999}
              step="any"
              value={played}
              onMouseDown={handleSeekMouseDown}
              onChange={handleSeekChange}
              onMouseUp={handleSeekMouseUp}
              className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white text-xs">{formatTime(duration)}</span>
          </div>

          <button
            onClick={() => setMuted(!muted)}
            className="text-white hover:text-bili-pink"
          >
            {muted ? '🔇' : '🔊'}
          </button>

          <button
            onClick={toggleDanmaku}
            className={`text-sm px-3 py-1 rounded ${danmakuEnabled ? 'bg-bili-pink text-white' : 'bg-white/20 text-white'}`}
          >
            弹幕 {danmakuEnabled ? '开' : '关'}
          </button>

          <button
            onClick={() => setShowDanmakuInput(!showDanmakuInput)}
            className="text-white hover:text-bili-pink text-sm px-3 py-1 border border-white/50 rounded"
          >
            {isLogin ? '发弹幕' : '登录发弹幕'}
          </button>
        </div>

        {showDanmakuInput && (
          <div className="mt-3 flex items-center space-x-2">
            <input
              type="text"
              value={danmakuText}
              onChange={(e) => setDanmakuText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendDanmaku()}
              placeholder="发个弹幕见证当下..."
              className="flex-1 px-3 py-1.5 rounded-full bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bili-pink"
            />
            <button
              onClick={sendDanmaku}
              className="px-4 py-1.5 bg-bili-pink text-white rounded-full hover:bg-pink-600 transition-colors"
            >
              发送
            </button>
          </div>
        )}
      </div>

      {loginModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setLoginModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 text-center">扫码登录哔哩哔哩</h3>
            {qrcode?.qrcodeUrl && (
              <div className="flex flex-col items-center">
                <QRCode value={qrcode.qrcodeUrl} size={200} />
                <p className="mt-4 text-sm text-bili-gray-text">
                  {qrcodeStatus?.isLogin ? '✅ 扫码成功！' : '使用哔哩哔哩 APP 扫码登录'}
                </p>
              </div>
            )}
            <button
              onClick={() => setLoginModalOpen(false)}
              className="mt-4 w-full bili-btn bili-btn-secondary"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
