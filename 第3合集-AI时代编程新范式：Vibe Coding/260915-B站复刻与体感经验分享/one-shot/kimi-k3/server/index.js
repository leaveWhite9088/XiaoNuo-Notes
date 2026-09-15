import express from 'express';
import cors from 'cors';
import feedRouter from './routes/feed.js';
import videoRouter from './routes/video.js';
import searchRouter from './routes/search.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', feedRouter);
app.use('/api', videoRouter);
app.use('/api', searchRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`[bili-server] API ready at http://localhost:${PORT}`);
});
