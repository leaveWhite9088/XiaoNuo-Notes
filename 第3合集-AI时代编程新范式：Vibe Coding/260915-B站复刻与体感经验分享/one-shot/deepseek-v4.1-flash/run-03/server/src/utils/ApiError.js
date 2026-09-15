/**
 * 业务异常：controllers 抛出后由 errorHandler 统一转成 { code, message } 响应。
 */
export class ApiError extends Error {
  constructor(status, message, code = status * 100) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }

  static badRequest(message = '请求参数有误') {
    return new ApiError(400, message);
  }

  static notFound(message = '资源不存在') {
    return new ApiError(404, message);
  }

  static upstream(message = '上游服务不可用') {
    return new ApiError(502, message);
  }

  static internal(message = '服务器内部错误') {
    return new ApiError(500, message);
  }
}

export default ApiError;
