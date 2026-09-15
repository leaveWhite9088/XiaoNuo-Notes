/**
 * 展示层格式化工具（后端统一产出，前端不再重复计算）
 */

/** 秒 -> mm:ss / hh:mm:ss */
export function formatDuration(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

/** 数字 -> B站风格中文计数（1.2万 / 3.4亿） */
export function formatCount(num) {
  const n = Number(num) || 0;
  if (n < 10000) return String(n);
  if (n < 100000000) {
    const v = n / 10000;
    return `${v >= 100 ? v.toFixed(0) : v.toFixed(1).replace(/\.0$/, '')}万`;
  }
  const v = n / 100000000;
  return `${v.toFixed(1).replace(/\.0$/, '')}亿`;
}

/** 时间戳 -> 相对时间（刚刚 / 3小时前 / 昨天 / 09-08） */
export function formatRelativeTime(ts) {
  const t = Number(ts) || 0;
  if (!t) return '';
  const now = Date.now();
  const diff = Math.max(0, now - t * 1000);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)}小时前`;
  if (diff < 2 * day) return '昨天';
  if (diff < 30 * day) return `${Math.floor(diff / day)}天前`;

  const d = new Date(t * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 播放量文案，B站首页卡片规则：>=1万显示“x.x万播放” */
export function formatPlayCount(num) {
  const n = Number(num) || 0;
  if (n >= 10000) return `${formatCount(n)}播放`;
  return `${n}播放`;
}

export function stripHtml(str = '') {
  return String(str).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export default { formatDuration, formatCount, formatRelativeTime, formatPlayCount, stripHtml };
