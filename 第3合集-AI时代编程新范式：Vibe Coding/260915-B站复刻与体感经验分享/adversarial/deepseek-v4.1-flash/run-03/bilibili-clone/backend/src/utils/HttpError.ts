/** 带 HTTP 状态码的业务异常，交由统一错误中间件处理 */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = 'ERROR',
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const notFound = (message = '资源不存在') => new HttpError(404, message, 'NOT_FOUND');
export const badRequest = (message = '请求参数不合法') => new HttpError(400, message, 'BAD_REQUEST');
