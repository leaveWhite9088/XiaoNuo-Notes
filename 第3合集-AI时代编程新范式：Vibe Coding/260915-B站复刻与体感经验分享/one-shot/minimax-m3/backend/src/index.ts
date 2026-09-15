import express from 'express'
import cors from 'cors'
import apiRouter from './routes/api.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api', apiRouter)

const PORT = Number(process.env.PORT ?? 3002)
app.listen(PORT, () => {
  console.log(`[bilibili-clone backend] http://127.0.0.1:${PORT}`)
  console.log('  /api/ping       health check')
  console.log('  /api/home       首页分区数据')
  console.log('  /api/categories 分类与导航')
  console.log('  /api/hot        热门')
  console.log('  /api/search     搜索')
  console.log('  /api/video/:bvid 视频详情')
})
