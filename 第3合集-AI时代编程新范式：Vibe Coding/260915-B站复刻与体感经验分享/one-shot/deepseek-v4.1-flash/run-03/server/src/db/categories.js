/**
 * 分区定义表：seed 阶段的唯一事实来源。
 * rid 为 B站真实分区 id（用于抓取排行榜），icon/accent 用于前端导航与筛选条渲染。
 */
export const CATEGORIES = [
  // —— 顶部频道导航（对应 B站 header 第二行）——
  { slug: 'anime', name: '番剧', rid: 13, icon: 'anime', accent: '#FB7299', isNav: true, sortOrder: 1, intro: '新番连载 · 完结动画' },
  { slug: 'movie', name: '电影', rid: 23, icon: 'movie', accent: '#F07775', isNav: true, sortOrder: 2, intro: '院线热映 · 经典佳片' },
  { slug: 'guochuang', name: '国创', rid: 167, icon: 'guochuang', accent: '#FF9212', isNav: true, sortOrder: 3, intro: '国漫新作 · 原创动画' },
  { slug: 'tv', name: '电视剧', rid: 11, icon: 'tv', accent: '#6D9CF3', isNav: true, sortOrder: 4, intro: '热播剧集 · 英美日韩' },
  { slug: 'variety', name: '综艺', rid: 71, icon: 'variety', accent: '#FF7BA9', isNav: true, sortOrder: 5, intro: '真人秀 · 脱口秀' },
  { slug: 'documentary', name: '纪录片', rid: 177, icon: 'documentary', accent: '#4CC6A9', isNav: true, sortOrder: 6, intro: '人文历史 · 自然探索' },

  // —— 首页信息流筛选条 ——
  { slug: 'douga', name: '动画', rid: 1, icon: 'douga', accent: '#FF6699', sortOrder: 10, intro: 'MAD·AMV · 手书 · 短片' },
  { slug: 'game', name: '游戏', rid: 4, icon: 'game', accent: '#59A6FF', sortOrder: 11, intro: '单机 · 网络游戏 · 电竞' },
  { slug: 'kichiku', name: '鬼畜', rid: 119, icon: 'kichiku', accent: '#FFC300', sortOrder: 12, intro: '鬼畜调教 · 音MAD' },
  { slug: 'music', name: '音乐', rid: 3, icon: 'music', accent: '#8E7BFF', sortOrder: 13, intro: '原创音乐 · 翻唱 · VOCALOID' },
  { slug: 'dance', name: '舞蹈', rid: 129, icon: 'dance', accent: '#FF8FB1', sortOrder: 14, intro: '宅舞 · 街舞 · 舞蹈教程' },
  { slug: 'cinephile', name: '影视', rid: 181, icon: 'cinephile', accent: '#5AC8FA', sortOrder: 15, intro: '影视杂谈 · 混剪 · 预告' },
  { slug: 'ent', name: '娱乐', rid: 5, icon: 'ent', accent: '#FFA033', sortOrder: 16, intro: '综艺娱乐 · 明星 · 搞笑' },
  { slug: 'knowledge', name: '知识', rid: 36, icon: 'knowledge', accent: '#4D8DFF', sortOrder: 17, intro: '科普 · 社科 · 财经' },
  { slug: 'tech', name: '科技数码', rid: 188, icon: 'tech', accent: '#00AEEC', sortOrder: 18, intro: '数码 · 软件 · 装机' },
  { slug: 'information', name: '资讯', rid: 202, icon: 'information', accent: '#F45B5B', sortOrder: 19, intro: '热点 · 社会 · 环球' },
  { slug: 'food', name: '美食', rid: 211, icon: 'food', accent: '#FFB020', sortOrder: 20, intro: '美食制作 · 探店 · 吃播' },
  { slug: 'car', name: '汽车', rid: 223, icon: 'car', accent: '#7C8BFF', sortOrder: 21, intro: '新车 · 试驾 · 改装' },
  { slug: 'fashion', name: '时尚美妆', rid: 155, icon: 'fashion', accent: '#FF6FA5', sortOrder: 22, intro: '穿搭 · 护肤 · 美妆' },
  { slug: 'sports', name: '体育运动', rid: 234, icon: 'sports', accent: '#2FBF71', sortOrder: 23, intro: '篮球 · 足球 · 健身' },
  { slug: 'animal', name: '动物', rid: 217, icon: 'animal', accent: '#FF9F45', sortOrder: 24, intro: '喵星人 · 汪星人 · 萌宠' },
  { slug: 'life', name: '生活', rid: 160, icon: 'life', accent: '#5BC8C8', sortOrder: 25, intro: '日常 · 搞笑 · 手工' },
];

/**
 * B站二级分区 tid -> 本项目一级分区 slug。
 * 用于把「全站热门」里没有排行榜覆盖的视频归入正确分区。
 */
export const TID_TO_SLUG = {
  // 动画
  24: 'douga', 25: 'douga', 27: 'douga', 47: 'douga', 86: 'douga', 210: 'douga',
  // 番剧
  33: 'anime', 32: 'anime', 51: 'anime', 152: 'anime',
  // 国创
  153: 'guochuang', 168: 'guochuang', 169: 'guochuang', 195: 'guochuang', 170: 'guochuang',
  // 音乐
  28: 'music', 31: 'music', 30: 'music', 59: 'music', 29: 'music', 130: 'music',
  193: 'music', 194: 'music', 243: 'music', 244: 'music',
  // 舞蹈
  20: 'dance', 154: 'dance', 156: 'dance', 198: 'dance', 199: 'dance', 200: 'dance',
  255: 'dance', 256: 'dance',
  // 游戏
  17: 'game', 65: 'game', 136: 'game', 19: 'game', 171: 'game', 172: 'game',
  121: 'game', 173: 'game', 174: 'game', 175: 'game',
  // 知识
  201: 'knowledge', 124: 'knowledge', 228: 'knowledge', 207: 'knowledge', 208: 'knowledge',
  209: 'knowledge', 229: 'knowledge', 122: 'knowledge', 39: 'knowledge', 98: 'knowledge',
  // 科技数码
  95: 'tech', 230: 'tech', 231: 'tech', 232: 'tech', 233: 'tech', 236: 'tech',
  // 体育运动
  235: 'sports', 237: 'sports', 238: 'sports', 164: 'sports', 249: 'sports',
  // 汽车
  176: 'car', 240: 'car', 245: 'car', 246: 'car', 247: 'car', 248: 'car',
  // 生活
  138: 'life', 21: 'life', 161: 'life', 162: 'life', 250: 'life', 251: 'life',
  252: 'life', 253: 'life', 254: 'life', 239: 'life', 163: 'life',
  // 美食
  76: 'food', 212: 'food', 213: 'food', 214: 'food', 215: 'food',
  // 动物
  75: 'animal', 218: 'animal', 219: 'animal', 220: 'animal', 221: 'animal', 222: 'animal',
  // 鬼畜
  22: 'kichiku', 26: 'kichiku', 126: 'kichiku', 127: 'kichiku', 216: 'kichiku', 128: 'kichiku',
  // 时尚美妆
  157: 'fashion', 158: 'fashion', 159: 'fashion', 192: 'fashion',
  // 娱乐
  71: 'variety', 137: 'ent', 131: 'ent', 133: 'ent', 241: 'ent', 242: 'ent',
  // 影视
  182: 'cinephile', 183: 'cinephile', 85: 'cinephile', 184: 'cinephile', 185: 'cinephile',
  // 纪录片
  37: 'documentary', 178: 'documentary', 179: 'documentary', 180: 'documentary',
  // 电影
  83: 'movie', 147: 'movie', 148: 'movie', 149: 'movie', 150: 'movie', 151: 'movie',
  // 电视剧
  15: 'tv', 16: 'tv', 97: 'tv',
  // 资讯
  203: 'information', 204: 'information', 205: 'information', 206: 'information',
};

/**
 * 版权内容（PGC）：B站排行榜接口不覆盖番剧/国创/综艺，
 * 使用 PGC 季榜接口补充真实封面与评分，仅用于分区页展示。
 */
export const PGC_ZONES = [
  { slug: 'anime', seasonType: 1, name: '番剧' },
  { slug: 'guochuang', seasonType: 4, name: '国创' },
  { slug: 'variety', seasonType: 3, name: '综艺' },
];

export default CATEGORIES;
