// 入口：Express 服务器，固定端口 5131
import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';

const PORT = 5131;
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ code: 0, data: { status: 'ok', uptime: process.uptime() } }));
app.use('/api', apiRouter);

app.use((req, res) => res.status(404).json({ code: 404, message: `Not Found: ${req.method} ${req.path}` }));

app.listen(PORT, () => {
  console.log(`[server] B站复刻 API 已启动: http://localhost:${PORT}/api/health`);
});
