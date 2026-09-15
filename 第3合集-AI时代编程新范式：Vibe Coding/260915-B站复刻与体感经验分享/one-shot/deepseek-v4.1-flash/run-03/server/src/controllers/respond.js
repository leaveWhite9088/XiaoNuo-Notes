/**
 * 统一响应体：{ code, message, data }
 * code = 0 表示成功，与 B站接口习惯保持一致。
 */
export function ok(res, data, message = 'ok') {
  res.json({ code: 0, message, data });
}

export default { ok };
