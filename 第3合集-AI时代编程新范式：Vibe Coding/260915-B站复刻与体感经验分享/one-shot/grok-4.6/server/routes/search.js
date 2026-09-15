import { Router } from 'express'
import { videos } from '../data/videos.js'
import { hotSearches } from '../data/meta.js'

export const searchRouter = Router()

searchRouter.get('/search/hot', (_req, res) => {
  res.json({ list: hotSearches })
})

searchRouter.get('/search/suggest', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase()
  if (!q) return res.json({ list: [] })
  const seen = new Set()
  const list = []
  for (const v of videos) {
    const hits = [v.title, v.owner.name, ...v.tags]
    for (const h of hits) {
      if (h.toLowerCase().includes(q) && !seen.has(h)) {
        seen.add(h)
        list.push({ text: h, type: h === v.owner.name ? 'up' : h === v.title ? 'video' : 'tag' })
      }
    }
    if (list.length >= 8) break
  }
  res.json({ list })
})
