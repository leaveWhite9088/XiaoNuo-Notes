import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Row, Col, Tabs, Input, Button, Avatar, Space, Tag, Divider, List, message } from 'antd';
import {
  LikeOutlined,
  DislikeOutlined,
  StarOutlined,
  ShareAltOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { VideoPlayer } from '../components/VideoPlayer';
import { CommentItem } from '../components/CommentItem';
import { VideoCard } from '../components/VideoCard';
import {
  getVideoInfo,
  getVideoCid,
  getVideoUrl,
  getComments,
  sendComment,
  getDanmaku,
} from '../api/bilibili';
import { useUserStore } from '../stores/user';
import type { VideoInfo, Comment, Danmaku } from '../types';
import { formatNumber, formatTime, formatViewCount } from '../utils/format';

const { Content } = Layout;
const { TextArea } = Input;

export const VideoDetail = () => {
  const { bvid } = useParams<{ bvid: string }>();
  const { isLogin } = useUserStore();
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [_cid, setCid] = useState<number>(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [danmakus, setDanmakus] = useState<Danmaku[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [_relatedVideos, _setRelatedVideos] = useState<VideoInfo[]>([]);

  useEffect(() => {
    if (bvid) {
      loadVideoData();
    }
  }, [bvid]);

  const loadVideoData = async () => {
    setLoading(true);

    const info = await getVideoInfo(bvid!);
    if (info) {
      setVideoInfo(info);

      const videoCid = await getVideoCid(bvid!);
      if (videoCid) {
        setCid(videoCid);
        const urls = await getVideoUrl(bvid!, videoCid);
        if (urls.length > 0) {
          setVideoUrl(urls[0].url);
        }

        const [commentsData, danmakuData] = await Promise.all([
          getComments(info.aid),
          getDanmaku(videoCid),
        ]);

        setComments(commentsData);
        setDanmakus(danmakuData);
      }
    }

    setLoading(false);
  };

  const handleSendComment = async () => {
    if (!isLogin) {
      message.warning('请先登录后再发表评论');
      return;
    }
    if (!commentText.trim()) {
      message.warning('请输入评论内容');
      return;
    }
    if (!videoInfo) return;

    const success = await sendComment(videoInfo.aid, commentText.trim());
    if (success) {
      message.success('评论发送成功');
      setCommentText('');
      const newComments = await getComments(videoInfo.aid);
      setComments(newComments);
    } else {
      message.error('评论发送失败，请检查登录状态');
    }
  };

  const handleJumpToBilibili = () => {
    if (bvid) {
      window.open(`https://www.bilibili.com/video/${bvid}`, '_blank');
    }
  };

  if (loading || !videoInfo) {
    return (
      <Content style={{ padding: 24, marginTop: 64, textAlign: 'center' }}>
        <div>加载中...</div>
      </Content>
    );
  }

  return (
    <Content style={{ padding: '24px 48px', marginTop: 64, background: '#F1F2F3', minHeight: '100vh' }}>
      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <VideoPlayer videoUrl={videoUrl} poster={videoInfo.pic} danmakus={danmakus} />

          <div style={{ marginTop: 20, background: '#fff', padding: 24, borderRadius: 8 }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: '#18191C' }}>
              {videoInfo.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <Avatar src={videoInfo.owner.face} size={48} style={{ marginRight: 12 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#18191C' }}>
                  {videoInfo.owner.name}
                </div>
                <div style={{ fontSize: 13, color: '#9499A0' }}>
                  {formatNumber(videoInfo.owner.mid)}粉丝
                </div>
              </div>
              <Button type="primary" style={{ background: '#00AEEC', borderRadius: 4 }}>
                + 关注
              </Button>
            </div>

            <div style={{ marginBottom: 16, color: '#61666D', fontSize: 14, lineHeight: 1.8 }}>
              {videoInfo.description || '该视频暂无简介'}
            </div>

            <Space size={24} style={{ marginBottom: 16 }}>
              <span style={{ color: '#9499A0', fontSize: 13 }}>
                {formatViewCount(videoInfo.stat.view)}次观看
              </span>
              <span style={{ color: '#9499A0', fontSize: 13 }}>
                {formatTime(videoInfo.pubdate)}
              </span>
              <Tag color="blue">{videoInfo.bvid}</Tag>
            </Space>

            <Divider style={{ margin: '16px 0' }} />

            <Space size={16}>
              <Button icon={<LikeOutlined />} size="large">
                {formatNumber(videoInfo.stat.like)}
              </Button>
              <Button icon={<DislikeOutlined />} size="large" />
              <Button icon={<StarOutlined />} size="large">
                {formatNumber(videoInfo.stat.favorite)}
              </Button>
              <Button icon={<ShareAltOutlined />} size="large">
                {formatNumber(videoInfo.stat.share)}
              </Button>
              <Button icon={<LinkOutlined />} size="large" onClick={handleJumpToBilibili}>
                跳转官网
              </Button>
            </Space>
          </div>

          <div style={{ marginTop: 20, background: '#fff', padding: 24, borderRadius: 8 }}>
            <Tabs
              items={[
                {
                  key: 'comments',
                  label: `评论 (${videoInfo.stat.reply})`,
                  children: (
                    <div>
                      <div style={{ marginBottom: 24 }}>
                        <TextArea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder={isLogin ? '发一条友善的评论吧~' : '请先登录后发表评论'}
                          rows={3}
                          style={{ marginBottom: 12 }}
                          disabled={!isLogin}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            type="primary"
                            onClick={handleSendComment}
                            disabled={!isLogin || !commentText.trim()}
                            style={{ background: '#00AEEC' }}
                          >
                            发表评论
                          </Button>
                        </div>
                      </div>

                      <List
                        dataSource={comments}
                        renderItem={(comment) => (
                          <CommentItem comment={comment} />
                        )}
                        locale={{ emptyText: '暂无评论，快来抢沙发吧~' }}
                      />
                    </div>
                  ),
                },
                {
                  key: 'danmaku',
                  label: '弹幕列表',
                  children: (
                    <div style={{ maxHeight: 500, overflow: 'auto' }}>
                      {danmakus.slice(0, 100).map((d, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '8px 0',
                            borderBottom: '1px solid #E3E5E7',
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 13,
                          }}
                        >
                          <span style={{ color: '#00AEEC', width: 80 }}>
                            {Math.floor(d.time / 60)}:{String(Math.floor(d.time % 60)).padStart(2, '0')}
                          </span>
                          <span style={{ flex: 1, marginLeft: 16, color: '#18191C' }}>{d.text}</span>
                        </div>
                      ))}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </Col>

        <Col xs={24} lg={8}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#18191C' }}>
              相关推荐
            </h3>
            {_relatedVideos.length === 0 ? (
              <div style={{ color: '#9499A0', textAlign: 'center', padding: '40px 0' }}>
                暂无相关推荐
              </div>
            ) : (
              _relatedVideos.map((video: VideoInfo) => (
                <VideoCard key={video.bvid} video={video} />
              ))
            )}
          </div>
        </Col>
      </Row>
    </Content>
  );
};
