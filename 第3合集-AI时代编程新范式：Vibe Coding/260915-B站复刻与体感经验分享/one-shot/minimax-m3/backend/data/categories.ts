import type { Category } from '../src/types.js'

// 与 B 站官方分区结构对齐（精简版）
export const CATEGORIES: Category[] = [
  { tid: 1, name: '动画', icon: 'anime', description: '动画 / MAD / AMV / MMD' },
  { tid: 13, name: '番剧', icon: 'bangumi', description: '番剧 / 连载 / 完结' },
  { tid: 167, name: '国创', icon: 'chinese-anime', description: '国创 / 国产动画' },
  { tid: 3, name: '音乐', icon: 'music', description: '音乐 / 翻唱 / VOCALOID' },
  { tid: 129, name: '舞蹈', icon: 'dance', description: '舞蹈 / 宅舞 / 街舞' },
  { tid: 4, name: '游戏', icon: 'game', description: '游戏 / 攻略 / 直播' },
  { tid: 36, name: '知识', icon: 'knowledge', description: '知识 / 科普 / 校园' },
  { tid: 188, name: '科技', icon: 'tech', description: '数码 / 科技 / AI' },
  { tid: 234, name: '运动', icon: 'sport', description: '运动 / 健身 / 竞技' },
  { tid: 160, name: '生活', icon: 'life', description: '生活 / Vlog / 旅行' },
  { tid: 211, name: '美食', icon: 'food', description: '美食 / 探店 / 料理' },
  { tid: 217, name: '动物圈', icon: 'animal', description: '喵星人 / 汪星人 / 萌宠' },
  { tid: 119, name: '鬼畜', icon: 'kichiku', description: '鬼畜 / 调教 / 音 MAD' },
  { tid: 155, name: '时尚', icon: 'fashion', description: '时尚 / 美妆 / 穿搭' },
  { tid: 202, name: '资讯', icon: 'news', description: '资讯 / 社会 / 国际' },
  { tid: 5, name: '娱乐', icon: 'entertainment', description: '娱乐 / 明星 / 综艺' },
  { tid: 181, name: '影视', icon: 'film', description: '影视 / 影评 / 混剪' },
  { tid: 177, name: '纪录片', icon: 'documentary', description: '纪录片 / 人文 / 自然' },
  { tid: 23, name: '电影', icon: 'movie', description: '电影 / 院线 / 经典' },
  { tid: 11, name: '电视剧', icon: 'tv', description: '电视剧 / 国产 / 欧美' },
]

export function getCategoryName(tid: number): string {
  return CATEGORIES.find((c) => c.tid === tid)?.name ?? '综合'
}

export const NAV_LINKS = [
  { tid: 0, name: '首页', path: '/' },
  { tid: 1, name: '动画', path: '/channel/1' },
  { tid: 13, name: '番剧', path: '/channel/13' },
  { tid: 167, name: '国创', path: '/channel/167' },
  { tid: 3, name: '音乐', path: '/channel/3' },
  { tid: 129, name: '舞蹈', path: '/channel/129' },
  { tid: 4, name: '游戏', path: '/channel/4' },
  { tid: 36, name: '知识', path: '/channel/36' },
  { tid: 188, name: '科技', path: '/channel/188' },
  { tid: 234, name: '运动', path: '/channel/234' },
  { tid: 160, name: '生活', path: '/channel/160' },
  { tid: 211, name: '美食', path: '/channel/211' },
  { tid: 217, name: '动物圈', path: '/channel/217' },
  { tid: 119, name: '鬼畜', path: '/channel/119' },
  { tid: 155, name: '时尚', path: '/channel/155' },
  { tid: 202, name: '资讯', path: '/channel/202' },
  { tid: 5, name: '娱乐', path: '/channel/5' },
  { tid: 181, name: '影视', path: '/channel/181' },
  { tid: 177, name: '纪录片', path: '/channel/177' },
  { tid: 23, name: '电影', path: '/channel/23' },
  { tid: 11, name: '电视剧', path: '/channel/11' },
]
