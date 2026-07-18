import React, { useEffect, useState } from 'react';
import { getLoginQrcode, pollLogin } from '../api';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';

const Login: React.FC = () => {
  const [qrUrl, setQrUrl] = useState('');
  const [qrKey, setQrKey] = useState('');
  const [status, setStatus] = useState('loading'); // loading, scan, success, expired
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQrcode = async () => {
      try {
        const data = await getLoginQrcode();
        setQrUrl(data.url);
        setQrKey(data.qrcode_key);
        setStatus('scan');
      } catch (e) {
        console.error(e);
        setStatus('error');
      }
    };
    fetchQrcode();
  }, []);

  useEffect(() => {
    if (!qrKey || status === 'success') return;

    const interval = setInterval(async () => {
      try {
        const res = await pollLogin(qrKey);
        if (res.status === 'success') {
          setStatus('success');
          clearInterval(interval);
          setTimeout(() => navigate('/'), 1000);
        } else if (res.status === 'expired') {
          setStatus('expired');
          clearInterval(interval);
        }
      } catch (e) {
        console.error(e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [qrKey, status, navigate]);

  const [qrImage, setQrImage] = useState('');

  useEffect(() => {
    if (qrUrl) {
      QRCode.toDataURL(qrUrl).then(setQrImage);
    }
  }, [qrUrl]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">扫码登录</h2>
        
        <div className="mb-6 flex justify-center">
          {status === 'loading' && <div className="w-48 h-48 bg-gray-100 animate-pulse rounded"></div>}
          {status === 'scan' && qrImage && (
            <img src={qrImage} alt="Login QR Code" className="w-48 h-48" />
          )}
          {status === 'success' && (
            <div className="w-48 h-48 flex items-center justify-center text-green-500 font-bold text-xl">
              登录成功!
            </div>
          )}
          {status === 'expired' && (
             <div className="w-48 h-48 flex items-center justify-center text-red-500 font-bold flex-col">
              <span>二维码已过期</span>
              <button onClick={() => window.location.reload()} className="mt-2 text-sm text-blue-500 underline">刷新</button>
            </div>
          )}
        </div>

        <p className="text-gray-500 text-sm">
          请使用 <span className="text-bilibili-pink font-bold">哔哩哔哩客户端</span> 扫码登录
        </p>
      </div>
    </div>
  );
};

export default Login;
