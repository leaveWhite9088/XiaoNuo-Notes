import { Readable } from 'node:stream';
import config from '../config/index.js';
import bilibiliClient from './bilibiliClient.js';
import videoRepository from '../repositories/videoRepository.js';
import ApiError from '../utils/ApiError.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('play-service');

/**
 * 播放服务：解析真实播放地址（B站 playurl）+ 反防盗链流代理。
 *
 * 设计要点：
 * 1. 前端 <video> 不能直接拉 B站 CDN（需要 Referer，且链接带 deadline 签名）；
 * 2. 因此由后端带 Referer 拉流并以 206 Range 透传给前端，实现真实播放；
 * 3. playurl 结果按 (bvid, qn) 做内存缓存，避免每次播放都请求上游。
 */

const playCache = new Map(); // key: `${bvid}:${qn}` -> { value, expireAt }

function readCache(key) {
  const item = playCache.get(key);
  if (!item) return null;
  if (item.expireAt < Date.now()) {
    playCache.delete(key);
    return null;
  }
  return item.value;
}

function writeCache(key, value) {
  playCache.set(key, { value, expireAt: Date.now() + config.play.cacheTtl });
}

/** 确保数据库里有 cid（没有就回源补全） */
async function ensureCid(bvid) {
  const row = videoRepository.findByBvid(bvid);
  if (!row) throw ApiError.notFound(`视频 ${bvid} 不存在`);
  if (row.cid) return { cid: row.cid, aid: row.aid };

  const upstream = await bilibiliClient.view(bvid);
  videoRepository.updateCid(bvid, upstream.cid, upstream.aid);
  return { cid: upstream.cid, aid: upstream.aid };
}

/** 解析可播放地址 */
export async function resolvePlayInfo(bvid, qn = config.play.defaultQuality) {
  const key = `${bvid}:${qn}`;
  const cached = readCache(key);
  if (cached) return cached;

  const { cid } = await ensureCid(bvid);
  let data;
  try {
    data = await bilibiliClient.playurl({ bvid, cid, qn });
  } catch (err) {
    // 版权内容 / 付费内容没有 playurl，标记后让首页把这类视频排在后面
    videoRepository.updatePlayable(bvid, 0);
    log.warn(`标记为不可播放: ${bvid} · ${err.message}`);
    throw ApiError.upstream(
      '该视频为版权或付费内容，暂不支持站内播放。可以看看右侧的相关推荐 ~',
    );
  }

  const durl = data.durl?.[0];
  if (!durl?.url) {
    videoRepository.updatePlayable(bvid, 0);
    throw ApiError.upstream('未获取到播放地址（视频可能受版权限制）');
  }
  videoRepository.updatePlayable(bvid, 1);

  const info = {
    bvid,
    cid,
    quality: data.quality,
    format: data.format,
    timelength: durl.length,
    size: durl.size,
    // 交给前端的总是后端代理地址，浏览器端无需关心签名与 Referer
    streamUrl: `/api/play/${bvid}/stream?qn=${data.quality}`,
    acceptQuality: (data.accept_quality || []).map((q, i) => ({
      qn: q,
      label: (data.accept_description || [])[i] || `${q}P`,
    })),
    currentQuality: (data.accept_quality || []).indexOf(data.quality),
    qualities: config.play.qualityOptions,
  };

  writeCache(key, info);
  log.info(`解析播放地址 ${bvid} qn=${data.quality} (${Math.round(durl.size / 1024 / 1024)}MB)`);
  return info;
}

/**
 * 拉取真实流并透传。支持 Range，保证 <video> 可拖动进度条。
 */
export async function proxyStream(bvid, qn, req, res) {
  const info = await resolvePlayInfo(bvid, qn);
  const key = `${bvid}:${qn}`;
  const cached = readCache(key);

  // 缓存里同时保存真实上游地址（不外发）
  let upstreamUrl = playCache.get(key)?.upstreamUrl;
  if (!upstreamUrl) {
    const { cid } = await ensureCid(bvid);
    const data = await bilibiliClient.playurl({ bvid, cid, qn });
    upstreamUrl = data.durl?.[0]?.url;
    if (!upstreamUrl) throw ApiError.upstream('播放地址失效');
    playCache.set(key, {
      value: info,
      upstreamUrl,
      expireAt: Date.now() + config.play.cacheTtl,
    });
  }

  const upstream = await bilibiliClient.openStream(upstreamUrl, {
    range: req.headers.range,
  });

  if (!upstream.ok && upstream.status !== 206) {
    throw ApiError.upstream(`上游流返回 ${upstream.status}`);
  }

  res.status(upstream.status === 206 ? 206 : 200);
  res.setHeader('Content-Type', upstream.headers.get('content-type') || 'video/mp4');
  const passthrough = ['content-length', 'content-range', 'accept-ranges', 'etag', 'last-modified'];
  for (const header of passthrough) {
    const value = upstream.headers.get(header);
    if (value) res.setHeader(header, value);
  }
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Accept-Ranges', 'bytes');

  if (!upstream.body) {
    res.end();
    return;
  }

  // 播放器拖动进度条 / 关闭页面都会中断连接，上游 socket 随之报错。
  // 必须显式接管 stream 与 res 的错误，否则未处理的 'error' 事件会打挂整个进程。
  const body = Readable.fromWeb(upstream.body);
  let closed = false;

  const cleanup = () => {
    if (closed) return;
    closed = true;
    body.destroy();
  };

  body.on('error', (err) => {
    log.warn(`拉流中断 ${bvid}: ${err.message}`);
    cleanup();
    if (!res.writableEnded) res.destroy();
  });
  res.on('close', cleanup);
  res.on('error', cleanup);

  body.pipe(res);
}

export function cacheSize() {
  return playCache.size;
}

export default { resolvePlayInfo, proxyStream, cacheSize };
