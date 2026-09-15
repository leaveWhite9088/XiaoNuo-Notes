import { db, persistComments, findVideo } from '../repositories/db.js';

// 没抓到真实评论时的兜底池（避免空评论区）
const FALLBACK_POOL = [
  '前方高能预警，建议戴耳机观看',
  '这个转场也太丝滑了吧，up 主辛苦了',
  '三连了三连了，期待下期',
  '来了来了，每日打卡',
  '断网了一晚上，回来第一件事就是补更',
  '这就是电子榨菜吗，下饭神器',
  '细节控狂喜，每一个画面都有信息量',
  '看完立刻去给朋友安利了',
  '收藏 = 学会，先马后看',
  '弹幕礼仪从我做起，前排留个爪印',
  '看了三遍，每一遍都有新发现',
  '这个选题太棒了，终于有人讲这个了',
];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function synthComments(videoId, count = 8) {
  const list = [];
  for (let i = 0; i < count; i++) {
    const h = hash(videoId + ':' + i);
    const up = db.videos.find((v) => v.id === videoId);
    const isUp = i === 0 && up;
    list.push({
      rpid: `synth-${videoId}-${i}`,
      mid: isUp ? up.owner.mid : 100000 + (h % 900000),
      name: isUp ? `${up.owner.name}（UP主）` : `路人_${String(h % 100000).padStart(5, '0')}`,
      face: isUp ? up.owner.face : '/static/avatars/pool.jpg',
      content: FALLBACK_POOL[h % FALLBACK_POOL.length],
      like: 5 + (h % 800),
      time: new Date(Date.now() - (h % 30) * 86400000).toISOString(),
      isUp: Boolean(isUp),
      isSelf: false,
    });
  }
  return list;
}

export function getComments(videoId) {
  if (!findVideo(videoId)) return null;
  const stored = db.comments[videoId] || [];
  const list = stored.length ? stored : synthComments(videoId);
  return {
    total: list.length,
    list: [...list].sort((a, b) => (b.isSelf - a.isSelf) || b.like - a.like),
  };
}

export function addComment(videoId, { content, name = 'bili_演示用户' }) {
  if (!findVideo(videoId)) return null;
  const text = String(content || '').trim();
  if (!text || text.length > 500) {
    const err = new Error(text ? '评论内容过长（上限 500 字）' : '评论内容不能为空');
    err.status = 400;
    throw err;
  }
  const comment = {
    rpid: `self-${videoId}-${Date.now()}`,
    mid: 0,
    name,
    face: '/static/avatars/me.jpg',
    content: text,
    like: 0,
    time: new Date().toISOString(),
    isUp: false,
    isSelf: true,
  };
  if (!db.comments[videoId]) db.comments[videoId] = [];
  db.comments[videoId].unshift(comment);
  persistComments();
  return comment;
}
