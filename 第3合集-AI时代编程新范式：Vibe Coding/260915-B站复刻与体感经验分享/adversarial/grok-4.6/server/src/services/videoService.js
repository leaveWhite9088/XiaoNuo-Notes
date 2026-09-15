const { videos, carousel } = require('../data/videos')
const { seedComments } = require('../data/comments')

const actions = new Map()

function clone(video) {
  return JSON.parse(JSON.stringify(video))
}

function applyActions(video) {
  const extra = actions.get(video.id) || { likes: 0, coins: 0, favorites: 0, shares: 0 }
  return {
    ...clone(video),
    likes: video.likes + extra.likes,
    coins: video.coins + extra.coins,
    favorites: video.favorites + extra.favorites,
    shares: video.shares + extra.shares
  }
}

function paginate(list, page = 1, pageSize = 20) {
  const start = (page - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize).map(applyActions),
    page,
    pageSize,
    total: list.length,
    hasMore: start + pageSize < list.length
  }
}

const CHANNEL_ALIAS = {
  home: 'life',
  gym: 'sports',
  travel: 'vlog',
  outdoors: 'sports',
  health: 'knowledge',
  emotion: 'life',
  life_experience: 'life',
  handmake: 'painting',
  rural: 'food',
  parenting: 'life'
}

function listVideos({ channel, page, pageSize, sort, shuffle }) {
  let list = videos.slice()
  const mapped = CHANNEL_ALIAS[channel] || channel
  if (mapped && mapped !== 'home' && mapped !== 'hot') {
    list = list.filter((v) => v.channelId === mapped)
  }
  if (channel === 'hot' || sort === 'views') {
    list.sort((a, b) => b.views - a.views)
  } else if (sort === 'date') {
    list.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
  } else if (shuffle === '1') {
    list.sort(() => Math.random() - 0.5)
  }
  return paginate(list, Number(page) || 1, Number(pageSize) || 20)
}

function getVideo(id) {
  const video = videos.find((v) => v.id === id)
  return video ? applyActions(video) : null
}

function relatedVideos(id, limit = 10) {
  const current = videos.find((v) => v.id === id)
  if (!current) return []
  const same = videos.filter((v) => v.id !== id && v.channelId === current.channelId)
  const rest = videos.filter((v) => v.id !== id && v.channelId !== current.channelId)
  return [...same, ...rest].slice(0, limit).map(applyActions)
}

function getComments(id) {
  return seedComments(id)
}

function getCarousel() {
  return carousel
}

function actOnVideo(id, type) {
  const video = videos.find((v) => v.id === id)
  if (!video) return null
  const extra = actions.get(id) || { likes: 0, coins: 0, favorites: 0, shares: 0 }
  if (['likes', 'coins', 'favorites', 'shares'].includes(type)) {
    extra[type] += 1
    actions.set(id, extra)
  }
  return applyActions(video)
}

function featuredVideos() {
  return videos.filter((v) => v.featured).map(applyActions)
}

module.exports = {
  listVideos,
  getVideo,
  relatedVideos,
  getComments,
  getCarousel,
  actOnVideo,
  featuredVideos
}
