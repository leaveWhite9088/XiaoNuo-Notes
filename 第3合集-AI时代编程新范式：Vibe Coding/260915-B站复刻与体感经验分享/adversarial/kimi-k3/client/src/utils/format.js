// 通用格式化：万单位
export function formatCount(n) {
  if (n == null) return '0';
  if (typeof n === 'string') return n;
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + '万';
  return String(n);
}

// 种子数据里 playCount 以「万」为单位存储，这里转成展示文案
export function formatWan(n) {
  if (n == null) return '0';
  return n >= 1 ? `${n}万` : `${Math.round(n * 10000)}`;
}
