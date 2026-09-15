// 评论区种子数据：按 bvid 确定性生成

const NAMES = [
  '风一样的少年', '不爱吃香菜', '摸鱼大师', '六级大佬', '硬币都没了',
  '弹幕护体', '白嫖使我快乐', '蹲坑看B站', '熬夜冠军', '柠檬精本精',
  '路过的假面骑士', '一只野生UP', 'B站有房', '下次一定', '三连打卡机'
];

const CONTENT = [
  '前排！终于等到更新了',
  '这个质量也太高了吧，三连奉上',
  '看到一半直接泪目，UP主太用心了',
  '纯路人，被封面骗进来的，结果看完了',
  '这就是B站的宝藏视频吗，爱了爱了',
  '收藏了，等有空再刷一遍',
  '讲真的，这期比上期进步好多',
  '弹幕里都是人才，说话又好听',
  '已三连，求UP主眼熟我',
  '这内容放别的平台不得收费啊',
  '熬夜看完，明天还要上班，但是值了',
  'UP主的声音好好听，耳朵怀孕了',
  '干货满满，记了三页笔记',
  '全程姨母笑看完，太治愈了',
  '下一期搞快点！生产队的驴都不敢这么歇',
  '从首页推荐点进来的，果然没让我失望',
  '这个转场绝了，学了三天没学会',
  '评论区的各位都是彦祖和亦菲吧'
];

const REPLY_CONTENT = [
  '同感！我也这么觉得', '说出我的心声了', '+1', '楼上说得好',
  '确实，深有同感', '哈哈哈哈哈真实', '考古学家前来报到'
];

function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromBvid(bvid) {
  let s = 0;
  for (const ch of bvid) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  return s;
}

export function getComments(bvid) {
  const r = rng(seedFromBvid(bvid));
  const count = 6 + Math.floor(r() * 12);
  const comments = [];
  for (let i = 0; i < count; i++) {
    const nameIdx = Math.floor(r() * NAMES.length);
    const replies = [];
    const replyCount = Math.floor(r() * 3);
    for (let j = 0; j < replyCount; j++) {
      const rIdx = Math.floor(r() * NAMES.length);
      replies.push({
        id: `${bvid}-c${i}-r${j}`,
        user: { name: NAMES[rIdx], avatar: `https://picsum.photos/seed/cm-${rIdx}/80/80` },
        content: REPLY_CONTENT[Math.floor(r() * REPLY_CONTENT.length)],
        likes: Math.floor(r() * 500),
        time: Date.now() - Math.floor(r() * 30) * 86400000
      });
    }
    comments.push({
      id: `${bvid}-c${i}`,
      user: { name: NAMES[nameIdx], avatar: `https://picsum.photos/seed/cm-${nameIdx}/80/80` },
      content: CONTENT[Math.floor(r() * CONTENT.length)],
      likes: Math.floor(Math.pow(r(), 1.5) * 8000),
      time: Date.now() - Math.floor(r() * 25) * 86400000,
      replies
    });
  }
  return comments.sort((a, b) => b.likes - a.likes);
}
