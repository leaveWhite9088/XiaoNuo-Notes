import React, { useState, useEffect } from 'react';
import { Card, message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';

function Login({ onLoginSuccess }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrcodeKey, setQrcodeKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('pending');
  const navigate = useNavigate();

  useEffect(() => {
    getQrCode();
    return () => {
      if (window.pollingTimer) {
        clearInterval(window.pollingTimer);
      }
    };
  }, []);

  const getQrCode = async () => {
    try {
      setLoading(true);
      const res = await request.get('/login/qrcode');
      if (res.success) {
        setQrCodeUrl(res.data.qrCodeUrl);
        setQrcodeKey(res.data.qrcode_key);
        setStatus('pending');
        startPolling(res.data.qrcode_key);
      } else {
        message.error('获取二维码失败');
      }
    } catch (error) {
      message.error('获取二维码失败');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (key) => {
    window.pollingTimer = setInterval(async () => {
      try {
        const res = await request.post('/login/check', { qrcode_key: key });
        if (res.success) {
          if (res.data.status === 'success') {
            clearInterval(window.pollingTimer);
            message.success('登录成功');
            onLoginSuccess();
            navigate('/');
          } else if (res.data.status === 'expired') {
            clearInterval(window.pollingTimer);
            setStatus('expired');
            message.info('二维码已过期，请刷新');
          }
        }
      } catch (error) {
        console.error('检查登录状态失败');
      }
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
      <Card
        title="扫码登录Bilibili"
        style={{ width: 400, textAlign: 'center' }}
        extra={status === 'expired' ? <a onClick={getQrCode}>刷新二维码</a> : null}
      >
        <Spin spinning={loading}>
          {qrCodeUrl ? (
            <div>
              <img src={qrCodeUrl} alt="登录二维码" style={{ width: 200, height: 200, marginBottom: 20 }} />
              <p style={{ color: '#666' }}>
                {status === 'pending' ? '请使用Bilibili客户端扫码登录' : '二维码已过期，请点击刷新'}
              </p>
            </div>
          ) : (
            <p>加载中...</p>
          )}
        </Spin>
        <p style={{ marginTop: 20, fontSize: 12, color: '#999' }}>
          扫码后请在手机上确认登录，登录成功后将自动跳转
        </p>
      </Card>
    </div>
  );
}

export default Login;
