import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getLoginQrcode = async () => {
  const response = await api.get('/login/qrcode');
  return response.data;
};

export const pollLogin = async (qrcodeKey: string) => {
  const response = await api.get('/login/poll', { params: { qrcode_key: qrcodeKey } });
  return response.data;
};

export const getMyInfo = async () => {
  const response = await api.get('/user/me');
  return response.data;
};

export const searchVideo = async (keyword: string) => {
  // Mock search or implement backend search
  // For now let's assume backend returns list
  const response = await api.get('/video/search', { params: { keyword } });
  return response.data;
};

export const getVideoInfo = async (bvid: string) => {
  const response = await api.get(`/video/${bvid}`);
  return response.data;
};

export const getVideoComments = async (bvid: string) => {
  const response = await api.get(`/video/${bvid}/comments`);
  return response.data;
};

export const getVideoDanmaku = async (bvid: string) => {
  const response = await api.get(`/video/${bvid}/danmaku`);
  return response.data;
};

export const sendComment = async (bvid: string, message: string) => {
  const response = await api.post(`/video/${bvid}/comment`, { message });
  return response.data;
};

export const sendDanmaku = async (bvid: string, text: string, time: number) => {
  const response = await api.post(`/video/${bvid}/danmaku`, { text, time });
  return response.data;
};

export const getProxyVideoUrl = (url: string) => {
  return `${API_BASE_URL}/proxy/video?url=${encodeURIComponent(url)}`;
};
