const express = require('express')
const searchService = require('../services/searchService')

const router = express.Router()

router.get('/suggest', (req, res) => {
  res.json({ code: 0, data: searchService.suggest(req.query.q || '') })
})

router.get('/', (req, res) => {
  const list = searchService.searchVideos(req.query.q || '', req.query.sort)
  res.json({
    code: 0,
    data: {
      keyword: req.query.q || '',
      total: list.length,
      list
    }
  })
})

module.exports = router
