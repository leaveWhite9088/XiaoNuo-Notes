import React, { useState, useEffect } from 'react';
import { Row, Col, Spin, message } from 'antd';
import { PlaySquareOutlined, CommentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';

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

function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getRecommendVideos();
  }, []);

  const getRecommendVideos = async () => {
    try {
      setLoading(true);
      const res = await request.get('/videos/recommend');
      if (res.success) {
        setVideos(res.data);
      } else {
        message.error('获取推荐视频失败');
      }
    } catch (error) {
      message.error('获取推荐视频失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24, fontSize: 24, fontWeight: 'bold' }}>推荐视频</h1>
      <Spin spinning={loading}>
        <Row gutter={[24, 24]}>
          {videos.map((video) => (
            <Col xs={24} sm={12} md={8} lg={6} key={video.bvid}>
              <div
                className="video-card"
                onClick={() => navigate(`/video/${video.bvid}`)}
              >
                <div className="cover">
                  <img src={video.pic} alt={video.title} />
                  <span className="duration">{formatDuration(video.duration)}</span>
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
                      {formatNumber(video.stat.danmaku)}
                    </span>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Spin>
    </div>
  );
}

export default Home;
