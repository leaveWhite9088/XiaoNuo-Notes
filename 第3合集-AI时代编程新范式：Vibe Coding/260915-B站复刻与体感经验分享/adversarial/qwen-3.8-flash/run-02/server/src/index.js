// 后端入口：固定端口 5142
import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';

const PORT = Number(process.env.PORT || 5142);
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);
app.use((_req, res) => res.status(404).json({ code: -404, message: 'Not Found' }));

app.listen(PORT, () => {
  console.log(`[bili-server] B站复刻后端已启动: http://localhost:${PORT}/api (health: /api/health)`);
});
