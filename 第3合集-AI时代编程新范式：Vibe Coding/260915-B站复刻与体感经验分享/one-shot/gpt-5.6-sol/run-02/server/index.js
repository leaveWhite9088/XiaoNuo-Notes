import express from 'express'
import { categories, listVideos, videos } from './data/videos.js'

const app = express()
const PORT = 5401

app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'bilibili-clone-api', port: PORT })
})

app.get('/api/categories', (_req, res) => {
  res.json({ items: categories })
})

app.get('/api/videos', (req, res) => {
  const items = listVideos({ category: req.query.category, search: req.query.search })
  res.json({ items, total: items.length })
})

app.get('/api/videos/:id', (req, res) => {
  const video = videos.find((item) => item.id === req.params.id)
  if (!video) return res.status(404).json({ message: '视频不存在或已失效' })
  res.json(video)
})

app.get('/api/search/suggestions', (req, res) => {
  const keyword = String(req.query.q || '').trim()
  const fallback = ['城市漫游', '手机摄影技巧', '独立游戏', '烘焙教程', '极光旅行']
  const items = keyword
    ? listVideos({ search: keyword }).slice(0, 6).map(({ id, title, category }) => ({ id, title, category }))
    : fallback.map((title, index) => ({ id: videos[index].id, title, category: videos[index].category }))
  res.json({ items })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Bili API listening on http://localhost:${PORT}`)
})
