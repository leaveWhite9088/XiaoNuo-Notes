import config from '../config/index.js';
import { createLogger } from './logger.js';

const log = createLogger('upstream');

/**
 * 统一的上游 HTTP 客户端：超时、UA/Referer 伪装、JSON 解析、错误包装。
 * 只被 Service / Script 调用，Repository 不直接触网。
 */
export async function fetchJSON(url, { timeout = config.upstream.timeout, headers = {} } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': config.upstream.userAgent,
        Referer: config.upstream.referer,
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        ...headers,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchText(url, { timeout = config.upstream.timeout, headers = {} } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': config.upstream.userAgent,
        Referer: config.upstream.referer,
        'Accept-Language': 'zh-CN,zh;q=0.9',
        ...headers,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 带重试的 JSON 请求，seed 阶段对上游限流更宽容。
 */
export async function fetchJSONWithRetry(url, options = {}, retries = 3) {
  let lastError;
  for (let i = 0; i < retries; i += 1) {
    try {
      return await fetchJSON(url, options);
    } catch (err) {
      lastError = err;
      log.warn(`请求失败(${i + 1}/${retries}): ${url} · ${err.message}`);
      await sleep(600 * (i + 1));
    }
  }
  throw lastError;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default { fetchJSON, fetchText, fetchJSONWithRetry, sleep };
