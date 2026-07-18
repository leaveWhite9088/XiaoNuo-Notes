import { useState } from 'react';
import { Layout, Input, Button, Avatar, Dropdown, Badge, Space } from 'antd';
import {
  SearchOutlined,
  BellOutlined,
  UploadOutlined,
  DownOutlined,
  LogoutOutlined,
  UserOutlined,
  StarOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/user';

const { Header: AntHeader } = Layout;

export const Header = () => {
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const { isLogin, userInfo, logout } = useUserStore();

  const handleSearch = () => {
    if (searchText.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchText.trim())}`);
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">个人中心</Link>,
    },
    {
      key: 'favorites',
      icon: <StarOutlined />,
      label: <Link to="/favorites">我的收藏</Link>,
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: <Link to="/history">观看历史</Link>,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <AntHeader
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <div
          style={{
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, #00AEEC 0%, #00B5E5 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <span style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>B</span>
        </div>
        <span style={{ fontSize: 20, fontWeight: 'bold', color: '#00AEEC' }}>哔哩哔哩</span>
      </Link>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 500, margin: '0 40px' }}>
        <Input.Search
          placeholder="搜索视频、UP主..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={handleSearch}
          enterButton={
            <Button
              type="primary"
              style={{ background: '#E3E5E7', borderColor: '#E3E5E7', color: '#61666D' }}
            >
              <SearchOutlined />
            </Button>
          }
          style={{
            borderRadius: 8,
            overflow: 'hidden',
          }}
        />
      </div>

      {/* Right Actions */}
      <Space size={24}>
        {isLogin ? (
          <>
            <Badge count={5} size="small">
              <BellOutlined style={{ fontSize: 22, color: '#61666D', cursor: 'pointer' }} />
            </Badge>
            <Button type="primary" icon={<UploadOutlined />} style={{ borderRadius: 8 }}>
              投稿
            </Button>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar
                  src={userInfo?.face}
                  size={36}
                  style={{ border: '2px solid #00AEEC' }}
                />
                <span style={{ color: '#18191C', fontSize: 14 }}>{userInfo?.name}</span>
                <DownOutlined style={{ fontSize: 12, color: '#9499A0' }} />
              </div>
            </Dropdown>
          </>
        ) : (
          <Button
            type="primary"
            style={{
              background: '#00AEEC',
              borderColor: '#00AEEC',
              borderRadius: 8,
              padding: '0 24px',
            }}
            onClick={() => navigate('/login')}
          >
            登录
          </Button>
        )}
      </Space>
    </AntHeader>
  );
};
