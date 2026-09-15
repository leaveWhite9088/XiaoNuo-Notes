const { users } = require('./users')

const templates = [
  { text: '前排，来了就先三连。', likes: 320 },
  { text: '这个转场也太顺了，学到了。', likes: 188 },
  { text: '弹幕里那个梗我笑了整整半分钟。', likes: 540 },
  { text: 'up 更新好稳定，本周份精神食粮。', likes: 96 },
  { text: '封面和内容一样能打，少见。', likes: 77 },
  { text: '看到最后才发现自己已经循环两遍。', likes: 210 },
  { text: '有些细节只有做过的人才懂，太真实了。', likes: 430 },
  { text: '求个bgm单曲循环。', likes: 65 },
  { text: '这期信息密度可以，不像注水。', likes: 154 },
  { text: '已投币，下次还来。', likes: 89 },
  { text: '评论区比视频还热闹哈哈。', likes: 41 },
  { text: '看完去厨房实践一下。', likes: 120 },
  { text: '时间线做得很贴心，感谢。', likes: 73 },
  { text: '我把这个丢给室友了，他现在不说话。', likes: 260 }
]

function seedComments(videoId) {
  const picked = templates.slice(0, 8 + (videoId.length % 5))
  return picked.map((item, index) => {
    const user = users[index % users.length]
    return {
      id: `${videoId}-c${index + 1}`,
      videoId,
      user: { id: user.id, name: user.name, face: user.face },
      text: item.text,
      likes: item.likes + (index * 3),
      time: `2026-09-0${(index % 8) + 1} 21:${10 + index}`,
      replies: index % 4 === 0
        ? [
            {
              id: `${videoId}-c${index + 1}-r1`,
              user: { id: users[(index + 3) % users.length].id, name: users[(index + 3) % users.length].name, face: users[(index + 3) % users.length].face },
              text: '说得对，已三连。',
              likes: 12,
              time: `2026-09-0${(index % 8) + 1} 22:01`
            }
          ]
        : []
    }
  })
}

module.exports = { seedComments }
