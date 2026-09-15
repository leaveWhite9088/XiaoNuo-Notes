import { Router } from 'express'
import { videos, carousel } from '../data/videos.js'
import { commentsFor } from '../data/comments.js'
import { channels, extraLinks, navLeft, navMore } from '../data/meta.js'

export const feedRouter = Router()

function shuffle(list, seed = Date.now()) {
  const arr = list.slice()
  let s = seed >>> 0
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0
    const j = s % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function card(v) {
  const { danmakuList, desc, src, ...rest } = v
  return rest
}

function matchQuery(v, q) {
  if (!q) return true
  const s = q.toLowerCase()
  return (
    v.title.toLowerCase().includes(s) ||
    v.owner.name.toLowerCase().includes(s) ||
    v.tags.some((t) => t.toLowerCase().includes(s)) ||
    v.channel.includes(s)
  )
}

feedRouter.get('/meta', (_req, res) => {
  res.json({ channels, extraLinks, navLeft, navMore })
})

feedRouter.get('/carousel', (_req, res) => {
  res.json({ list: carousel })
})

feedRouter.get('/videos', (req, res) => {
  const { channel = 'recommend', q = '', page = '1', pageSize = '12', seed } = req.query
  const pageNum = Math.max(1, Number(page) || 1)
  const size = Math.min(30, Math.max(6, Number(pageSize) || 12))
  let list = videos.filter((v) => matchQuery(v, String(q)))

  if (channel && channel !== 'recommend' && channel !== 'dongtai') {
    if (channel === 'hot') list = list.slice().sort((a, b) => b.views - a.views)
    else list = list.filter((v) => v.channel === channel)
  } else {
    list = shuffle(list, Number(seed) || 20260911)
  }

  const start = (pageNum - 1) * size
  const slice = list.slice(start, start + size).map(card)
  res.json({
    list: slice,
    total: list.length,
    page: pageNum,
    pageSize: size,
    hasMore: start + size < list.length
  })
})

feedRouter.get('/videos/:bvid', (req, res) => {
  const v = videos.find((x) => x.bvid === req.params.bvid)
  if (!v) return res.status(404).json({ message: '视频不存在' })
  res.json({ video: v })
})

feedRouter.get('/videos/:bvid/related', (req, res) => {
  const v = videos.find((x) => x.bvid === req.params.bvid)
  if (!v) return res.status(404).json({ message: '视频不存在' })
  const same = videos.filter((x) => x.bvid !== v.bvid && x.channel === v.channel)
  const rest = videos.filter((x) => x.bvid !== v.bvid && x.channel !== v.channel)
  const list = [...same, ...rest].slice(0, 12).map(card)
  res.json({ list })
})

feedRouter.get('/videos/:bvid/comments', (req, res) => {
  const v = videos.find((x) => x.bvid === req.params.bvid)
  if (!v) return res.status(404).json({ message: '视频不存在' })
  res.json({ list: commentsFor(v.bvid), count: commentsFor(v.bvid).length })
})

feedRouter.post('/videos/:bvid/stat', (req, res) => {
  const v = videos.find((x) => x.bvid === req.params.bvid)
  if (!v) return res.status(404).json({ message: '视频不存在' })
  const type = req.body?.type
  if (type === 'like') v.likes += 1
  if (type === 'coin') v.coins += 1
  if (type === 'favorite') v.favorites += 1
  if (type === 'share') v.shares += 1
  res.json({ likes: v.likes, coins: v.coins, favorites: v.favorites, shares: v.shares })
})
