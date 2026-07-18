import React, { useState, useEffect } from 'react';
import { Tabs, Card, Avatar, Row, Col, Spin, message, Statistic, Space } from 'antd';
import { UserOutlined, StarOutlined, HistoryOutlined, PlaySquareOutlined, CommentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';

const { TabPane } = Tabs;

function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
}

function formatDuration(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function UserCenter() {
  const [userInfo, setUserInfo] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('favorites');
  const navigate = useNavigate();

  useEffect(() => {
    getUserInfo();
    getFavorites();
  }, []);

  const getUserInfo = async () => {
    try {
      const res = await request.get('/user/info');
      if (res.success) {
        setUserInfo(res.data);
      } else {
        message.warning('请先登录');
        navigate('/login');
      }
    } catch (error) {
      message.warning('请先登录');
      navigate('/login');
    }
  };

  const getFavorites = async () => {
    try {
      setLoading(true);
      const res = await request.get('/user/favorites');
      if (res.success) {
        setFavorites(res.data);
      }
    } catch (error) {
      message.error('获取收藏列表失败');
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo) {
    return <div style={{ textAlign: 'center', padding: '50px 0' }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
          <Avatar src={userInfo.face} size={100} />
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>{userInfo.name}</h1>
            <p style={{ color: '#666', marginBottom: 16 }}>UID: {userInfo.mid || '123456'}</p>
            <Space size={48}>
              <Statistic title="关注" value={userInfo.following || 100} />
              <Statistic title="粉丝" value={userInfo.follower || 50} />
              <Statistic title="获赞" value={userInfo.likes || 1000} />
            </Space>
          </div>
        </div>
      </Card>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span><StarOutlined />我的收藏</span>} key="favorites">
          <Spin spinning={loading}>
            <Row gutter={[24, 24]}>
              {favorites.map((video) => (
                <Col xs={24} sm={12} md={8} lg={6} key={video.bvid}>
                  <div
                    className="video-card"
                    onClick={() => navigate(`/video/${video.bvid}`)}
                  >
                    <div className="cover">
                      <img src={video.pic} alt={video.title} />
                      <span className="duration">{formatDuration(video.duration || 0)}</span>
                    </div>
                    <div className="info">
                      <div className="title">{video.title}</div>
                      <div className="up-name">{video.owner.name}</div>
                      <div className="stats">
                        <span>
                          <PlaySquareOutlined style={{ marginRight: 4 }} />
                          {formatNumber(video.stat.view)}
                        </span>
                        <span>
                          <CommentOutlined style={{ marginRight: 4 }} />
                          {formatNumber(video.stat.danmaku || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
            {favorites.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                <StarOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }} />
                <p>暂无收藏视频</p>
              </div>
            )}
          </Spin>
        </TabPane>
        <TabPane tab={<span><HistoryOutlined />观看历史</span>} key="history">
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
            <HistoryOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }} />
            <p>暂无观看历史</p>
          </div>
        </TabPane>
        <TabPane tab={<span><UserOutlined />个人资料</span>} key="profile">
          <Card>
            <p style={{ marginBottom: 16 }}><strong>用户名：</strong>{userInfo.name}</p>
            <p style={{ marginBottom: 16 }}><strong>UID：</strong>{userInfo.mid || '123456'}</p>
            <p style={{ marginBottom: 16 }}><strong>性别：</strong>{userInfo.sex || '保密'}</p>
            <p style={{ marginBottom: 16 }}><strong>签名：</strong>{userInfo.sign || '这个人很懒，什么都没有写~'}</p>
            <p style={{ marginBottom: 16 }}><strong>等级：</strong>Lv.{userInfo.level || 3}</p>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
}

export default UserCenter;
