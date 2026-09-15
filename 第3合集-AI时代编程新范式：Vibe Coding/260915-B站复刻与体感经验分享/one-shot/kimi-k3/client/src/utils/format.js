export function formatCount(n) {
  if (n >= 100000000) return (n / 100000000).toFixed(1).replace(/\.0$/, '') + '亿';
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + '万';
  return String(n);
}

export function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatTime(ts) {
  const diff = Date.now() - ts;
  const hour = 3600000;
  if (diff < hour) return `${Math.max(1, Math.floor(diff / 60000))}分钟前`;
  if (diff < 24 * hour) return `${Math.floor(diff / hour)}小时前`;
  if (diff < 30 * 24 * hour) return `${Math.floor(diff / (24 * hour))}天前`;
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
