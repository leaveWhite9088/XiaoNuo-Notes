import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/httpError.js';

/** 统一响应包装：{ code, message, data }，与 B 站开放接口的外形保持一致 */
export function ok<T>(res: Response, data: T) {
  res.json({ code: 0, message: 'OK', data });
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ code: 404, message: '接口不存在', data: null });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // express.static / body-parser 等抛出的错误自带 status/statusCode，按其状态码返回
  const carried = (err as { status?: unknown; statusCode?: unknown }) ?? {};
  const rawStatus = err instanceof HttpError ? err.status : (carried.status ?? carried.statusCode);
  const status = typeof rawStatus === 'number' && rawStatus >= 400 && rawStatus < 600 ? rawStatus : 500;
  const message =
    status >= 500 ? '服务器内部错误' : err instanceof Error ? err.message : `请求失败 (${status})`;
  if (status >= 500) console.error('[api error]', err);
  res.status(status).json({ code: status, message, data: null });
}
