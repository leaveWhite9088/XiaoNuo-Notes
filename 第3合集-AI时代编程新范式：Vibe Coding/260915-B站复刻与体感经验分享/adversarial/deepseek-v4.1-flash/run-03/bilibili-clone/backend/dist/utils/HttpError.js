/** 带 HTTP 状态码的业务异常，交由统一错误中间件处理 */
export class HttpError extends Error {
    status;
    code;
    constructor(status, message, code = 'ERROR') {
        super(message);
        this.status = status;
        this.code = code;
        this.name = 'HttpError';
    }
}
export const notFound = (message = '资源不存在') => new HttpError(404, message, 'NOT_FOUND');
export const badRequest = (message = '请求参数不合法') => new HttpError(400, message, 'BAD_REQUEST');
//# sourceMappingURL=HttpError.js.map