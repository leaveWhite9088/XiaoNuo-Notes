import { HttpError } from '../utils/HttpError.js';
/** 包装 async 控制器，把 rejected promise 交给错误中间件 */
export const asyncHandler = (fn) => (req, res, next) => {
    void fn(req, res, next).catch(next);
};
/** 统一响应体：{ code, message, data } */
export function ok(res, data, message = 'OK') {
    res.json({ code: 0, message, data });
}
export function errorHandler(err, _req, res, _next) {
    const status = err instanceof HttpError ? err.status : 500;
    const message = err instanceof Error ? err.message : '服务器内部错误';
    if (status >= 500)
        console.error('[error]', err);
    res.status(status).json({
        code: status,
        message,
        data: null,
    });
}
export function notFoundHandler(req, res) {
    res.status(404).json({ code: 404, message: `接口不存在: ${req.method} ${req.path}`, data: null });
}
/** 解析分页参数 */
export function parsePaging(query, defaultSize = 24, maxSize = 48) {
    const page = Math.max(1, Number(query.page ?? 1) || 1);
    const pageSize = Math.min(maxSize, Math.max(1, Number(query.pageSize ?? defaultSize) || defaultSize));
    return { page, pageSize };
}
//# sourceMappingURL=index.js.map