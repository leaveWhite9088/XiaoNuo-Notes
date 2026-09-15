/** 展示格式化：播放量、时长、相对时间等，规则对齐 B 站站内习惯。 */

/** 12345 → 1.2万；123456789 → 1.2亿 */
export function formatCount(value: number): string {
  if (!Number.isFinite(value)) return '0';
  if (value >= 100_000_000) return `${trim(value / 100_000_000)}亿`;
  if (value >= 10_000) return `${trim(value / 10_000)}万`;
  return String(value);
}

function trim(n: number): string {
  return n.toFixed(1).replace(/\.0$/, '');
}

/** 秒 → 03:25 / 1:02:03 */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

/** 站内"当前时间"与数据集保持一致，保证相对时间稳定 */
const NOW = Date.parse('2026-09-12T12:00:00.000Z');

/** 相对时间：刚刚 / 3 小时前 / 昨天 / 9-2 */
export function formatRelativeTime(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  const diff = Math.max(0, NOW - t);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < 10 * minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)}小时前`;
  if (diff < 2 * day) return '昨天';
  if (diff < 30 * day) return `${Math.floor(diff / day)}天前`;
  const d = new Date(t);
  return `${d.getMonth() + 1}-${d.getDate()}`;
}

/** 播放页信息栏用的绝对时间：2026-09-10 18:26 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
}

/** 关键词高亮：按命中片段切分 */
export function splitByKeyword(text: string, keyword: string): { text: string; hit: boolean }[] {
  const kw = keyword.trim();
  if (!kw) return [{ text, hit: false }];
  const parts: { text: string; hit: boolean }[] = [];
  let rest = text;
  let idx = rest.toLowerCase().indexOf(kw.toLowerCase());
  while (idx !== -1) {
    if (idx > 0) parts.push({ text: rest.slice(0, idx), hit: false });
    parts.push({ text: rest.slice(idx, idx + kw.length), hit: true });
    rest = rest.slice(idx + kw.length);
    idx = rest.toLowerCase().indexOf(kw.toLowerCase());
  }
  if (rest) parts.push({ text: rest, hit: false });
  return parts;
}
