/** 统一错误 / 404 处理，保持 { code, message } 的返回结构。 */

export function notFoundHandler(req, res) {
  res.status(404).json({ code: 404, message: `接口不存在: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status ?? 500;
  if (status >= 500) console.error('[server error]', err);
  res.status(status).json({ code: status, message: err.message ?? '服务器内部错误' });
}
