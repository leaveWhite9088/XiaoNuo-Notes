const express = require('express')
const videoService = require('../services/videoService')

const router = express.Router()

router.get('/', (req, res) => {
  const { channel, page, pageSize, sort, shuffle } = req.query
  res.json({ code: 0, data: videoService.listVideos({ channel, page, pageSize, sort, shuffle }) })
})

router.get('/carousel', (_req, res) => {
  res.json({ code: 0, data: videoService.getCarousel() })
})

router.get('/featured', (_req, res) => {
  res.json({ code: 0, data: videoService.featuredVideos() })
})

router.get('/:id', (req, res) => {
  const video = videoService.getVideo(req.params.id)
  if (!video) return res.status(404).json({ code: 404, message: '视频不存在' })
  res.json({ code: 0, data: video })
})

router.get('/:id/related', (req, res) => {
  res.json({ code: 0, data: videoService.relatedVideos(req.params.id) })
})

router.get('/:id/comments', (req, res) => {
  res.json({ code: 0, data: videoService.getComments(req.params.id) })
})

router.post('/:id/action', (req, res) => {
  const type = req.body?.type
  const video = videoService.actOnVideo(req.params.id, type)
  if (!video) return res.status(404).json({ code: 404, message: '视频不存在' })
  res.json({ code: 0, data: video })
})

module.exports = router
