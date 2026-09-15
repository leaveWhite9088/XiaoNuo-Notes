import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { feedRouter } from './routes/feed.js'
import { searchRouter } from './routes/search.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3002

app.use(cors())
app.use(express.json())

app.use('/api', feedRouter)
app.use('/api', searchRouter)

const dist = path.resolve(__dirname, '../dist')
app.use(express.static(dist))
app.use('/images', express.static(path.resolve(__dirname, '../public/images')))
app.use('/videos', express.static(path.resolve(__dirname, '../public/videos')))

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(dist, 'index.html'), (err) => {
    if (err) next()
  })
})

app.listen(PORT, () => {
  console.log(`[bilibili-home] API http://127.0.0.1:${PORT}`)
})
