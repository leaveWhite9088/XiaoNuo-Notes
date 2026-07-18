import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, message } from 'antd';
import { HomeOutlined, UserOutlined, LoginOutlined, LogoutOutlined, StarOutlined } from '@ant-design/icons';
import Home from './pages/Home';
import VideoDetail from './pages/VideoDetail';
import UserCenter from './pages/UserCenter';
import Login from './pages/Login';
import request from './utils/request';

const { Header, Content } = Layout;

function App() {
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const res = await request.get('/user/info');
      if (res.success) {
        setUserInfo(res.data);
      }
    } catch (error) {
      console.error('获取用户信息失败');
    }
  };

  const handleLogout = async () => {
    try {
      await request.post('/logout');
      setUserInfo(null);
      message.success('登出成功');
      navigate('/');
    } catch (error) {
      message.error('登出失败');
    }
  };

  const userMenuItems = [
    {
      key: 'center',
      icon: <UserOutlined />,
      label: <Link to="/user">个人中心</Link>
    },
    {
      key: 'favorites',
      icon: <StarOutlined />,
      label: <Link to="/user/favorites">我的收藏</Link>
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="nav-bar" style={{ padding: '0 50px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
            <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', color: '#FB7299' }}>
              Bilibili
            </Link>
            <Menu
              mode="horizontal"
              defaultSelectedKeys={['home']}
              style={{ flex: 1, minWidth: 0, border: 'none' }}
              items={[
                { key: 'home', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
                { key: 'hot', label: '热门' },
                { key: 'live', label: '直播' },
                { key: 'anime', label: '番剧' },
              ]}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <a href="https://www.bilibili.com" target="_blank" rel="noopener noreferrer">
              <Button type="default">跳转官网</Button>
            </a>
            {userInfo ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <Avatar src={userInfo.face} size={32} />
                  <span>{userInfo.name}</span>
                </div>
              </Dropdown>
            ) : (
              <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
                登录
              </Button>
            )}
          </div>
        </div>
      </Header>
      <Content style={{ padding: '24px 50px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/video/:bvid" element={<VideoDetail userInfo={userInfo} />} />
          <Route path="/user" element={<UserCenter />} />
          <Route path="/login" element={<Login onLoginSuccess={checkLoginStatus} />} />
        </Routes>
      </Content>
    </Layout>
  );
}

export default App;
