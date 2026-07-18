import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import dotenv from 'dotenv';

import routes from './routes';
import { bilibiliApi } from './services/bilibili-api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'bilibili-clone-secret-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 604800000
  }
}));

app.use((req, res, next) => {
  if (req.session?.user?.cookie && req.session.user.csrf) {
    bilibiliApi.setAuth(req.session.user.cookie, req.session.user.csrf);
  }
  next();
});

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`${err.status || 500} - ${err.message}`);
  console.error(err.stack);
  res.status(err.status || 500).json({ code: err.status || 500, message: err.message || 'Internal Server Error', data: null });
});

app.listen(PORT, () => {
  console.log(`🚀 Bilibili Clone Backend running on http://localhost:${PORT}`);
  console.log(`📡 API base URL: http://localhost:${PORT}/api`);
});