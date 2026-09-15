const avatars = [
  '/images/avatars/up-bob.jpg',
  '/images/avatars/up-mint.jpg',
  '/images/avatars/up-coral.jpg',
  '/images/avatars/up-glasses.jpg',
  '/images/avatars/up-lin.jpg',
  '/images/avatars/up-silver.jpg',
  '/images/avatars/up-cat.jpg',
  '/images/avatars/up-pro.jpg'
]

const pool = [
  ['这期信息密度好高，收藏了慢慢看。', 342],
  ['封面骗点击，内容却没让我后悔，少见。', 128],
  ['三连走起，求系列下一集。', 890],
  ['弹幕比视频还热闹哈哈。', 56],
  ['作为一个外行也能看懂，讲解很克制。', 210],
  ['看到一半去倒了杯水，回来又从头看。', 19],
  ['制作真的用心，光是配乐就值一个币。', 445],
  ['评论区有没有人一起追的？', 67],
  ['这画质在手机上看也依然清楚。', 88],
  ['up 更新频率可以，质量也稳住了。', 173],
  ['有一说一，这才是我打开首页想刷到的。', 512],
  ['片尾彩蛋看到了，细节控狂喜。', 94]
]

function seeded(bvid) {
  let h = 0
  for (const ch of bvid) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0
    return h
  }
}

export function commentsFor(bvid) {
  const rand = seeded(bvid)
  const n = 6 + (rand() % 5)
  const list = []
  for (let i = 0; i < n; i++) {
    const item = pool[rand() % pool.length]
    const replies = rand() % 3 === 0 ? [
      {
        id: `${bvid}-c${i}-r0`,
        user: '路过的电池',
        avatar: avatars[rand() % avatars.length],
        content: '附议，尤其是中段那段。',
        likes: rand() % 40,
        ctime: '2026-09-10 21:18'
      }
    ] : []
    list.push({
      id: `${bvid}-c${i}`,
      user: ['夜航船', '盐焗芝士', '二次元上班族', '不吃香菜', '像素牧羊人', '早点睡吧'][rand() % 6],
      avatar: avatars[rand() % avatars.length],
      content: item[0],
      likes: item[1] + (rand() % 80),
      location: ['上海', '北京', '成都', '杭州', '广州', '南京'][rand() % 6],
      ctime: `2026-09-${String(8 + (rand() % 4)).padStart(2, '0')} ${10 + (rand() % 12)}:${String(rand() % 60).padStart(2, '0')}`,
      replies
    })
  }
  return list
}
