import { Router } from 'express'
import {
  homeSections,
  getVideoByBvid,
  getRelated,
  searchVideos,
  getRecommendSuggests,
  listByTid,
  getHot,
  getComments,
  allVideos,
} from '../mock/generator.js'
import { CATEGORIES, NAV_LINKS, getCategoryName } from '../../data/categories.js'

const router = Router()

router.get('/ping', (_req, res) => {
  res.json({ ok: true, time: Date.now() })
})

router.get('/home', (_req, res) => {
  res.json({ sections: homeSections })
})

router.get('/categories', (_req, res) => {
  res.json({ categories: CATEGORIES, nav: NAV_LINKS })
})

router.get('/hot', (req, res) => {
  const limit = Math.min(200, Number(req.query.limit ?? 100))
  res.json({ items: getHot(limit) })
})

router.get('/search', (req, res) => {
  const keyword = String(req.query.kw ?? '')
  const limit = Math.min(50, Number(req.query.limit ?? 20))
  res.json({ items: searchVideos(keyword, limit), total: searchVideos(keyword, 999).length })
})

router.get('/search/suggest', (req, res) => {
  const keyword = String(req.query.kw ?? '')
  res.json({ items: getRecommendSuggests(keyword) })
})

router.get('/channel/:tid', (req, res) => {
  const tid = Number(req.params.tid)
  const page = Math.max(1, Number(req.query.page ?? 1))
  const pageSize = Math.min(60, Number(req.query.pageSize ?? 30))
  if (tid === 0) {
    return res.json({ category: { tid: 0, name: '首页' }, ...listByTid(0, page, pageSize) })
  }
  const data = listByTid(tid, page, pageSize)
  res.json({ category: CATEGORIES.find((c) => c.tid === tid) ?? { tid, name: getCategoryName(tid) }, ...data })
})

router.get('/video/:bvid', (req, res) => {
  const bvid = req.params.bvid
  const v = getVideoByBvid(bvid)
  if (!v) return res.status(404).json({ error: 'video not found' })
  const related = getRelated(bvid, v.tid, 20)
  const comments = getComments(bvid, 30)
  res.json({ video: v, related, comments })
})

// 总数
router.get('/stats', (_req, res) => {
  res.json({ totalVideos: allVideos.length, totalCategories: CATEGORIES.length })
})

export default router
