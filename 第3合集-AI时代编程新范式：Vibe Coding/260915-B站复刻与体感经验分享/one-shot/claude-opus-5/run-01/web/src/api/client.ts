/** 极简 fetch 封装：统一解包 { code, data } 结构并抛出可读错误。 */

interface ApiEnvelope<T> {
  code: number;
  data?: T;
  message?: string;
}

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const payload = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!res.ok || !payload || payload.code !== 0 || payload.data === undefined) {
    throw new Error(payload?.message ?? `请求失败 (${res.status}) ${path}`);
  }
  return payload.data;
}

export function get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== '') query.set(k, String(v));
  });
  const qs = query.toString();
  return request<T>(qs ? `${path}?${qs}` : path);
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) });
}
