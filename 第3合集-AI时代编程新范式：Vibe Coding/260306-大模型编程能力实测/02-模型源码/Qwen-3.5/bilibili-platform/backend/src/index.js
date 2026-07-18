const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');

const videoRoutes = require('./routes/video');
const userRoutes = require('./routes/user');
const commentRoutes = require('./routes/comment');
const danmakuRoutes = require('./routes/danmaku');
const favoriteRoutes = require('./routes/favorite');
const searchRoutes = require('./routes/search');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'bilibili-secret-key-2024',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use('/api/videos', videoRoutes);
app.use('/api/user', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/danmaku', danmakuRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/search', searchRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bilibili API Server is running' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🎬 Bilibili Backend Server running on http://localhost:${PORT}`);
  console.log(`📺 API available at http://localhost:${PORT}/api`);
});
