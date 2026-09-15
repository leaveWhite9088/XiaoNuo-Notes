import ApiError from '../utils/ApiError.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('error');

/** 404 兜底 */
export function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`接口不存在: ${req.method} ${req.originalUrl}`));
}

/** 统一错误响应 */
export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) log.error(err.stack || err.message);
  else log.warn(`${status} ${req.method} ${req.originalUrl} :: ${err.message}`);

  res.status(status).json({
    code: err.code || status * 100,
    message: err.message || '服务器内部错误',
    data: null,
  });
}

export default { notFoundHandler, errorHandler };
