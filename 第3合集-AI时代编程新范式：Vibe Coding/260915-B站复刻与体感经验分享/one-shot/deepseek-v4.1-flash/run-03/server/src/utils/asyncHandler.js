/**
 * 包装 async 控制器，把 reject 交给 Express 错误中间件。
 */
export function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default asyncHandler;
