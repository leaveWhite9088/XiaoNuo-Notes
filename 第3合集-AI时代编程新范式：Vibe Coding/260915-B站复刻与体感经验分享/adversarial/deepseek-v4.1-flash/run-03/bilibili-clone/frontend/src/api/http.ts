/**
 * HTTP 基础设施：统一 baseURL、错误处理与响应解包。
 * 开发环境由 vite proxy 把 /api、/media 转发到后端 5112。
 */
export const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  });
  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await res.json()) as ApiEnvelope<T>;
  } catch {
    payload = null;
  }
  if (!res.ok || !payload || payload.code !== 0) {
    throw new ApiError(res.status, payload?.message ?? `请求失败 (${res.status})`);
  }
  return payload.data;
}

export const http = {
  get: <T>(path: string, params?: Record<string, unknown>) => {
    const qs = params
      ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== null && v !== '')
            .map(([k, v]) => [k, String(v)]),
        ).toString()}`
      : '';
    return request<T>(`${path}${qs}`);
  },
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
