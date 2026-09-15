// B 站风格种子数据：视频、评论、Banner
// 封面/头像/视频文件均使用可真实加载的公开资源

// 说明：指定的 pravatar / googleapis 域名在本机网络不可达（403/超时），
// 已替换为经验证可真实加载的同类资源（randomuser 头像 / 可连通 MP4 CDN）。
const MP4 = [
  'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
  'https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_1MB.mp4',
  'https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_1MB.mp4',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://filesamples.com/samples/video/mp4/sample_640x360.mp4',
];

// 稳定头像：按种子确定性映射到 randomuser 真实人像
function avatar(seed) {
  const n = ((seed % 100) + 100) % 100;
  return `https://randomuser.me/api/portraits/${seed % 2 === 0 ? 'men' : 'women'}/${n}.jpg`;
}

const upPool = [
  { name: '老师好我叫何同学', fans: 1056.2 },
  { name: '影视飓风', fans: 892.4 },
  { name: '罗翔说刑法', fans: 2765.8 },
  { name: '绵羊料理', fans: 1188.3 },
  { name: '手工耿', fans: 743.5 },
  { name: '花少北丶', fans: 692.1 },
  { name: '凉风Kaze', fans: 845.7 },
  { name: '咬人猫', fans: 534.9 },
  { name: 'A路人', fans: 388.2 },
  { name: 'ilem', fans: 271.6 },
  { name: 'LexBurner', fans: 612.3 },
  { name: '硬核的半佛仙人', fans: 928.4 },
  { name: '科技美学', fans: 456.8 },
  { name: '盗月社食遇记', fans: 786.5 },
  { name: '周六野Zoey', fans: 894.2 },
  { name: '黄龄', fans: 210.7 },
];

const commentNicknames = [
  '摸鱼办主任', '三级号瑟瑟发抖', '今天也要加油鸭', '路过的假面骑士', '键盘侠本侠',
  '追番少年', '弹幕护体', '白嫖使我快乐', '下次一定', '已三连',
  '前排围观', '沙发是我的', '考古队员', '首页通知书', '百万剪辑师',
];

const commentTexts = [
  '前排！UP主终于更新了，等了好久',
  '这质量也太高了吧，三连了',
  '看完了，干货满满，感谢分享',
  '哈哈哈哈哈哈笑死我了',
  '这个剪辑绝了，转场丝滑',
  '已收藏，回头慢慢研究',
  'UP主辛苦了，注意身体',
  '爷青回！泪目',
  '下一期什么时候更新？催更！',
  '这个知识点讲得太清楚了',
  '是我喜欢的风格，关注了',
  '播放量不对劲，给我冲！',
];

// 简化评论生成器：每个视频 3-5 条评论，稳定可复现
function makeComments(seed, count = 4) {
  const comments = [];
  for (let i = 0; i < count; i++) {
    const idx = (seed * 7 + i * 3) % commentNicknames.length;
    const tidx = (seed * 5 + i * 11) % commentTexts.length;
    comments.push({
      id: `c-${seed}-${i}`,
      nickname: commentNicknames[idx],
      avatar: avatar(seed + i * 13),
      time: `${(seed + i) % 12 + 1}小时前`,
      content: commentTexts[tidx],
      likes: ((seed * 37 + i * 101) % 900) + 12,
    });
  }
  return comments;
}

let seq = 0;
function v({ title, up, category, play, danmaku, duration, desc, tags, daysAgo }) {
  seq += 1;
  const upInfo = upPool[up];
  const seedWord = `bili-${category}-${seq}`;
  return {
    id: `BV1${String(seq).padStart(3, '0')}xK4y${(seq * 7919) % 97}Z`,
    title,
    upName: upInfo.name,
    upFans: upInfo.fans,
    upAvatar: avatar(seq + 5),
    cover: `https://picsum.photos/seed/${seedWord}/640/400`,
    playCount: play,
    danmakuCount: danmaku,
    duration,
    category,
    desc,
    pubDate: daysAgo === 0 ? '刚刚' : daysAgo < 24 ? `${daysAgo}小时前` : `${Math.floor(daysAgo / 24)}天前`,
    videoUrl: MP4[seq % MP4.length],
    tags,
    comments: makeComments(seq, 3 + (seq % 3)),
  };
}

const videos = [
  // 科技
  v({ title: '【何同学】我做了一个新实验：让全家的设备听懂一句话', up: 0, category: '科技', play: 486.5, danmaku: 6.2, duration: '12:34', desc: '这次我们尝试把家里的所有智能设备串在一起，只用一句话就能控制。过程比想象中曲折得多……', tags: ['何同学', '智能家居', '实验'], daysAgo: 3 }),
  v({ title: '影视飓风：8K 延时摄影，拍了整整 30 天的城市', up: 1, category: '科技', play: 312.7, danmaku: 4.1, duration: '09:48', desc: '30 天、12 台相机、8000GB 素材，只为呈现这座城市的日与夜。', tags: ['8K', '延时摄影', '影视飓风'], daysAgo: 26 }),
  v({ title: '2024 年最值得买的五款手机横评，结果出乎意料', up: 12, category: '科技', play: 156.3, danmaku: 2.8, duration: '18:22', desc: '预算从 1500 到 8000，我们实测了五款热门机型的续航、影像和性能。', tags: ['手机', '横评', '数码'], daysAgo: 50 }),
  v({ title: '新手向 Vue3 教程 第1期：从零搭建你的第一个项目', up: 8, category: '科技', play: 45.6, danmaku: 1.2, duration: '25:10', desc: '本系列面向零基础同学，第一期带大家装好环境、跑起第一个 Vue3 + Vite 项目。', tags: ['Vue3', '前端', '教程'], daysAgo: 120 }),
  v({ title: '我拆解了 ChatGPT 级大模型的推理过程，用人话讲给你听', up: 11, category: '科技', play: 203.4, danmaku: 3.5, duration: '15:47', desc: 'Transformer 到底是什么？注意力机制为什么重要？一期视频讲明白。', tags: ['AI', '大模型', '科普'], daysAgo: 15 }),
  v({ title: '1000 元装机挑战：能玩 3A 大作吗？', up: 12, category: '科技', play: 98.2, danmaku: 1.9, duration: '14:03', desc: '垃圾佬狂喜！1000 元预算装机全过程，最后跑分亮了。', tags: ['装机', '硬件', '性价比'], daysAgo: 80 }),

  // 游戏
  v({ title: '【花少北】这个游戏把我玩哭了（真的）', up: 5, category: '游戏', play: 267.8, danmaku: 5.4, duration: '22:16', desc: '本来以为是搞笑游戏，没想到结局直接破防。含剧透，谨慎观看。', tags: ['实况', '剧情向', '催泪'], daysAgo: 10 }),
  v({ title: '黑神话悟空 全Boss无伤速通 第一章', up: 9, category: '游戏', play: 534.1, danmaku: 8.7, duration: '31:45', desc: '第一章全 Boss 无伤心得分享，招式拆解在进度条分段里。', tags: ['黑神话悟空', '速通', '攻略'], daysAgo: 200 }),
  v({ title: '原神 5.3 版本前瞻：新角色实机演示全解析', up: 10, category: '游戏', play: 189.6, danmaku: 3.3, duration: '16:28', desc: '新角色技能机制详解，值不值得抽？看完这期再决定。', tags: ['原神', '版本前瞻', '角色解析'], daysAgo: 40 }),
  v({ title: 'MC 建筑大佬花 300 天还原了整个紫禁城', up: 7, category: '游戏', play: 412.5, danmaku: 6.9, duration: '11:52', desc: '一砖一瓦都是方块，300 天的坚持，成品震撼。', tags: ['我的世界', '建筑', '紫禁城'], daysAgo: 300 }),
  v({ title: '英雄联盟 全球总决赛 十佳操作集锦', up: 9, category: '游戏', play: 321.9, danmaku: 5.1, duration: '08:37', desc: '神仙打架！今年世界赛最离谱的十个瞬间，第一个就看傻了。', tags: ['LOL', 'S赛', '集锦'], daysAgo: 60 }),
  v({ title: '独立游戏推荐：这 5 款小体量神作你值得拥有', up: 8, category: '游戏', play: 76.4, danmaku: 1.4, duration: '13:29', desc: '不靠画面靠玩法，五款评分 9 分以上的独立游戏安利。', tags: ['独立游戏', '推荐', 'Steam'], daysAgo: 90 }),

  // 音乐
  v({ title: '【ilem】新曲发布：这次尝试了完全不一样的风格', up: 9, category: '音乐', play: 278.3, danmaku: 4.6, duration: '04:12', desc: '词曲编混录一体机再次上线，希望大家喜欢这首新歌。', tags: ['原创音乐', 'V家', 'ilem'], daysAgo: 5 }),
  v({ title: '黄龄浴室歌姬系列：这首戏腔直接封神', up: 15, category: '音乐', play: 456.7, danmaku: 7.2, duration: '03:45', desc: '浴室混响 + 戏腔，一开口鸡皮疙瘩就起来了。', tags: ['黄龄', '戏腔', '翻唱'], daysAgo: 150 }),
  v({ title: '用计算器演奏《千本樱》，手速看呆了', up: 7, category: '音乐', play: 189.2, danmaku: 3.8, duration: '02:58', desc: '四台计算器，一个月练习，请把「离谱」打在公屏上。', tags: ['计算器演奏', '千本樱', '手速'], daysAgo: 400 }),
  v({ title: '2024 年度华语乐坛混剪：哪首是你的年度之歌', up: 11, category: '音乐', play: 134.5, danmaku: 2.6, duration: '10:24', desc: '80 首歌剪进 10 分钟，这一年我们一起听过的旋律。', tags: ['年度混剪', '华语音乐', '2024'], daysAgo: 35 }),
  v({ title: '从零开始学编曲 第1期：认识你的 DAW', up: 8, category: '音乐', play: 34.8, danmaku: 0.8, duration: '20:15', desc: '编曲入门系列开播，第一期先搞懂宿主软件怎么选、怎么用。', tags: ['编曲', '教程', '音乐制作'], daysAgo: 70 }),

  // 舞蹈
  v({ title: '【咬人猫】超元气宅舞新作！这次是在海边跳的', up: 7, category: '舞蹈', play: 245.6, danmaku: 4.3, duration: '03:56', desc: '海风、夕阳和元气满满的舞蹈，希望大家看得开心！', tags: ['宅舞', '咬人猫', '海边'], daysAgo: 8 }),
  v({ title: '一镜到底翻跳《寄明月》，这走位太丝滑了', up: 14, category: '舞蹈', play: 167.3, danmaku: 3.1, duration: '04:21', desc: '排练了整整两个月的一镜到底，零剪辑，求个三连鼓励！', tags: ['翻跳', '寄明月', '一镜到底'], daysAgo: 45 }),
  v({ title: '街舞 Battle 名场面：这一轮裁判直接起立', up: 10, category: '舞蹈', play: 289.4, danmaku: 5.6, duration: '07:18', desc: ' popping 对决的巅峰一轮，能量拉满，全程高能。', tags: ['街舞', 'Battle', 'popping'], daysAgo: 110 }),
  v({ title: '零基础学宅舞 第1课：从最简单的振付开始', up: 7, category: '舞蹈', play: 52.1, danmaku: 1.0, duration: '15:33', desc: '想跳宅舞但不知道怎么开始？跟着这个系列练就行。', tags: ['宅舞教程', '零基础', '教学'], daysAgo: 160 }),
  v({ title: '大学街舞社快闪：食堂门口突然被围观了', up: 13, category: '舞蹈', play: 98.7, danmaku: 2.2, duration: '05:47', desc: '社团招新快闪实录，围观同学比我们还嗨哈哈哈。', tags: ['快闪', '街舞社', '校园'], daysAgo: 22 }),

  // 生活
  v({ title: '【绵羊料理】复刻米其林三星招牌菜，成本只要 30 块', up: 3, category: '生活', play: 523.8, danmaku: 7.8, duration: '13:26', desc: '历经 7 次失败，终于在家做出了那道传说中的菜！', tags: ['美食', '复刻', '绵羊料理'], daysAgo: 12 }),
  v({ title: '盗月社：凌晨四点的菜市场，藏着这座城市最好吃的早餐', up: 13, category: '生活', play: 356.2, danmaku: 5.9, duration: '17:41', desc: '跟着摊主凌晨进货，吃到了今年最惊艳的一碗粉。', tags: ['盗月社', '美食探店', '早餐'], daysAgo: 18 }),
  v({ title: '【手工耿】我做了一个自动撸串机，朋友都说有用', up: 4, category: '生活', play: 678.9, danmaku: 12.4, duration: '10:08', desc: '这次的发明真的有用（大概），自动翻串，解放双手。', tags: ['手工耿', '发明', '搞笑'], daysAgo: 6 }),
  v({ title: '租房改造：5000 元把老破小变成治愈系小窝', up: 14, category: '生活', play: 187.5, danmaku: 3.4, duration: '14:52', desc: '不动硬装，纯软装改造全记录，清单在评论区置顶。', tags: ['租房改造', '软装', 'vlog'], daysAgo: 55 }),
  v({ title: '骑行川藏线 Day1：第一天就被上坡教做人', up: 8, category: '生活', play: 76.9, danmaku: 1.6, duration: '19:37', desc: '筹备两年的川藏骑行终于出发，日更连载，欢迎关注。', tags: ['骑行', '川藏线', '旅行'], daysAgo: 9 }),
  v({ title: '极简生活一年后，我的家里只剩 100 件物品', up: 11, category: '生活', play: 92.3, danmaku: 1.8, duration: '12:19', desc: '断舍离不是扔东西，是重新认识自己需要什么。', tags: ['极简', '生活方式', '断舍离'], daysAgo: 75 }),

  // 番剧
  v({ title: '【LexBurner】四月新番导视：这季神仙打架', up: 10, category: '番剧', play: 312.4, danmaku: 6.1, duration: '16:54', desc: '四月新番全盘点，这 5 部必看，这 3 部建议观望。', tags: ['新番导视', '四月新番', '动漫'], daysAgo: 30 }),
  v({ title: '一口气看完《孤独摇滚》：社恐女孩的音乐救赎', up: 6, category: '番剧', play: 234.7, danmaku: 4.8, duration: '24:36', desc: '波奇酱的成长之路，看完想立刻去学吉他。', tags: ['孤独摇滚', '动漫解说', '补番'], daysAgo: 240 }),
  v({ title: '新海诚式光影：为什么他的动画每一帧都能当壁纸', up: 7, category: '番剧', play: 156.8, danmaku: 2.9, duration: '11:27', desc: '从《你的名字》到《铃芽之旅》，拆解新海诚的光影美学。', tags: ['新海诚', '动画解析', '光影'], daysAgo: 130 }),
  v({ title: '2024 年度动画混剪：献给所有热爱二次元的人', up: 6, category: '番剧', play: 289.1, danmaku: 6.6, duration: '06:42', desc: '60 部动画，300 个镜头，这是我们的 2024。', tags: ['年度混剪', '动画', 'AMV'], daysAgo: 25 }),
  v({ title: '老番推荐：十年前的这部作品至今无人超越', up: 10, category: '番剧', play: 98.4, danmaku: 2.1, duration: '18:09', desc: '考古向安利，为什么说它是近十年最好的原创动画。', tags: ['老番', '安利', '原创动画'], daysAgo: 100 }),

  // 鬼畜
  v({ title: '【鬼畜全明星】这个前奏一响，DNA 动了', up: 9, category: '鬼畜', play: 445.3, danmaku: 9.8, duration: '03:28', desc: '全明星阵容回归，还是熟悉的味道，还是熟悉的配方。', tags: ['鬼畜全明星', '文艺复兴', '高能'], daysAgo: 4 }),
  v({ title: '用甄嬛传的方式打开职场：华妃竟是我领导', up: 8, category: '鬼畜', play: 267.9, danmaku: 5.7, duration: '05:16', desc: '打工人必看，每一句台词都精准命中周一的你。', tags: ['甄嬛传', '配音', '职场'], daysAgo: 14 }),
  v({ title: '我把导师的口头禅做成了一首歌', up: 7, category: '鬼畜', play: 178.6, danmaku: 4.2, duration: '02:47', desc: '「这个图再改改」「数据呢？」——谨以此歌献给所有研究生。', tags: ['鬼畜调教', '研究生', '导师'], daysAgo: 48 }),
  v({ title: '十年前的鬼畜区是什么样的？带你考古镇站之宝', up: 6, category: '鬼畜', play: 203.5, danmaku: 5.3, duration: '12:58', desc: '金坷垃、蓝蓝路、德国boy……那些年的快乐源泉考古。', tags: ['考古', '鬼畜史', '镇站之宝'], daysAgo: 85 }),
  v({ title: 'AI 翻唱整活：让海绵宝宝唱京剧', up: 11, category: '鬼畜', play: 156.2, danmaku: 3.6, duration: '03:59', desc: '离谱但好听是怎么回事？AI 整活的边界在哪里。', tags: ['AI翻唱', '整活', '离谱'], daysAgo: 20 }),

  // 时尚
  v({ title: '【周六野】10 分钟瘦手臂训练，新手友好无器械', up: 14, category: '时尚', play: 389.4, danmaku: 3.7, duration: '11:15', desc: '每天一遍，两周见效，记得打卡！', tags: ['健身', '瘦手臂', '周六野'], daysAgo: 210 }),
  v({ title: '平价穿搭：全身不超过 300 元也能穿出高级感', up: 13, category: '时尚', play: 134.7, danmaku: 2.4, duration: '09:36', desc: '学生党友好，五套搭配直接抄作业，链接在简介。', tags: ['穿搭', '平价', '学生党'], daysAgo: 38 }),
  v({ title: '男生护肤入门：其实只要这三步就够了', up: 11, category: '时尚', play: 87.9, danmaku: 1.5, duration: '08:24', desc: '别再用肥皂洗脸了！直男也能看懂的护肤指南。', tags: ['护肤', '男生', '入门'], daysAgo: 65 }),
  v({ title: '汉服出行日：穿马面裙逛了一天博物馆', up: 13, category: '时尚', play: 156.3, danmaku: 3.0, duration: '13:48', desc: '传统服饰日常化的一天，被路人阿姨夸了好开心。', tags: ['汉服', '马面裙', '日常'], daysAgo: 28 }),
  v({ title: '通勤妆教程：15 分钟搞定的伪素颜', up: 14, category: '时尚', play: 98.5, danmaku: 1.9, duration: '16:02', desc: '早八人必备，手残党也能学会的快速出门妆。', tags: ['美妆', '通勤妆', '教程'], daysAgo: 42 }),

  // 补充（科技/生活/游戏 各加一条，凑足 40+ 并丰富热门排序）
  v({ title: '【硬核科普】为什么手机充电越来越快，电池却越来越不耐用', up: 11, category: '科技', play: 178.4, danmaku: 2.7, duration: '13:11', desc: '快充伤电池吗？锂离子电池的寿命真相，一期讲透。', tags: ['科普', '电池', '快充'], daysAgo: 33 }),
  v({ title: '宿舍美食：只用一个小电锅做出一周不重样晚餐', up: 3, category: '生活', play: 213.6, danmaku: 4.0, duration: '15:27', desc: '宿管阿姨看了都说香，附全部食谱和采购清单。', tags: ['宿舍美食', '电锅', '食谱'], daysAgo: 16 }),
  v({ title: '星露谷物语：退休后我在游戏里种田的 365 天', up: 5, category: '游戏', play: 145.2, danmaku: 2.8, duration: '20:44', desc: '一年游戏时间全记录，这大概是今年最治愈的视频。', tags: ['星露谷', '种田', '治愈'], daysAgo: 58 }),
  v({ title: '【罗翔】网络喷子要负法律责任吗？', up: 2, category: '生活', play: 789.3, danmaku: 11.2, duration: '14:56', desc: '键盘不是法外之地，本期聊聊网络暴力的法律边界。', tags: ['罗翔', '普法', '网络暴力'], daysAgo: 2 }),
];

const banners = [
  { id: 1, image: 'https://picsum.photos/seed/bili-banner-newyear/1200/300', title: '拜年纪 2025：预约开启，除夕不见不散', link: '/video/BV1001xK4y62Z' },
  { id: 2, image: 'https://picsum.photos/seed/bili-banner-game/1200/300', title: '游戏嘉年华：新游试玩节限时开启', link: '/video/BV1007xK4y46Z' },
  { id: 3, image: 'https://picsum.photos/seed/bili-banner-anime/1200/300', title: '一月新番导视：追番日历一键收藏', link: '/video/BV1029xK4y52Z' },
  { id: 4, image: 'https://picsum.photos/seed/bili-banner-music/1200/300', title: '年度音乐混剪大赛：投稿赢十万奖金', link: '/video/BV1013xK4y30Z' },
  { id: 5, image: 'https://picsum.photos/seed/bili-banner-food/1200/300', title: '美食区新春企划：晒出你的年夜饭', link: '/video/BV1023xK4y68Z' },
];

module.exports = { videos, banners };
