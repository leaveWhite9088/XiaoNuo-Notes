/**
 * 分区(频道)静态配置。
 * - navChannels: 顶部二级导航栏里平铺展示的分区
 * - morePanel:  "更多" 悬浮面板里按组展示的全量入口
 * - primaryNav: 最顶栏左上角的主导航
 */

/** @typedef {{ id: string, name: string, icon: string, desc: string }} Channel */

/** @type {Channel[]} */
export const channels = [
  { id: 'douga', name: '动画', icon: '🌸', desc: 'MAD·AMV / 手书 / 配音 / 手办·模玩' },
  { id: 'anime', name: '番剧', icon: '📺', desc: '连载动画 / 完结动画 / 资讯 / 官方延伸' },
  { id: 'guochuang', name: '国创', icon: '🐲', desc: '国产动画 / 国产原创相关 / 布袋戏' },
  { id: 'music', name: '音乐', icon: '🎵', desc: '原创音乐 / 翻唱 / 演奏 / VOCALOID' },
  { id: 'dance', name: '舞蹈', icon: '💃', desc: '宅舞 / 街舞 / 明星舞蹈 / 中国舞' },
  { id: 'game', name: '游戏', icon: '🎮', desc: '单机游戏 / 电子竞技 / 手机游戏 / 网络游戏' },
  { id: 'knowledge', name: '知识', icon: '📖', desc: '科学科普 / 社科·法律·心理 / 人文历史' },
  { id: 'tech', name: '科技', icon: '🔬', desc: '数码 / 软件应用 / 计算机技术 / 工业·工程' },
  { id: 'sports', name: '运动', icon: '🏀', desc: '篮球 / 足球 / 健身 / 竞技体育' },
  { id: 'car', name: '汽车', icon: '🚗', desc: '赛车 / 改装玩车 / 新能源车 / 购车攻略' },
  { id: 'life', name: '生活', icon: '🏠', desc: '搞笑 / 出行 / 三农 / 家居房产 / 手工' },
  { id: 'food', name: '美食', icon: '🍜', desc: '美食制作 / 美食侦探 / 美食测评 / 田园美食' },
  { id: 'animal', name: '动物圈', icon: '🐱', desc: '喵星人 / 汪星人 / 野生动物 / 小宠异宠' },
  { id: 'kichiku', name: '鬼畜', icon: '🤪', desc: '鬼畜调教 / 音MAD / 人力VOCALOID' },
  { id: 'fashion', name: '时尚', icon: '👗', desc: '美妆护肤 / 仿妆cos / 穿搭 / 时尚潮流' },
  { id: 'ent', name: '娱乐', icon: '🎤', desc: '综艺 / 娱乐杂谈 / 粉丝创作 / 明星综合' },
  { id: 'cinephile', name: '影视', icon: '🎬', desc: '影视杂谈 / 影视剪辑 / 短片 / 预告·资讯' },
  { id: 'documentary', name: '纪录片', icon: '🎞️', desc: '人文·历史 / 科学·探索·自然 / 军事' },
  { id: 'movie', name: '电影', icon: '🍿', desc: '华语电影 / 欧美电影 / 日本电影 / 其他国家' },
  { id: 'tv', name: '电视剧', icon: '📼', desc: '国产剧 / 海外剧' },
];

/** 首页第一个 tab：推荐（不过滤分区） */
export const recommendChannel = { id: 'all', name: '首页', icon: '🏠', desc: '为你推荐' };

/** 顶栏最左侧的主导航 */
export const primaryNav = [
  { id: 'home', name: '首页', href: '/' },
  { id: 'anime', name: '番剧', href: '/?channel=anime' },
  { id: 'live', name: '直播', href: '/?channel=ent' },
  { id: 'game-center', name: '游戏中心', href: '/?channel=game' },
  { id: 'shop', name: '会员购', href: '/?channel=fashion' },
  { id: 'manga', name: '漫画', href: '/?channel=douga' },
  { id: 'match', name: '赛事', href: '/?channel=sports' },
];

/** "更多"面板里的分组入口 */
export const morePanel = [
  {
    group: '频道',
    items: channels.slice(0, 12).map((c) => ({ id: c.id, name: c.name, icon: c.icon })),
  },
  {
    group: '更多分区',
    items: channels.slice(12).map((c) => ({ id: c.id, name: c.name, icon: c.icon })),
  },
  {
    group: '更多服务',
    items: [
      { id: 'article', name: '专栏', icon: '📝' },
      { id: 'activity', name: '活动', icon: '🎉' },
      { id: 'class', name: '课堂', icon: '🎓' },
      { id: 'community', name: '社区中心', icon: '🏛️' },
      { id: 'music-rank', name: '新歌热榜', icon: '🏆' },
      { id: 'match-center', name: '赛事', icon: '🥇' },
    ],
  },
];

/** 首页信息流排序方式 */
export const feedSorts = [
  { id: 'recommend', name: '综合推荐' },
  { id: 'latest', name: '最新发布' },
  { id: 'hot', name: '最多播放' },
  { id: 'danmaku', name: '最多弹幕' },
];
