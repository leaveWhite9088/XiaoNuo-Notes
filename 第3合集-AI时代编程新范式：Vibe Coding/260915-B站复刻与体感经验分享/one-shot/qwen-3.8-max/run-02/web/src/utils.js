// 通用格式化工具
export function fmtCount(n) {
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿';
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return String(n);
}

export function fmtDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function fmtTimeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const day = Math.floor(diff / 86400000);
  if (day <= 0) return '今天';
  if (day === 1) return '昨天';
  if (day < 30) return `${day}天前`;
  if (day < 365) return `${Math.floor(day / 30)}个月前`;
  return `${Math.floor(day / 365)}年前`;
}
