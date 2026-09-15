import type { Video, Up, Section, Comment } from '../types.js'
import { CATEGORIES, getCategoryName } from '../../data/categories.js'
import { UP_NAMES, pickTitle, pickTags } from '../../data/pools.js'

// 确定性伪随机，便于稳定数据
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// 头像：DiceBear 像素头像 + picsum 真实图片
function avatarFor(seed: number): string {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=up${seed}&backgroundColor=ffd5dc,ffdfbf,c0aede,d1d4f9,b6e3f4`
}

function coverFor(seed: number, w = 640, h = 360): string {
  // picsum 给到真实图片
  return `https://picsum.photos/seed/bv${seed}/${w}/${h}`
}

function makeUp(mid: number, rng: () => number): Up {
  const name = UP_NAMES[mid % UP_NAMES.length] + (mid > UP_NAMES.length ? Math.floor(mid / UP_NAMES.length) : '')
  return {
    mid,
    name,
    avatar: avatarFor(mid),
    fans: Math.floor(rng() * 9_900_000) + 1000,
    isVerified: rng() > 0.4,
    signature: '分享好玩、好看、好用的内容 / 欢迎合作',
  }
}

function makeVideo(aid: number, tid: number, rng: () => number): Video {
  const up = makeUp(aid, rng)
  const categoryName = getCategoryName(tid)
  const title = pickTitle(categoryName, rng)
  const tags = pickTags(categoryName, rng)
  const views = Math.floor(rng() * 9_000_000) + 1000
  const dur = Math.floor(rng() * 1500) + 30
  return {
    bvid: 'BV' + (aid + 10000000).toString(16).padStart(10, '0'),
    aid,
    title,
    cover: coverFor(aid),
    duration: dur,
    pubdate: Math.floor(Date.now() / 1000) - Math.floor(rng() * 60 * 60 * 24 * 60),
    up,
    tid,
    typename: categoryName,
    views,
    danmaku: Math.floor(views * (0.005 + rng() * 0.03)),
    likes: Math.floor(views * (0.02 + rng() * 0.06)),
    coins: Math.floor(views * (0.005 + rng() * 0.02)),
    favorites: Math.floor(views * (0.01 + rng() * 0.04)),
    description:
      `${title}\n\n${tags.map((t) => `#${t}#`).join(' ')}\n\n感谢观看！点赞投币收藏是对 UP 主最大的支持 ❤️`,
    tags,
    isBangumi: tid === 13 || tid === 167,
    isCooperation: rng() > 0.8,
  }
}

// 启动时一次性构建，保存到内存
const videosByTid = new Map<number, Video[]>()
const allVideos: Video[] = []

for (const cat of CATEGORIES) {
  const list: Video[] = []
  for (let i = 0; i < 200; i++) {
    const rng = mulberry32(cat.tid * 1000 + i + 1)
    list.push(makeVideo(cat.tid * 1000 + i, cat.tid, rng))
  }
  videosByTid.set(cat.tid, list)
  allVideos.push(...list)
}

// 推荐流：从多个分类里随机抽
const recommendRng = mulberry32(7)
const recommend: Video[] = []
for (let i = 0; i < 60; i++) {
  const cat = CATEGORIES[Math.floor(recommendRng() * CATEGORIES.length)]
  const pool = videosByTid.get(cat.tid) ?? []
  recommend.push(pool[Math.floor(recommendRng() * pool.length)])
}
allVideos.unshift(...recommend)

// 分区板块：用于首页多个 section
const SECTION_TIDS: { id: string; title: string; subtitle: string; tid: number }[] = [
  { id: 'promote', title: '热门推荐', subtitle: '今日大家都在看', tid: 0 },
  { id: 'anime', title: '动画', subtitle: '新番 / MAD / 治愈', tid: 1 },
  { id: 'bangumi', title: '番剧', subtitle: '本周连载更新', tid: 13 },
  { id: 'chinese', title: '国创', subtitle: '中国制造好动画', tid: 167 },
  { id: 'music', title: '音乐', subtitle: '让你单曲循环', tid: 3 },
  { id: 'game', title: '游戏', subtitle: '攻略 / 实况 / 集锦', tid: 4 },
  { id: 'knowledge', title: '知识', subtitle: '涨知识每一天', tid: 36 },
  { id: 'tech', title: '科技', subtitle: '数码 / AI / 评测', tid: 188 },
  { id: 'life', title: '生活', subtitle: 'Vlog / 日常 / 旅行', tid: 160 },
  { id: 'food', title: '美食', subtitle: '深夜放毒专区', tid: 211 },
  { id: 'kichiku', title: '鬼畜', subtitle: '洗脑循环', tid: 119 },
  { id: 'fashion', title: '时尚', subtitle: '穿搭 / 美妆 / 街拍', tid: 155 },
]

export const homeSections: Section[] = SECTION_TIDS.map((s) => {
  const pool = s.tid === 0 ? recommend : videosByTid.get(s.tid) ?? []
  const rng = mulberry32(s.tid + 11)
  const videos: Video[] = []
  const used = new Set<number>()
  while (videos.length < 10 && used.size < pool.length) {
    const i = Math.floor(rng() * pool.length)
    if (used.has(i)) continue
    used.add(i)
    videos.push(pool[i])
  }
  return { ...s, videos }
})

export function getVideoByBvid(bvid: string): Video | undefined {
  return allVideos.find((v) => v.bvid === bvid)
}

export function getRelated(bvid: string, tid: number, limit = 20): Video[] {
  const self = getVideoByBvid(bvid)
  const pool = videosByTid.get(tid) ?? []
  const rng = mulberry32((self?.aid ?? 0) + 7)
  const used = new Set<number>()
  const out: Video[] = []
  while (out.length < limit && used.size < pool.length) {
    const i = Math.floor(rng() * pool.length)
    if (used.has(i)) continue
    used.add(i)
    const v = pool[i]
    if (v.bvid === bvid) continue
    out.push(v)
  }
  return out
}

export function searchVideos(keyword: string, limit = 20): Video[] {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return []
  const matched = allVideos.filter(
    (v) => v.title.toLowerCase().includes(kw) || v.up.name.toLowerCase().includes(kw) || v.tags.some((t) => t.toLowerCase().includes(kw)),
  )
  // 模糊：取标题里至少含 kw 一个字的也包进来
  if (matched.length < limit) {
    const char = kw[0]
    if (char) {
      for (const v of allVideos) {
        if (matched.includes(v)) continue
        if (v.title.includes(char)) matched.push(v)
        if (matched.length >= limit * 2) break
      }
    }
  }
  return matched.slice(0, limit)
}

export function getRecommendSuggests(keyword: string, limit = 8): string[] {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return []
  const set = new Set<string>()
  for (const v of allVideos) {
    if (v.title.toLowerCase().includes(kw)) {
      set.add(v.title)
      if (set.size >= limit) break
    }
  }
  // 固定热搜兜底
  if (set.size < limit) {
    const fallbacks = [
      `${kw} 入门`,
      `${kw} 教程`,
      `${kw} 翻唱`,
      `${kw} 直播`,
      `${kw} 最新`,
      `${kw} 排行`,
      `${kw} 搞笑`,
      `${kw} 高能`,
    ]
    for (const f of fallbacks) {
      set.add(f)
      if (set.size >= limit) break
    }
  }
  return [...set].slice(0, limit)
}

export function listByTid(tid: number, page = 1, pageSize = 30): { items: Video[]; total: number; hasMore: boolean } {
  const pool = videosByTid.get(tid) ?? []
  const start = (page - 1) * pageSize
  const items = pool.slice(start, start + pageSize)
  return { items, total: pool.length, hasMore: start + pageSize < pool.length }
}

// 热门（按播放量）
const hotRng = mulberry32(99)
const hotCache: Video[] = [...allVideos].sort((a, b) => b.views - a.views)
export function getHot(limit = 100): Video[] {
  return hotCache.slice(0, limit)
}

// 评论 mock
const COMMENT_TEMPLATES = [
  '前排打卡，UP 主永远的神！',
  '笑死我了，这视频我能看十遍',
  '讲解得很清楚，学到了',
  'UP 主声音好好听，耳朵怀孕了',
  '慕名而来，果然没让我失望',
  '已三连，下次一定！',
  '这是什么宝藏 UP，求关注',
  '求 UP 主更新下一期！',
  '画面太美了，建议循环',
  '看完整个人都通透了',
  '这也太良心了！',
  '我是从隔壁推荐来的，没白来',
  'B 站永远能给我惊喜',
  '看完想马上去做这件事',
  '细节好评，UP 主用心了',
]

const COMMENTER_NAMES = [
  '不瘦二十斤不改名', '深夜emo患者', '永远的新人', '资深白嫖党', '佛系观众',
  '小透明打卡', '野生字幕君', '中二病晚期', '沙发', '吃瓜群众', '已三连',
  '路过点赞', '慕名而来', '专业顶帖', '打酱油的', '前排合影',
]

export function getComments(bvid: string, limit = 30): Comment[] {
  const v = getVideoByBvid(bvid)
  const rng = mulberry32((v?.aid ?? 0) + 33)
  const out: Comment[] = []
  for (let i = 0; i < limit; i++) {
    out.push({
      rpid: 100000 + i,
      uname: COMMENTER_NAMES[Math.floor(rng() * COMMENTER_NAMES.length)],
      avatar: avatarFor(i + 7),
      message: COMMENT_TEMPLATES[Math.floor(rng() * COMMENT_TEMPLATES.length)],
      ctime: Math.floor(Date.now() / 1000) - Math.floor(rng() * 60 * 60 * 24 * 30),
      like: Math.floor(rng() * 9000),
      replies: rng() > 0.85 ? Math.floor(rng() * 20) : 0,
    })
  }
  return out
}

export { videosByTid, allVideos }
