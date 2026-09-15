const channels = [
  { id: 'douga', name: '动画', href: '/channel/douga' },
  { id: 'anime', name: '番剧', href: '/channel/anime' },
  { id: 'movie', name: '电影', href: '/channel/movie' },
  { id: 'guochuang', name: '国创', href: '/channel/guochuang' },
  { id: 'tv', name: '电视剧', href: '/channel/tv' },
  { id: 'variety', name: '综艺', href: '/channel/variety' },
  { id: 'documentary', name: '纪录片', href: '/channel/documentary' },
  { id: 'game', name: '游戏', href: '/channel/game' },
  { id: 'kichiku', name: '鬼畜', href: '/channel/kichiku' },
  { id: 'music', name: '音乐', href: '/channel/music' },
  { id: 'dance', name: '舞蹈', href: '/channel/dance' },
  { id: 'cinephile', name: '影视', href: '/channel/cinephile' },
  { id: 'ent', name: '娱乐', href: '/channel/ent' },
  { id: 'knowledge', name: '知识', href: '/channel/knowledge' },
  { id: 'tech', name: '科技数码', href: '/channel/tech' },
  { id: 'information', name: '资讯', href: '/channel/information' },
  { id: 'food', name: '美食', href: '/channel/food' },
  { id: 'shortplay', name: '小剧场', href: '/channel/shortplay' },
  { id: 'car', name: '汽车', href: '/channel/car' },
  { id: 'fashion', name: '时尚美妆', href: '/channel/fashion' },
  { id: 'sports', name: '体育运动', href: '/channel/sports' },
  { id: 'animal', name: '动物', href: '/channel/animal' },
  { id: 'vlog', name: 'vlog', href: '/channel/vlog' },
  { id: 'painting', name: '绘画', href: '/channel/painting' },
  { id: 'ai', name: '人工智能', href: '/channel/ai' },
  { id: 'life', name: '生活兴趣', href: '/channel/life' }
]

const extraChannels = [
  { id: 'home', name: '家装房产' },
  { id: 'outdoors', name: '户外潮流' },
  { id: 'gym', name: '健身' },
  { id: 'handmake', name: '手工' },
  { id: 'travel', name: '旅游出行' },
  { id: 'rural', name: '三农' },
  { id: 'parenting', name: '亲子' },
  { id: 'health', name: '健康' },
  { id: 'emotion', name: '情感' },
  { id: 'life_experience', name: '生活经验' }
]

const sidebar = [
  { id: 'home', name: '首页', icon: 'home', to: '/' },
  { id: 'dynamic', name: '动态', icon: 'dynamic', to: '/?tab=dynamic' },
  { id: 'hot', name: '热门', icon: 'hot', to: '/channel/hot' },
  { id: 'anime', name: '番剧', icon: 'anime', to: '/channel/anime' },
  { id: 'movie', name: '电影', icon: 'movie', to: '/channel/movie' },
  { id: 'guochuang', name: '国创', icon: 'guochuang', to: '/channel/guochuang' },
  { id: 'tv', name: '电视剧', icon: 'tv', to: '/channel/tv' },
  { id: 'variety', name: '综艺', icon: 'variety', to: '/channel/variety' },
  { id: 'documentary', name: '纪录片', icon: 'documentary', to: '/channel/documentary' },
  { id: 'game', name: '游戏', icon: 'game', to: '/channel/game' },
  { id: 'douga', name: '动画', icon: 'douga', to: '/channel/douga' },
  { id: 'music', name: '音乐', icon: 'music', to: '/channel/music' }
]

const headerLeft = [
  { id: 'home', name: '首页', to: '/' },
  { id: 'anime', name: '番剧', to: '/channel/anime', menu: 'anime' },
  { id: 'live', name: '直播', to: '/channel/ent' },
  { id: 'game', name: '游戏中心', to: '/channel/game', menu: 'game' },
  { id: 'vipshop', name: '会员购', to: '/' },
  { id: 'manga', name: '漫画', to: '/' },
  { id: 'match', name: '赛事', to: '/channel/game' },
  { id: 'download', name: '下载客户端', to: '/', menu: 'download' }
]

const extras = [
  { id: 'column', name: '专栏', icon: 'column' },
  { id: 'live', name: '直播', icon: 'live' },
  { id: 'activity', name: '活动', icon: 'activity' },
  { id: 'classroom', name: '课堂', icon: 'classroom' },
  { id: 'community', name: '社区中心', icon: 'community' },
  { id: 'music-chart', name: '新歌热榜', icon: 'chart' }
]

const hotSearches = [
  'S16 四强复盘',
  '上海国际羊肉日',
  '新手组装主机',
  '一人食便当',
  '橘猫迷惑行为',
  '黑神话后续讨论',
  '秋招求职避坑',
  '城市夜骑路线',
  'AI 绘画工作流',
  '周末短途旅行'
]

module.exports = {
  channels,
  extraChannels,
  sidebar,
  headerLeft,
  extras,
  hotSearches
}
