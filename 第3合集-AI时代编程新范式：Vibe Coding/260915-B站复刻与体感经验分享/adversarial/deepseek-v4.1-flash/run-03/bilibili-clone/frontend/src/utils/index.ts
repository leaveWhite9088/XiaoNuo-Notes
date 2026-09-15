/** 前端通用格式化与小工具 */

/** 图片加载失败时的占位图（内联 SVG，避免额外请求） */
export function fallbackCover(text = '哔哩哔哩'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FB7299"/><stop offset="100%" stop-color="#00AEEC"/>
    </linearGradient></defs>
    <rect width="320" height="200" fill="url(#g)" opacity="0.85"/>
    <text x="50%" y="52%" fill="#fff" font-size="18" font-family="sans-serif"
      text-anchor="middle" dominant-baseline="middle">${text}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const PLACEHOLDER_COVER = fallbackCover();

/** 视频封面统一走 /media（由 vite 代理到后端 5112） */
export function mediaUrl(path: string | undefined | null): string {
  if (!path) return PLACEHOLDER_COVER;
  return path;
}

export function formatCount(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1).replace(/\.0$/, '')}亿`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(1).replace(/\.0$/, '')}万`;
  return String(n ?? 0);
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (v: number) => String(v).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

/** 昵称首字（无头像时生成彩色字母头像） */
export function nameInitial(name: string): string {
  return (name || '?').trim().charAt(0).toUpperCase();
}

const AVATAR_COLORS = ['#FB7299', '#00AEEC', '#FF9F0A', '#7C4DFF', '#00C48C', '#FF6B6B', '#4A90E2'];

export function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < (name?.length ?? 0); i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function debounce<T extends (...args: never[]) => void>(fn: T, wait = 200) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/** 高亮搜索关键词 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
