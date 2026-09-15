/** 统一的请求封装：所有请求经 Vite 代理 (3602 -> 5602)，返回后端 { code, message, data } 的 data */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface Envelope<T> {
  code: number;
  message: string;
  data: T;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  let body: Envelope<T> | null = null;
  try {
    body = (await res.json()) as Envelope<T>;
  } catch {
    /* 非 JSON 响应（例如代理异常） */
  }
  if (!res.ok || !body || body.code !== 0) {
    throw new ApiError(res.status, body?.message ?? `请求失败: ${path}`);
  }
  return body.data;
}

export const http = {
  get: <T>(path: string, params?: Record<string, string | number | undefined | null>) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params ?? {})) {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    }
    const query = qs.toString();
    return request<T>(query ? `${path}?${query}` : path);
  },
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
