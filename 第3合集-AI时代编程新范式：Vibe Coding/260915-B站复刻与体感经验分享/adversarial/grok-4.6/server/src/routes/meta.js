const express = require('express')
const { channels, extraChannels, sidebar, headerLeft, extras, hotSearches } = require('../data/channels')
const { users } = require('../data/users')

const router = express.Router()

router.get('/channels', (_req, res) => {
  res.json({ code: 0, data: { channels, extraChannels, sidebar, headerLeft, extras, hotSearches } })
})

router.get('/users/:id', (req, res) => {
  const user = users.find((u) => u.id === req.params.id)
  if (!user) return res.status(404).json({ code: 404, message: '用户不存在' })
  res.json({ code: 0, data: user })
})

module.exports = router
