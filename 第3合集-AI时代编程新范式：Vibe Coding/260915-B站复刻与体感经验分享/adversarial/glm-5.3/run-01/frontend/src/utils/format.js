/** 播放量/弹幕数等：1 万以上显示 x.x 万，1 亿以上显示 x.x 亿 */
export function formatCount(n) {
  if (n === undefined || n === null) return '-';
  if (n >= 1e8) return `${(n / 1e8).toFixed(1)}亿`;
  if (n >= 1e4) return `${(n / 1e4).toFixed(1)}万`;
  return String(n);
}

/** 秒 → mm:ss / h:mm:ss */
export function formatDuration(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return h > 0 ? `${h}:${mm}:${String(r).padStart(2, '0')}` : `${mm}:${String(r).padStart(2, '0')}`;
}

/** 时间戳 → 相对时间（B 站风格） */
export function timeAgo(ts) {
  const now = Date.now();
  const diff = Math.max(0, Math.floor((now - ts * 1000) / 1000));
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}天前`;
  if (diff < 86400 * 365) return `${Math.floor(diff / 86400 / 30)}个月前`;
  return `${Math.floor(diff / 86400 / 365)}年前`;
}

/** 日期完整格式：2024-06-01 12:00 */
export function formatDate(ts) {
  const d = new Date(ts * 1000);
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
