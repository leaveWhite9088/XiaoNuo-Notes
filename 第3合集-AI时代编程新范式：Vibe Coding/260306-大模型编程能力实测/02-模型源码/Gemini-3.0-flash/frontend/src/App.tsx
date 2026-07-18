import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Search, Play, User as UserIcon, LogIn, Heart, MessageCircle, Send, Star, Share2 } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

interface VideoInfo {
  bvid: string;
  title: string;
  desc: string;
  pic: string;
  owner: {
    name: string;
    face: string;
  };
  stat: {
    view: number;
    danmaku: number;
    reply: number;
    like: number;
    favorite: number;
    share: number;
  };
}

interface Comment {
  content: {
    message: string;
  };
  member: {
    uname: string;
    avatar: string;
  };
  ctime: number;
}

const App: React.FC = () => {
  const [bvid, setBvid] = useState('BV1m8411H7He'); // Example video
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [danmakus, setDanmakus] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [qrImg, setQrImg] = useState('');
  const [qrKey, setQrKey] = useState('');
  const [inputBvid, setInputBvid] = useState(bvid);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'comments' | 'favs'>('info');

  useEffect(() => {
    fetchVideoData();
    checkLoginStatus();
  }, [bvid]);

  const fetchVideoData = async () => {
    try {
      const infoRes = await axios.get(`${API_BASE}/video/info?bvid=${bvid}`);
      setVideoInfo(infoRes.data);
      const commentRes = await axios.get(`${API_BASE}/video/comments?bvid=${bvid}`);
      setComments(commentRes.data.replies || []);
      const dmRes = await axios.get(`${API_BASE}/video/danmaku?bvid=${bvid}`);
      setDanmakus(dmRes.data);
    } catch (err) {
      console.error('Failed to fetch video data', err);
    }
  };

  const checkLoginStatus = async () => {
    const sessdata = Cookies.get('SESSDATA');
    if (sessdata) {
      try {
        const res = await axios.get(`${API_BASE}/user/info`, { withCredentials: true });
        if (res.data.logged_in) {
          setUserInfo(res.data.info);
        }
      } catch (err) {
        console.error('Login check failed', err);
      }
    }
  };

  const handleLogin = async () => {
    setShowLogin(true);
    const res = await axios.get(`${API_BASE}/login/qr_generate`);
    setQrImg(res.data.qr_img);
    setQrKey(res.data.qrcode_key);
    
    const timer = setInterval(async () => {
      const pollRes = await axios.get(`${API_BASE}/login/qr_poll?qrcode_key=${res.data.qrcode_key}`);
      if (pollRes.data.status === 'success') {
        clearInterval(timer);
        Cookies.set('SESSDATA', pollRes.data.sessdata);
        setShowLogin(false);
        checkLoginStatus();
      }
    }, 3000);
  };

  const postComment = async () => {
    if (!newComment) return;
    try {
      await axios.post(`${API_BASE}/video/send_comment?bvid=${bvid}&text=${newComment}`, {}, { withCredentials: true });
      setNewComment('');
      fetchVideoData();
    } catch (err) {
      alert('发送失败，请检查登录状态');
    }
  };

  return (
    <div className="bili-container">
      {/* Header */}
      <header className="bili-header">
        <div className="header-content">
          <div className="logo" onClick={() => window.location.href = 'https://www.bilibili.com'}>
            Bilibili-Clone
          </div>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="搜索 BV 号..." 
              value={inputBvid}
              onChange={(e) => setInputBvid(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setBvid(inputBvid)}
            />
            <button onClick={() => setBvid(inputBvid)}><Search size={18} /></button>
          </div>
          <div className="user-area">
            {userInfo ? (
              <div className="user-info">
                <img src={userInfo.face} alt="avatar" className="avatar" />
                <span>{userInfo.uname}</span>
              </div>
            ) : (
              <button className="login-btn" onClick={handleLogin}><LogIn size={18} /> 登录</button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-layout">
        <div className="player-section">
          <div className="video-player">
            <iframe
              src={`https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&as_wide=1&allowfullscreen=true`}
              width="100%"
              height="500px"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
          
          {videoInfo && (
            <div className="video-details">
              <h1>{videoInfo.title}</h1>
              <div className="stats">
                <span><Play size={14} /> {(videoInfo.stat.view / 10000).toFixed(1)}万</span>
                <span><MessageCircle size={14} /> {videoInfo.stat.danmaku}</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="actions">
                <button><Heart size={20} /> {videoInfo.stat.like}</button>
                <button><Star size={20} /> {videoInfo.stat.favorite}</button>
                <button><Share2 size={20} /> {videoInfo.stat.share}</button>
              </div>
              <div className="desc-box">
                <p>{videoInfo.desc}</p>
              </div>
            </div>
          )}
        </div>

        <div className="sidebar">
          <div className="tabs">
            <button onClick={() => setActiveTab('info')} className={activeTab === 'info' ? 'active' : ''}>简介</button>
            <button onClick={() => setActiveTab('comments')} className={activeTab === 'comments' ? 'active' : ''}>评论 ({videoInfo?.stat.reply})</button>
          </div>

          <div className="tab-content">
            {activeTab === 'comments' && (
              <div className="comment-list">
                <div className="post-comment">
                  <textarea 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="发一条友善的评论"
                  />
                  <button onClick={postComment}><Send size={16} /> 发送</button>
                </div>
                {comments.map((c, i) => (
                  <div key={i} className="comment-item">
                    <img src={c.member.avatar} alt="avatar" />
                    <div className="comment-body">
                      <div className="uname">{c.member.uname}</div>
                      <div className="text">{c.content.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'info' && (
              <div className="up-info">
                {videoInfo && (
                  <>
                    <img src={videoInfo.owner.face} alt="up-avatar" />
                    <div>
                      <h3>{videoInfo.owner.name}</h3>
                      <button className="follow-btn">关注</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Login Modal */}
      {showLogin && (
        <div className="modal-overlay">
          <div className="login-modal">
            <h2>扫描二维码登录</h2>
            {qrImg ? <img src={qrImg} alt="QR Code" /> : <p>加载中...</p>}
            <button onClick={() => setShowLogin(false)}>取消</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
