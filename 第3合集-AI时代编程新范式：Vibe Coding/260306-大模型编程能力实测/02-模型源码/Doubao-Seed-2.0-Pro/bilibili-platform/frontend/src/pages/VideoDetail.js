import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Spin, message, Button, Avatar, Input, Space, List, Pagination } from 'antd';
import { LikeOutlined, LikeFilled, DollarCircleOutlined, StarOutlined, StarFilled, ShareAltOutlined, SendOutlined } from '@ant-design/icons';
import DPlayer from 'dplayer';
import request from '../utils/request';

const { TextArea } = Input;

function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
}

function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN');
}

function VideoDetail({ userInfo }) {
  const { bvid } = useParams();
  const navigate = useNavigate();
  const dpRef = useRef(null);
  const containerRef = useRef(null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentPage, setCommentPage] = useState(1);
  const [commentTotal, setCommentTotal] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [danmakuText, setDanmakuText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    getVideoInfo();
    getComments();
    return () => {
      if (dpRef.current) {
        dpRef.current.destroy();
      }
    };
  }, [bvid]);

  const getVideoInfo = async () => {
    try {
      setLoading(true);
      const res = await request.get(`/video/${bvid}`);
      if (res.success) {
        setVideoInfo(res.data);
        initPlayer(res.data);
        getDanmaku();
      } else {
        message.error('获取视频信息失败');
      }
    } catch (error) {
      message.error('获取视频信息失败');
    } finally {
      setLoading(false);
    }
  };

  const initPlayer = (video) => {
    if (containerRef.current && !dpRef.current) {
      dpRef.current = new DPlayer({
        container: containerRef.current,
        video: {
          url: 'https://www.w3schools.com/html/mov_bbb.mp4', // 示例视频地址
          pic: video.pic,
          type: 'auto'
        },
        danmaku: {
          id: video.cid || 'demo',
          api: 'https://dplayer.diygod.dev/danmaku/',
          addition: [],
          bottom: '15%',
          unlimited: true
        },
        lang: 'zh-cn'
      });
    }
  };

  const getDanmaku = async () => {
    try {
      const res = await request.get(`/video/${bvid}/danmaku`);
      if (res.success && dpRef.current) {
        const danmaku = res.data.map(item => [item.time, item.type || 0, item.color || 16777215, 'user', item.text]);
        dpRef.current.danmaku.load({
          data: danmaku
        });
      }
    } catch (error) {
      console.error('获取弹幕失败');
    }
  };

  const sendDanmaku = async () => {
    if (!userInfo) {
      message.warning('请先登录后发送弹幕');
      navigate('/login');
      return;
    }
    if (!danmakuText.trim()) {
      message.warning('弹幕内容不能为空');
      return;
    }
    try {
      await request.post(`/video/${bvid}/danmaku`, {
        text: danmakuText,
        time: dpRef.current.currentTime,
        color: 16777215
      });
      if (dpRef.current) {
        dpRef.current.danmaku.draw({
          text: danmakuText,
          time: dpRef.current.currentTime,
          color: 16777215,
          type: 0
        });
      }
      setDanmakuText('');
      message.success('弹幕发送成功');
    } catch (error) {
      message.error('弹幕发送失败');
    }
  };

  const getComments = async (page = 1) => {
    try {
      const res = await request.get(`/video/${bvid}/comments?page=${page}&ps=20`);
      if (res.success) {
        setComments(res.data.replies);
        setCommentTotal(res.data.page.count);
        setCommentPage(page);
      }
    } catch (error) {
      message.error('获取评论失败');
    }
  };

  const sendComment = async () => {
    if (!userInfo) {
      message.warning('请先登录后发表评论');
      navigate('/login');
      return;
    }
    if (!commentText.trim()) {
      message.warning('评论内容不能为空');
      return;
    }
    try {
      await request.post(`/video/${bvid}/comments`, { message: commentText });
      message.success('评论发送成功');
      setCommentText('');
      getComments(1);
    } catch (error) {
      message.error('评论发送失败');
    }
  };

  const handleLike = () => {
    if (!userInfo) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setIsLiked(!isLiked);
    message.success(isLiked ? '取消点赞' : '点赞成功');
  };

  const handleCoin = () => {
    if (!userInfo) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    message.success('投币成功');
  };

  const handleFavorite = () => {
    if (!userInfo) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setIsFavorited(!isFavorited);
    message.success(isFavorited ? '取消收藏' : '收藏成功');
  };

  if (!videoInfo) {
    return <div style={{ textAlign: 'center', padding: '50px 0' }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <Spin spinning={loading}>
        <Row gutter={24}>
          <Col xs={24} lg={18}>
            {/* 播放器 */}
            <div ref={containerRef} style={{ marginBottom: 16, borderRadius: 8, overflow: 'hidden' }} />
            
            {/* 弹幕发送栏 */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
              <Input
                placeholder="发送弹幕..."
                value={danmakuText}
                onChange={(e) => setDanmakuText(e.target.value)}
                onPressEnter={sendDanmaku}
                style={{ flex: 1 }}
              />
              <Button type="primary" icon={<SendOutlined />} onClick={sendDanmaku}>
                发送
              </Button>
            </div>

            {/* 视频信息 */}
            <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 16 }}>
              <h1 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>{videoInfo.title}</h1>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar src={videoInfo.owner.face} size={40} />
                    <div>
                      <div style={{ fontWeight: 500 }}>{videoInfo.owner.name}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>UP主</div>
                    </div>
                  </div>
                  <Button type="primary">关注</Button>
                </div>

                <Space size="middle">
                  <Button 
                    icon={isLiked ? <LikeFilled /> : <LikeOutlined />} 
                    onClick={handleLike}
                    type={isLiked ? 'primary' : 'default'}
                  >
                    {formatNumber(videoInfo.stat.like)}
                  </Button>
                  <Button icon={<DollarCircleOutlined />} onClick={handleCoin}>
                    {formatNumber(videoInfo.stat.coin)}
                  </Button>
                  <Button 
                    icon={isFavorited ? <StarFilled /> : <StarOutlined />} 
                    onClick={handleFavorite}
                    type={isFavorited ? 'primary' : 'default'}
                  >
                    {formatNumber(videoInfo.stat.favorite)}
                  </Button>
                  <Button icon={<ShareAltOutlined />}>
                    {formatNumber(videoInfo.stat.share)}
                  </Button>
                </Space>
              </div>

              <div style={{ padding: 12, background: '#f4f4f4', borderRadius: 6, fontSize: 14, lineHeight: 1.6 }}>
                <div style={{ marginBottom: 8, color: '#666' }}>
                  播放 {formatNumber(videoInfo.stat.view)} · 弹幕 {formatNumber(videoInfo.stat.danmaku)} · {new Date().toLocaleDateString()}
                </div>
                <div>{videoInfo.desc}</div>
              </div>
            </div>

            {/* 评论区 */}
            <div style={{ background: '#fff', padding: 20, borderRadius: 8 }}>
              <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>评论 {formatNumber(commentTotal)}</h2>
              
              <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
                <Avatar src={userInfo?.face} size={40} />
                <div style={{ flex: 1 }}>
                  <TextArea
                    rows={4}
                    placeholder="请发表你的评论..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <div style={{ textAlign: 'right' }}>
                    <Button type="primary" onClick={sendComment}>发表评论</Button>
                  </div>
                </div>
              </div>

              <List
                dataSource={comments}
                renderItem={(comment) => (
                  <List.Item key={comment.rpid}>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <Avatar src={comment.member.avatar} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, marginBottom: 6 }}>{comment.member.uname}</div>
                          <p style={{ marginBottom: 8 }}>{comment.content.message}</p>
                          <span style={{ fontSize: 12, color: '#999' }}>
                            {formatTime(comment.ctime)} · 点赞 {comment.like}
                          </span>
                        </div>
                      </div>
                      {comment.replies?.length ? (
                        <div style={{ marginTop: 14, marginLeft: 52, display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {comment.replies.map((reply) => (
                            <div key={reply.rpid} style={{ display: 'flex', gap: 10 }}>
                              <Avatar src={reply.member.avatar} size={28} />
                              <div>
                                <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>{reply.member.uname}</div>
                                <p style={{ fontSize: 13, marginBottom: 4 }}>{reply.content.message}</p>
                                <span style={{ fontSize: 11, color: '#999' }}>点赞 {reply.like}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </List.Item>
                )}
              />

              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Pagination
                  current={commentPage}
                  total={commentTotal}
                  pageSize={20}
                  onChange={getComments}
                  showSizeChanger={false}
                />
              </div>
            </div>
          </Col>

          <Col xs={24} lg={6}>
            <div style={{ background: '#fff', padding: 20, borderRadius: 8, position: 'sticky', top: 80 }}>
              <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>相关推荐</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, cursor: 'pointer' }}>
                    <div style={{ width: 120, height: 68, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                      <img src={`https://picsum.photos/seed/${i+1000}/120/68`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, lineHeight: 1.4, maxHeight: 36, overflow: 'hidden', marginBottom: 4 }}>
                        相关推荐视频标题 {i+1}
                      </div>
                      <div style={{ fontSize: 11, color: '#999' }}>
                        UP主{i+1} · {Math.floor(Math.random() * 100)}万播放
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}

export default VideoDetail;
