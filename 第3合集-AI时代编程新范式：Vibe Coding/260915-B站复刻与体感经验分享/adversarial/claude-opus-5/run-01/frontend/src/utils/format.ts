/** B 站风格的数字 / 时间格式化 */

export function formatCount(n: number): string {
  if (!Number.isFinite(n)) return '0';
  if (n >= 100_000_000) return `${trim(n / 100_000_000)}亿`;
  if (n >= 10_000) return `${trim(n / 10_000)}万`;
  return String(n);
}

function trim(v: number): string {
  return v.toFixed(1).replace(/\.0$/, '');
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (x: number) => String(x).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/** 相对时间：刚刚 / x分钟前 / x小时前 / 昨天 / x-x（同年） / x-x-x */
export function formatRelativeTime(unixSeconds: number): string {
  const now = Date.now() / 1000;
  const diff = now - unixSeconds;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 86400 * 2) return '昨天';
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}天前`;
  const d = new Date(unixSeconds * 1000);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  return sameYear ? `${mm}-${dd}` : `${d.getFullYear()}-${mm}-${dd}`;
}

export function formatDateTime(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 把关键词在文本中的命中部分切出来，供搜索联想高亮使用 */
export function splitHighlight(text: string, keyword: string): { text: string; hit: boolean }[] {
  const q = keyword.trim();
  if (!q) return [{ text, hit: false }];
  const lower = text.toLowerCase();
  const target = q.toLowerCase();
  const out: { text: string; hit: boolean }[] = [];
  let from = 0;
  for (;;) {
    const idx = lower.indexOf(target, from);
    if (idx === -1) break;
    if (idx > from) out.push({ text: text.slice(from, idx), hit: false });
    out.push({ text: text.slice(idx, idx + q.length), hit: true });
    from = idx + q.length;
  }
  if (from < text.length) out.push({ text: text.slice(from), hit: false });
  return out.length ? out : [{ text, hit: false }];
}
