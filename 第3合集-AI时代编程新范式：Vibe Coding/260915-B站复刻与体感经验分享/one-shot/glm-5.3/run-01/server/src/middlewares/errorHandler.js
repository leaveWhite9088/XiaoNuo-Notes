export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  console.error('[api] error:', err.message);
  res.status(status).json({ code: status, message: err.message || '服务内部错误', data: null });
}
