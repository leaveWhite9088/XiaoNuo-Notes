import express from 'express'
import cors from 'cors'
import { categories, videos } from './data/videos.js'

const app = express()
const PORT = 5402

app.use(cors({ origin: 'http://localhost:3402' }))
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'bilibili-clone-api' }))

app.get('/api/categories', (_req, res) => res.json({ categories }))

app.get('/api/videos', (req, res) => {
  const category = String(req.query.category || '').trim()
  const keyword = String(req.query.q || '').trim().toLowerCase()
  const result = videos.filter((video) => {
    const categoryMatch = !category || category === '首页' || video.category === category
    const keywordMatch = !keyword || `${video.title}${video.author}${video.category}`.toLowerCase().includes(keyword)
    return categoryMatch && keywordMatch
  })
  res.json({ videos: result, total: result.length })
})

app.get('/api/videos/:id', (req, res) => {
  const video = videos.find((item) => item.id === req.params.id)
  if (!video) return res.status(404).json({ message: '视频不存在' })
  const related = videos
    .filter((item) => item.id !== video.id)
    .sort((a, b) => Number(b.category === video.category) - Number(a.category === video.category))
    .slice(0, 6)
  res.json({ video, related })
})

app.get('/api/search/suggest', (req, res) => {
  const keyword = String(req.query.q || '').trim().toLowerCase()
  if (!keyword) {
    return res.json({ suggestions: ['秋日旅行', '治愈系音乐', '猫咪日常', '快速早餐', '摄影教程'] })
  }
  const suggestions = videos
    .filter((video) => `${video.title}${video.author}${video.category}`.toLowerCase().includes(keyword))
    .slice(0, 7)
    .map((video) => ({ id: video.id, title: video.title, category: video.category }))
  res.json({ suggestions })
})

app.listen(PORT, () => console.log(`API ready at http://localhost:${PORT}`))
