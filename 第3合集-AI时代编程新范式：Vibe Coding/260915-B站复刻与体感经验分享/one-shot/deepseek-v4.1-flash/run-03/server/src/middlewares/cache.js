/**
 * 简单内存缓存中间件：对读多写少的聚合接口生效。
 */
export function memoryCache(ttlMs = 30_000) {
  const store = new Map();
  return function cacheMiddleware(req, res, next) {
    if (req.method !== 'GET') return next();
    const key = req.originalUrl;
    const hit = store.get(key);
    if (hit && hit.expireAt > Date.now()) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(hit.body);
    }
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode === 200) store.set(key, { body, expireAt: Date.now() + ttlMs });
      return originalJson(body);
    };
    res.setHeader('X-Cache', 'MISS');
    return next();
  };
}

export default memoryCache;
