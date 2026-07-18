const express = require('express');
const router = express.Router();
const { Bilibili } = require('../utils/bilibili');

router.get('/login/qrcode', async (req, res, next) => {
  try {
    const api = new Bilibili();
    const qrcode = await api.getLoginQRCode();
    res.json({ success: true, data: qrcode });
  } catch (error) {
    next(error);
  }
});

router.get('/login/status/:oauthKey', async (req, res, next) => {
  try {
    const { oauthKey } = req.params;
    const api = new Bilibili();
    const status = await api.getLoginStatus(req.params.oauthKey);
    
    if (status.isLogin && status.cookies) {
      req.session.cookies = status.cookies;
      req.session.isLogin = true;
    }
    
    res.json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
});

router.get('/info', async (req, res, next) => {
  try {
    const api = new Bilibili(req.session.cookies);
    const info = await api.getUserInfo();
    res.json({ success: true, data: info });
  } catch (error) {
    res.json({ success: false, error: 'Not logged in' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

router.get('/check', (req, res) => {
  res.json({ 
    success: true, 
    data: { isLogin: !!req.session.isLogin }
  });
});

module.exports = router;
