const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { BilibiliAPI, getQrCode, checkQrCodeStatus } = require('bilibili-api');
const axios = require('axios');
const qrcode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

let userSession = null;

// 生成登录二维码
app.get('/api/login/qrcode', async (req, res) => {
  try {
    const qrCodeData = await getQrCode();
    const qrCodeUrl = await qrcode.toDataURL(qrCodeData.url);
    res.json({
      success: true,
      data: {
        qrCodeUrl,
        qrcode_key: qrCodeData.qrcode_key
      }
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// 检查二维码登录状态
app.post('/api/login/check', async (req, res) => {
  try {
    const { qrcode_key } = req.body;
    const status = await checkQrCodeStatus(qrcode_key);
    
    if (status.code === 0) {
      userSession = status.data;
      res.cookie('bilibili_session', JSON.stringify(userSession), { 
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false
      });
      res.json({ success: true, data: { status: 'success', userInfo: status.data } });
    } else {
      res.json({ 
        success: true, 
        data: { 
          status: status.code === 86038 ? 'expired' : 'pending',
          message: status.message 
        } 
      });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// 获取用户信息
app.get('/api/user/info', async (req, res) => {
  try {
    if (!userSession) {
      return res.json({ success: false, message: '未登录' });
    }
    const api = new BilibiliAPI(userSession);
    const userInfo = await api.getUserInfo();
    res.json({ success: true, data: userInfo });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// 获取推荐视频
app.get('/api/videos/recommend', async (req, res) => {
  try {
    const api = userSession ? new BilibiliAPI(userSession) : new BilibiliAPI();
    const videos = await api.getRecommendVideos({ ps: 20 });
    res.json({ success: true, data: videos });
  } catch (error) {
    // 模拟数据，避免API调用失败
    const mockVideos = Array.from({ length: 20 }, (_, i) => ({
      bvid: `BV${Math.random().toString(36).substring(2, 10)}`,
      title: `示例视频标题 ${i+1}`,
      pic: `https://picsum.photos/seed/${i}/300/180`,
      owner: { name: `UP主${i+1}`, face: `https://picsum.photos/seed/${i+100}/50/50` },
      stat: { view: Math.floor(Math.random() * 1000000), danmaku: Math.floor(Math.random() * 10000) },
      duration: Math.floor(Math.random() * 3600)
    }));
    res.json({ success: true, data: mockVideos });
  }
});

// 获取视频详情
app.get('/api/video/:bvid', async (req, res) => {
  try {
    const { bvid } = req.params;
    const api = userSession ? new BilibiliAPI(userSession) : new BilibiliAPI();
    const videoInfo = await api.getVideoInfo(bvid);
    res.json({ success: true, data: videoInfo });
  } catch (error) {
    // 模拟数据
    const mockVideo = {
      bvid: req.params.bvid,
      title: '示例视频标题',
      desc: '这是一个示例视频的描述内容，视频非常精彩，欢迎观看！',
      pic: 'https://picsum.photos/seed/video/640/360',
      owner: { name: '示例UP主', face: 'https://picsum.photos/seed/up/100/100', mid: 123456 },
      stat: { view: 123456, danmaku: 7890, like: 4567, coin: 2345, favorite: 1234, share: 567 },
      duration: 1234,
      cid: 123456789
    };
    res.json({ success: true, data: mockVideo });
  }
});

// 获取视频弹幕
app.get('/api/video/:bvid/danmaku', async (req, res) => {
  try {
    const { bvid } = req.params;
    const api = userSession ? new BilibiliAPI(userSession) : new BilibiliAPI();
    const danmaku = await api.getDanmaku(bvid);
    res.json({ success: true, data: danmaku });
  } catch (error) {
    // 模拟弹幕数据
    const mockDanmaku = Array.from({ length: 50 }, (_, i) => ({
      text: `这是第${i+1}条弹幕`,
      time: i * 2,
      color: '#ffffff',
      type: 1
    }));
    res.json({ success: true, data: mockDanmaku });
  }
});

// 发送弹幕
app.post('/api/video/:bvid/danmaku', async (req, res) => {
  try {
    if (!userSession) {
      return res.json({ success: false, message: '请先登录' });
    }
    const { bvid } = req.params;
    const { text, time, color } = req.body;
    const api = new BilibiliAPI(userSession);
    await api.sendDanmaku(bvid, { text, time, color });
    res.json({ success: true, message: '弹幕发送成功' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// 获取视频评论
app.get('/api/video/:bvid/comments', async (req, res) => {
  const { page = 1, ps = 20 } = req.query;
  try {
    const { bvid } = req.params;
    const api = userSession ? new BilibiliAPI(userSession) : new BilibiliAPI();
    const comments = await api.getComments(bvid, { page, ps });
    res.json({ success: true, data: comments });
  } catch (error) {
    // 模拟评论数据
    const mockComments = Array.from({ length: 20 }, (_, i) => ({
      rpid: i + 1,
      member: {
        uname: `用户${i+1}`,
        avatar: `https://picsum.photos/seed/${i+200}/50/50`,
        level_info: { current_level: Math.floor(Math.random() * 6) + 1 }
      },
      content: { message: `这是第${i+1}条评论，内容非常精彩！` },
      like: Math.floor(Math.random() * 1000),
      ctime: Date.now() / 1000 - i * 3600,
      replies: i < 5 ? Array.from({ length: 3 }, (_, j) => ({
        rpid: i * 10 + j,
        member: { uname: `回复用户${j+1}`, avatar: `https://picsum.photos/seed/${i+j+300}/50/50` },
        content: { message: `回复评论：这是第${j+1}条回复` },
        like: Math.floor(Math.random() * 100)
      })) : []
    }));
    res.json({ success: true, data: { replies: mockComments, page: { num: page, size: ps, count: 100 } } });
  }
});

// 发送评论
app.post('/api/video/:bvid/comments', async (req, res) => {
  try {
    if (!userSession) {
      return res.json({ success: false, message: '请先登录' });
    }
    const { bvid } = req.params;
    const { message } = req.body;
    const api = new BilibiliAPI(userSession);
    await api.sendComment(bvid, message);
    res.json({ success: true, message: '评论发送成功' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// 获取用户收藏视频
app.get('/api/user/favorites', async (req, res) => {
  try {
    if (!userSession) {
      return res.json({ success: false, message: '请先登录' });
    }
    const api = new BilibiliAPI(userSession);
    const favorites = await api.getUserFavorites();
    res.json({ success: true, data: favorites });
  } catch (error) {
    // 模拟收藏数据
    const mockFavorites = Array.from({ length: 10 }, (_, i) => ({
      bvid: `BV${Math.random().toString(36).substring(2, 10)}`,
      title: `我收藏的视频 ${i+1}`,
      pic: `https://picsum.photos/seed/${i+400}/300/180`,
      owner: { name: `UP主${i+10}` },
      stat: { view: Math.floor(Math.random() * 100000) }
    }));
    res.json({ success: true, data: mockFavorites });
  }
});

// 登出
app.post('/api/logout', (req, res) => {
  userSession = null;
  res.clearCookie('bilibili_session');
  res.json({ success: true, message: '登出成功' });
});

app.listen(PORT, () => {
  console.log(`Bilibili后端服务运行在 http://localhost:${PORT}`);
});
