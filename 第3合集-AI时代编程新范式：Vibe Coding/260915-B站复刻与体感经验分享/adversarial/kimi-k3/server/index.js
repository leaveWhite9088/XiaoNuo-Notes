const express = require('express');
const videosRouter = require('./routes/videos');
const searchRouter = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 3317;

app.use(express.json());

// 简单 CORS（开发阶段 vite proxy 为主，双保险）
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use('/api', videosRouter);
app.use('/api', searchRouter);

app.get('/api/health', (req, res) => res.json({ code: 0, message: 'ok' }));

app.use((req, res) => {
  res.status(404).json({ code: 404, message: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`[server] B站首页复刻 API 已启动: http://localhost:${PORT}`);
});
