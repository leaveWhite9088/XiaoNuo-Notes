/**
 * B 站风格首页复刻 — 后端入口
 * 暴露：/api/categories, /api/videos, /api/videos/:id, /api/search, /api/ranking, /api/up/:id
 * 端口默认 4000
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const { loadAll } = require('./data/store');
const videosRouter = require('./routes/videos');
const categoriesRouter = require('./routes/categories');
const searchRouter = require('./routes/search');
const rankingRouter = require('./routes/ranking');
const upRouter = require('./routes/up');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// 把 mock 数据装载到内存
const store = loadAll();
app.locals.store = store;

// 简单访问日志
app.use((req, _res, next) => {
  const t = new Date().toISOString().slice(11, 19);
  console.log(`[${t}] ${req.method} ${req.url}`);
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.use('/api/videos', videosRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/search', searchRouter);
app.use('/api/ranking', rankingRouter);
app.use('/api/up', upRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'not_found', path: req.url });
});

app.use((err, _req, res, _next) => {
  console.error('[server error]', err);
  res.status(500).json({ error: 'internal_error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`[bilibili-mock] listening on http://localhost:${PORT}`);
});
