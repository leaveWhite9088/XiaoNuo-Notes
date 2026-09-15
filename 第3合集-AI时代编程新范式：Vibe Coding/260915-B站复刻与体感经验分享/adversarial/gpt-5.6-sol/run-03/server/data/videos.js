const demoMedia = {
  mediaUrl: '/media/flower.mp4',
  duration: '00:05',
  durationSeconds: 5.055,
  mediaLabel: '统一 5 秒演示视频'
}

const videoCatalog = [
  {
    id: 'BV1Hyr', title: '总要来趟有风的地方吧！把夏天装进镜头里', author: '光影收集计划', category: '生活',
    cover: '/images/cover-01.jpg', views: '126.8万', danmaku: '6842', date: '昨天', likes: '18.7万', coins: '4.6万', favorites: '9.1万',
    description: '去山野，去海边，去一切有风的地方。愿这支短片能让你短暂离开忙碌的日常。'
  },
  {
    id: 'BV2Pk9', title: '一口气看懂：为什么我们会被一段旋律打动？', author: '看见声波', category: '知识',
    cover: '/images/cover-02.jpg', views: '86.4万', danmaku: '3981', date: '09-10', likes: '9.8万', coins: '3.2万', favorites: '5.6万',
    description: '从和声、节奏到记忆，聊聊音乐如何越过理性，直接抵达我们的情绪。'
  },
  {
    id: 'BV3Tza', title: '猫咪第一次见到扫地机器人，反应也太可爱了', author: '团子今天吃什么', category: '动物圈',
    cover: '/images/cover-03.jpg', views: '233.1万', danmaku: '1.2万', date: '09-09', likes: '31.4万', coins: '2.1万', favorites: '7.8万',
    description: '团子和它的新室友，经历了从警惕、试探到和平共处的全过程。'
  },
  {
    id: 'BV4Mqd', title: '在家也能做的焦糖舒芙蕾，松软得像云朵', author: '一颗小食堂', category: '美食',
    cover: '/images/cover-04.jpg', views: '54.7万', danmaku: '2234', date: '09-08', likes: '7.2万', coins: '1.8万', favorites: '6.3万',
    description: '只用家里常见的材料，掌握几个关键步骤，新手也能做出蓬松细腻的舒芙蕾。'
  },
  {
    id: 'BV5Lsp', title: '我把整座城市的日落，剪成了三分钟', author: '帧间旅行', category: '摄影',
    cover: '/images/cover-05.jpg', views: '178.9万', danmaku: '7653', date: '09-07', likes: '22.5万', coins: '8.3万', favorites: '12.6万',
    description: '三个月，二十七个机位，一百多次等待。送给每一个在城市里追过日落的人。'
  },
  {
    id: 'BV6Cnx', title: '这大概就是公路旅行最自由的样子', author: '向北开', category: '汽车',
    cover: '/images/cover-06.jpg', views: '73.3万', danmaku: '3156', date: '09-06', likes: '8.4万', coins: '2.7万', favorites: '4.9万',
    description: '没有精确的目的地，只有下一段路和车窗外不断变化的风景。'
  },
  {
    id: 'BV7Wgb', title: '沉浸式整理书桌｜把普通一天过得闪闪发光', author: '小岛居住指南', category: '生活',
    cover: '/images/cover-07.jpg', views: '65.2万', danmaku: '2867', date: '09-05', likes: '6.9万', coins: '1.5万', favorites: '7.2万',
    description: '收拾一张桌子，也是在整理生活的秩序。希望这段安静的记录能陪你度过片刻。'
  },
  {
    id: 'BV8Dvf', title: '零基础学会这支超有活力的编舞！', author: '泡泡舞室', category: '舞蹈',
    cover: '/images/cover-08.jpg', views: '112.6万', danmaku: '6231', date: '09-04', likes: '14.1万', coins: '3.9万', favorites: '8.8万',
    description: '动作拆解和完整跟跳都准备好了。穿上舒服的鞋，一起把快乐跳出来吧。'
  },
  {
    id: 'BV9Jue', title: '如果把经典动画场景做成微缩模型', author: '手作放映厅', category: '动画',
    cover: '/images/cover-09.jpg', views: '306.5万', danmaku: '1.9万', date: '09-03', likes: '42.7万', coins: '16.4万', favorites: '25.3万',
    description: '从草图到灯光，完整记录一个微缩场景的诞生。愿你也能在里面找到熟悉的回忆。'
  },
  {
    id: 'BV10Ka', title: '周末逛展指南：这场展览值得慢慢看', author: '城市散步社', category: '资讯',
    cover: '/images/cover-10.jpg', views: '42.8万', danmaku: '1864', date: '09-02', likes: '4.7万', coins: '1.1万', favorites: '3.5万',
    description: '从展览动线、重点作品到拍照位置，带你提前云逛展。'
  },
  {
    id: 'BV11Rs', title: '把秋天穿在身上｜早秋日常搭配分享', author: '好天气衣橱', category: '时尚',
    cover: '/images/cover-11.jpg', views: '39.6万', danmaku: '1423', date: '09-01', likes: '4.2万', coins: '8521', favorites: '3.9万',
    description: '适合通勤和周末的五套早秋搭配，舒服、实穿，也保留一点轻松的颜色。'
  },
  {
    id: 'BV12Yt', title: '今天不讲大道理，只带你看宇宙的浪漫', author: '无穷小亮点', category: '知识',
    cover: '/images/cover-12.jpg', views: '257.4万', danmaku: '2.4万', date: '08-31', likes: '36.8万', coins: '14.2万', favorites: '28.1万',
    description: '从一束穿过星云的光出发，走进我们已经看见、却依然无法完全解释的宇宙。'
  }
]

export const videos = videoCatalog.map((video) => ({ ...video, ...demoMedia }))

const categoryCatalog = ['番剧', '国创', '综艺', '动画', '鬼畜', '舞蹈', '娱乐', '电影', '电视剧', '知识', '资讯', '美食', '生活', '汽车', '时尚', '运动']

export const categories = ['首页', ...new Set([...categoryCatalog, ...videos.map((video) => video.category)])]
