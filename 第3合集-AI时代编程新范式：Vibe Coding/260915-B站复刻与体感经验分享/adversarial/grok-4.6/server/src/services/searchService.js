const { videos } = require('../data/videos')
const { users } = require('../data/users')
const { hotSearches } = require('../data/channels')

function normalize(text) {
  return String(text || '').toLowerCase()
}

function searchVideos(q, sort = 'default') {
  const keyword = normalize(q).trim()
  if (!keyword) return []
  let list = videos.filter((v) => {
    const blob = [v.title, v.desc, v.channelId, v.up?.name, ...(v.tags || [])].join(' ')
    return normalize(blob).includes(keyword)
  })
  if (sort === 'views') list = list.slice().sort((a, b) => b.views - a.views)
  if (sort === 'date') list = list.slice().sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
  return list
}

function suggest(q) {
  const keyword = normalize(q).trim()
  const videoHits = videos
    .filter((v) => !keyword || normalize(v.title).includes(keyword) || normalize(v.up.name).includes(keyword))
    .slice(0, 8)
    .map((v) => ({ type: 'video', id: v.id, text: v.title, extra: v.up.name }))
  const userHits = users
    .filter((u) => !keyword || normalize(u.name).includes(keyword))
    .slice(0, 3)
    .map((u) => ({ type: 'user', id: u.id, text: u.name, extra: `${u.fans}粉丝` }))
  const hot = (keyword
    ? hotSearches.filter((item) => normalize(item).includes(keyword))
    : hotSearches
  ).slice(0, 8).map((text) => ({ type: 'hot', text }))
  return { hot, videos: videoHits, users: userHits }
}

module.exports = { searchVideos, suggest, hotSearches }
