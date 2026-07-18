import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Card, Input, Button, Tabs, message, Divider, Space } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  QrcodeOutlined,
  MobileOutlined,
  GithubOutlined,
  WechatOutlined,
  QqOutlined,
} from '@ant-design/icons';
import { useUserStore } from '../stores/user';

const { Content } = Layout;

export const Login = () => {
  const navigate = useNavigate();
  const { setLogin } = useUserStore();
  const [activeTab, setActiveTab] = useState('password');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      message.warning('请输入用户名和密码');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const mockUser = {
        mid: 123456,
        name: formData.username,
        face: 'https://i0.hdslb.com/bfs/face/5a9fb8dc337845db3b1d013e3f14fbe4a33132fe.jpg',
        level: 5,
        sign: '这个人很懒，什么都没有写~',
        coins: 520,
        following: 128,
        follower: 666,
      };

      setLogin(mockUser, 'mock_sessdata_token', 'mock_csrf_token');
      message.success('登录成功！');
      navigate('/');
      setLoading(false);
    }, 1000);
  };

  const generateQRCode = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = 200;
    canvas.height = 200;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 200, 200);

    ctx.fillStyle = '#000';
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        if (Math.random() > 0.5) {
          ctx.fillRect(i * 8, j * 8, 8, 8);
        }
      }
    }

    ctx.fillStyle = '#00AEEC';
    ctx.fillRect(60, 60, 80, 80);
    ctx.fillStyle = '#fff';
    ctx.fillRect(70, 70, 60, 60);
    ctx.fillStyle = '#00AEEC';
    ctx.fillRect(80, 80, 40, 40);

    return canvas.toDataURL();
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === 'qrcode') {
      setQrCode(generateQRCode());
    }
  };

  const tabItems = [
    {
      key: 'password',
      label: (
        <span>
          <UserOutlined style={{ marginRight: 8 }} />
          密码登录
        </span>
      ),
    },
    {
      key: 'qrcode',
      label: (
        <span>
          <QrcodeOutlined style={{ marginRight: 8 }} />
          扫码登录
        </span>
      ),
    },
    {
      key: 'sms',
      label: (
        <span>
          <MobileOutlined style={{ marginRight: 8 }} />
          短信登录
        </span>
      ),
    },
  ];

  return (
    <Content
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 24,
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        bodyStyle={{ padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: 'linear-gradient(135deg, #00AEEC 0%, #00B5E5 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <span style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>B</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#18191C', margin: 0 }}>
            欢迎回来
          </h1>
          <p style={{ color: '#9499A0', marginTop: 8 }}>登录后可享受更多功能</p>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          centered
          style={{ marginBottom: 24 }}
        />

        {activeTab === 'password' && (
          <div>
            <Input
              size="large"
              placeholder="请输入用户名/手机号/邮箱"
              prefix={<UserOutlined style={{ color: '#9499A0' }} />}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              style={{ marginBottom: 16 }}
            />
            <Input.Password
              size="large"
              placeholder="请输入密码"
              prefix={<LockOutlined style={{ color: '#9499A0' }} />}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{ marginBottom: 24 }}
            />
            <Button
              type="primary"
              size="large"
              block
              loading={loading}
              onClick={handleLogin}
              style={{
                background: '#00AEEC',
                borderRadius: 8,
                height: 48,
                fontSize: 16,
              }}
            >
              登 录
            </Button>
          </div>
        )}

        {activeTab === 'qrcode' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div
              style={{
                width: 200,
                height: 200,
                margin: '0 auto 20px',
                border: '2px solid #E3E5E7',
                borderRadius: 12,
                padding: 12,
              }}
            >
              {qrCode ? (
                <img src={qrCode} alt="二维码" style={{ width: '100%', height: '100%' }} />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: '#F1F2F3',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9499A0',
                  }}
                >
                  加载中...
                </div>
              )}
            </div>
            <p style={{ color: '#61666D', marginBottom: 8 }}>请使用哔哩哔哩APP扫码登录</p>
            <p style={{ color: '#9499A0', fontSize: 13 }}>扫码即代表同意用户协议和隐私政策</p>
          </div>
        )}

        {activeTab === 'sms' && (
          <div>
            <Input
              size="large"
              placeholder="请输入手机号"
              prefix={<MobileOutlined style={{ color: '#9499A0' }} />}
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <Input
                size="large"
                placeholder="请输入验证码"
                prefix={<LockOutlined style={{ color: '#9499A0' }} />}
                style={{ flex: 1 }}
              />
              <Button size="large" style={{ width: 120 }}>
                获取验证码
              </Button>
            </div>
            <Button
              type="primary"
              size="large"
              block
              style={{
                background: '#00AEEC',
                borderRadius: 8,
                height: 48,
                fontSize: 16,
              }}
            >
              登 录
            </Button>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 16,
            color: '#9499A0',
            fontSize: 13,
          }}
        >
          <span style={{ cursor: 'pointer' }}>忘记密码?</span>
          <span style={{ cursor: 'pointer', color: '#00AEEC' }}>注册账号</span>
        </div>

        <Divider>
          <span style={{ color: '#9499A0', fontSize: 13 }}>其他登录方式</span>
        </Divider>

        <Space size={24} style={{ display: 'flex', justifyContent: 'center' }}>
          <Button shape="circle" size="large" icon={<GithubOutlined />} />
          <Button shape="circle" size="large" icon={<WechatOutlined />} style={{ color: '#07C160' }} />
          <Button shape="circle" size="large" icon={<QqOutlined />} style={{ color: '#12B7F5' }} />
        </Space>
      </Card>
    </Content>
  );
};
