/** 搜索历史：存在 localStorage，最多 10 条。 */

const KEY = 'bili-clone:search-history';
const MAX = 10;

export function readHistory(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(list) ? list.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function pushHistory(keyword: string): string[] {
  const kw = keyword.trim();
  if (!kw) return readHistory();
  const next = [kw, ...readHistory().filter((item) => item !== kw)].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearHistory(): string[] {
  localStorage.removeItem(KEY);
  return [];
}
