// 数据层：静态种子数据（模拟数据库表）
// 封面使用 picsum.photos 真实照片，头像使用 pravatar 真实人像，
// 播放地址使用 Google 公开样例 MP4（可真实播放）。

// 均为实测可访问(200/206)的公开样例 MP4，支持浏览器直接播放
const SAMPLE_VIDEOS = [
  'https://vjs.zencdn.net/v/oceans.mp4',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
  'https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4',
  'https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4',
  'https://media.w3.org/2010/05/bunny/movie.mp4',
  'https://media.w3.org/2010/05/video/movie_300.mp4',
  'https://mdn.github.io/shared-assets/videos/flower.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
];

export const CATEGORIES = ['首页', '动画', '游戏', '科技', '音乐', '舞蹈', '美食', '生活', '知识', '时尚'];

const raw = [
  ['BV1aZ4y1H7c1', '【4K】耗时三个月，我把出租屋改造成了理想中的样子', '生活', '小鹿爱改造', '家居改造', 38, 'room-makeover'],
  ['BV1bT411P7d2', '黑神话悟空全剧情解说：这个西游，黑暗得让人头皮发麻', '游戏', '游戏茶馆君', '黑神话悟空', 126, 'wukong-game'],
  ['BV1cX4y1L8e3', '一口气看懂 Transformer！从零手撕注意力机制', '知识', 'AI修猫科普', '人工智能', 52, 'ai-transformer'],
  ['BV1dF411N9f4', '挑战用100元吃遍成都街头，最后这碗甜水面绝了', '美食', '吃货小分队', '街头美食', 24, 'chengdu-food'],
  ['BV1eG4y1A1g5', '新番导视：这个十月必看的神仙动画都在这里了', '动画', '动漫速报', '十月新番', 15, 'anime-autumn'],
  ['BV1fH4y1B2h6', 'M4芯片MacBook深度测评：生产力天花板还是挤牙膏？', '科技', '数字尾巴Lab', '数码测评', 9, 'macbook-review'],
  ['BV1gJ4z1C3i7', '翻跳【KILL THIS LOVE】练习室版，这次终于卡上点了', '舞蹈', '一颗甜栗_', '韩舞翻跳', 6, 'dance-cover'],
  ['BV1hK4z1D4j8', '用钢琴重现《千与千寻》永远的那列海原电车', '音乐', 'Animenz粉丝站', '动漫钢琴', 20, 'piano-spirited'],
  ['BV1iL4z1E5k9', '程序员的一天：早上七点到凌晨两点，真实记录', '生活', '代码与咖啡', 'vlog', 3, 'programmer-day'],
  ['BV1jM4z1F6l0', '原神5.0版本前瞻：纳塔地区全探索攻略抢先看', '游戏', '提瓦特旅行者', '原神攻略', 11, 'genshin-natlan'],
  ['BV1kN4z1G7m1', '为什么你的手机越用越卡？拆开给你看真相', '科技', '硬核拆解', '手机维修', 41, 'phone-teardown'],
  ['BV1lP4z1H8n2', '【国风舞】洛神赋水袖舞，翩若惊鸿婉若游龙', '舞蹈', '青鸾舞坊', '国风舞蹈', 28, 'chinese-dance'],
  ['BV1mQ4z1J9o3', '家常菜天花板：红烧肉怎么做才能肥而不腻？', '美食', '老饭骨学徒', '家常菜', 33, 'braised-pork'],
  ['BV1nR4z1K1p4', '十分钟带你看完《奥本海默》：天才与原子弹的诅咒', '动画', '电影速看酱', '电影解说', 17, 'oppenheimer'],
  ['BV1oS4z1L2q5', '自学吉他第100天，我把《晴天》弹成了这样', '音乐', '木吉他少年', '吉他弹唱', 7, 'guitar-sunny'],
  ['BV1pT4z1M3r6', '考研英语85分学姐的复习时间线，抄作业就行', '知识', '上岸的柚子', '考研经验', 26, 'postgrad-exam'],
  ['BV1qU4z1N4s7', '城市漫步 Shanghai｜武康路的秋天，梧桐叶落满肩头', '生活', '漫步城市City', 'citywalk', 12, 'shanghai-walk'],
  ['BV1rV4z1P5t8', '塞尔达传说新作实机演示：这个物理引擎太离谱了', '游戏', '任系情报局', '塞尔达传说', 19, 'zelda-demo'],
  ['BV1sW4z1Q6u9', '装机避坑指南：2026年这些硬件千万别买', '科技', '硬件茶谈', '装机DIY', 45, 'pc-build-guide'],
  ['BV1tX4z1R7v0', '【古典舞】只此青绿选段，每一帧都是壁纸', '舞蹈', '舞之窗', '只此青绿', 22, 'qinglu-dance'],
  ['BV1uY4z1S8w1', '深夜食堂：一碗葱油拌面治愈所有不开心', '美食', '面点王姐', '治愈美食', 14, 'noodle-comfort'],
  ['BV1vZ4z1T9x2', '宫崎骏是如何讲故事的？逐帧分析《幽灵公主》', '动画', '动画学术趴', '宫崎骏', 31, 'ghibli-analysis'],
  ['BV1wA4z1U1y3', '小提琴版《孤勇者》，燃到起鸡皮疙瘩', '音乐', '琴键上的光', '小提琴', 10, 'violin-brave'],
  ['BV1xB4z1V2z4', '量子力学到底是什么？用生活例子讲明白', '知识', '李永乐备胎号', '量子力学', 47, 'quantum-intro'],
  ['BV1yC4z1W3a5', '极简生活实验：扔掉1000件东西之后我变了', '生活', '简而美生活', '极简主义', 21, 'minimalism'],
  ['BV1zD4z1X4b6', '英雄联盟S16总决赛回顾：那个让全场起立的瞬间', '游戏', '电竞圈的那些事', '英雄联盟', 8, 'lol-worlds'],
  ['BV1AE4z1Y5c7', '实测20款充电宝：只有这5款值得买', '科技', '老爸评测学徒', '充电宝测评', 36, 'powerbank-test'],
  ['BV1BF4z1Z6d8', '【爵士舞】Uptown Funk 街头快闪，路人反应太真实', '舞蹈', 'DANCECrew', '爵士舞', 5, 'jazz-flashmob'],
  ['BV1CG4z1A7e9', '挑战24小时只吃便利店，最后的甜品绝绝子', '美食', '便利店猎人', '便利店美食', 29, 'konbini-24h'],
  ['BV1DH4z1B8f0', '国漫崛起？《雾山五行》打戏逐帧解析', '动画', '国漫观察室', '雾山五行', 18, 'wushan-animation']
];

const TITLES_POOL = raw.map((r) => r[1]);
const TAG_POOL = raw.map((r) => r[5]);

export const videos = raw.map((r, i) => {
  const [id, title, category, up, tag, daysAgo, seed] = r;
  const views = 5000 + ((i * 7919 + 104729) % 2000000);
  return {
    id,
    title,
    category,
    tags: [tag, category],
    up: {
      name: up,
      avatar: `https://i.pravatar.cc/80?img=${(i % 70) + 1}`,
      fans: 1000 + ((i * 3571) % 5000000)
    },
    cover: `https://picsum.photos/seed/bili-${seed}/480/300`,
    videoUrl: SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length],
    duration: 60 + ((i * 613) % 1500), // 秒
    views,
    danmaku: Math.floor(views / 12),
    likes: Math.floor(views / 8),
    coins: Math.floor(views / 20),
    favorites: Math.floor(views / 15),
    shares: Math.floor(views / 40),
    publishAt: new Date(Date.now() - daysAgo * 86400000 - i * 3600000).toISOString(),
    description: `${title}。本视频为 B 站首页复刻项目的演示数据，封面与头像为真实网络图片，播放源为公开样例视频。\n\n标签：${tag} / ${category}\nUP主：${up}`
  };
});

export const SEARCH_HOT = ['黑神话悟空', '新番', 'MacBook', '红烧肉', '考研', 'citywalk', '塞尔达', '只此青绿', '量子力学', '充电宝'];
export { TITLES_POOL, TAG_POOL };
