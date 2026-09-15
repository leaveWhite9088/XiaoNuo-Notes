const path = require('path')
const express = require('express')
const cors = require('cors')
const videoRoutes = require('./routes/videos')
const searchRoutes = require('./routes/search')
const metaRoutes = require('./routes/meta')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ code: 0, data: { ok: true, name: 'bilibili-home-mvp' } })
})

app.use('/api/videos', videoRoutes)
app.use('/api/search', searchRoutes)
app.use('/api', metaRoutes)

const clientDist = path.join(__dirname, '../../client/dist')
app.use(express.static(clientDist))
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next()
  })
})

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Bilibili API running at http://127.0.0.1:${PORT}`)
})
