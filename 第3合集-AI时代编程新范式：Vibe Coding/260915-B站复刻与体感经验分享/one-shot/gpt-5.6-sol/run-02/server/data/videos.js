const sampleVideos = [
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://media.w3.org/2010/05/bunny/trailer.mp4'
]

export const categories = ['首页', '番剧', '国创', '动画', '游戏', '音乐', '舞蹈', '影视', '娱乐', '知识', '科技数码', '资讯', '美食', '汽车', '时尚美妆', '体育运动', '动物圈', 'vlog']

export const videos = [
  {
    id: 'BV1xK4y1', title: '城市漫游｜在天台等待一场橘子味的日落', category: 'vlog',
    cover: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=85',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    author: '小野的放映室', views: '125.8万', danmaku: '8294', duration: '08:42', date: '昨天', likes: '18.6万', coins: '6.3万', favorites: '11.2万',
    source: sampleVideos[0], tags: ['生活', '治愈', '城市漫游'],
    description: '把忙碌暂停一下。我们从老街走到天台，收集这座城市傍晚最温柔的光。'
  },
  {
    id: 'BV2mQ7pL', title: '这才是夏天！海边公路旅行电影感记录', category: 'vlog',
    cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    author: '是阿盐呀', views: '89.3万', danmaku: '3605', duration: '12:18', date: '09-10', likes: '9.8万', coins: '3.1万', favorites: '7.2万', source: sampleVideos[1], tags: ['旅行', '大海', '公路片'], description: '沿着海岸线一路向南，把夏天的风和浪都装进镜头里。'
  },
  {
    id: 'BV3gF9aR', title: '在家做出外酥里嫩的完美可颂，成功率超高', category: '美食',
    cover: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=85',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    author: '厨房实验员', views: '66.7万', danmaku: '1542', duration: '10:06', date: '3小时前', likes: '7.5万', coins: '2.4万', favorites: '12.9万', source: sampleVideos[2], tags: ['烘焙', '教程', '可颂'], description: '从开酥到醒发，每一个容易翻车的细节都讲清楚。'
  },
  {
    id: 'BV4dN2wS', title: '当古典乐遇上赛博朋克，会发生什么？', category: '音乐',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=85',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
    author: '无限音轨', views: '231.4万', danmaku: '1.2万', duration: '04:36', date: '09-08', likes: '31.2万', coins: '15.8万', favorites: '20.5万', source: sampleVideos[3], tags: ['音乐现场', '电子音乐', '改编'], description: '把巴洛克的精密结构放进未来都市，一次大胆的跨时空改编。'
  },
  {
    id: 'BV5aT8cH', title: '我造了一间会呼吸的房子｜建筑设计全过程', category: '知识',
    cover: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=160&q=80',
    author: '构筑事务所', views: '52.1万', danmaku: '2877', duration: '18:24', date: '09-09', likes: '6.2万', coins: '3.7万', favorites: '8.8万', source: sampleVideos[0], tags: ['建筑', '设计', '住宅'], description: '光、风和人在空间里如何相遇？从草图到落地，记录完整设计过程。'
  },
  {
    id: 'BV6uP1eJ', title: '独立游戏里的雨夜，氛围感直接拉满', category: '游戏',
    cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=85',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    author: '像素信号', views: '118.9万', danmaku: '6704', duration: '21:15', date: '09-07', likes: '14.3万', coins: '4.8万', favorites: '5.7万', source: sampleVideos[1], tags: ['单机游戏', '独立游戏', '实况'], description: '这款小体量作品用一场雨，讲了一个后劲很大的故事。'
  },
  {
    id: 'BV7hC6zM', title: '手机也能拍大片？6 个运镜技巧一次学会', category: '科技数码',
    cover: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80',
    author: '影像研究社', views: '77.6万', danmaku: '2231', duration: '09:48', date: '09-06', likes: '8.4万', coins: '2.9万', favorites: '14.6万', source: sampleVideos[2], tags: ['摄影', '手机', '教程'], description: '不需要昂贵设备，理解运动逻辑就能显著提升画面质感。'
  },
  {
    id: 'BV8sV3bE', title: '猫咪第一次看到下雪，反应也太可爱了', category: '动物圈',
    cover: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1200&q=85',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
    author: '毛球观察日记', views: '302.5万', danmaku: '1.8万', duration: '03:22', date: '09-05', likes: '42.7万', coins: '5.1万', favorites: '16.3万', source: sampleVideos[3], tags: ['喵星人', '萌宠', '雪'], description: '南方小猫的第一次雪地探险，每一步都写着震惊。'
  },
  {
    id: 'BV9jR5qW', title: '挑战 24 小时只用百元改造出租屋', category: '娱乐',
    cover: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85',
    avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=160&q=80',
    author: '一颗布丁', views: '165.2万', danmaku: '9266', duration: '16:50', date: '09-04', likes: '19.1万', coins: '4.4万', favorites: '10.2万', source: sampleVideos[0], tags: ['改造', '挑战', '租房'], description: '低预算也能拥有舒服的小窝，过程比结果更出乎意料。'
  },
  {
    id: 'BV10L7nA', title: '从零理解大模型：它究竟是怎么“思考”的？', category: '科技数码',
    cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=160&q=80',
    author: '硬核科技站', views: '96.8万', danmaku: '5803', duration: '22:07', date: '09-03', likes: '11.5万', coins: '8.9万', favorites: '19.7万', source: sampleVideos[1], tags: ['人工智能', '科普', '计算机'], description: '不用复杂公式，从预测下一个词开始理解大语言模型。'
  },
  {
    id: 'BV11B4fK', title: '凌晨四点的城市，有另一种生命力', category: '影视',
    cover: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=85',
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=160&q=80',
    author: '空镜计划', views: '43.9万', danmaku: '1820', duration: '07:31', date: '09-02', likes: '5.7万', coins: '3.2万', favorites: '6.9万', source: sampleVideos[2], tags: ['短片', '城市', '电影感'], description: '夜班工人、早市摊主和最后一班车，共同组成城市的另一面。'
  },
  {
    id: 'BV12Y9tD', title: '第一次看见极光，原来真的会让人说不出话', category: 'vlog',
    cover: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1200&q=85',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&q=80',
    author: '向北旅行', views: '187.7万', danmaku: '7706', duration: '13:40', date: '09-01', likes: '22.8万', coins: '7.4万', favorites: '15.6万', source: sampleVideos[3], tags: ['极光', '旅行', '挪威'], description: '追了七天云层，终于在峡湾边等到天空被点亮的那一刻。'
  }
]

export function listVideos({ category = '首页', search = '' } = {}) {
  const keyword = String(search).trim().toLowerCase()
  return videos.filter((video) => {
    const categoryMatch = !category || category === '首页' || video.category === category
    const searchMatch = !keyword || [video.title, video.author, video.category, ...video.tags]
      .some((field) => field.toLowerCase().includes(keyword))
    return categoryMatch && searchMatch
  })
}
