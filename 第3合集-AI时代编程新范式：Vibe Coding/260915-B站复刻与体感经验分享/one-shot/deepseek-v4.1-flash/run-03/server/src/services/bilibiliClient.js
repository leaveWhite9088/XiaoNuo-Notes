import { fetchJSON, fetchText } from '../utils/http.js';
import config from '../config/index.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('bilibili');

/**
 * 上游客户端：对 B站公开接口的薄封装。
 * 只有 Service / Seed 脚本使用；屏蔽接口路径与字段差异。
 */

const { baseUrl, homeUrl, referer, userAgent } = config.upstream;

/** 视频详情（含 cid，用于播放） */
export async function view(bvid) {
  const res = await fetchJSON(`${baseUrl}/x/web-interface/view?bvid=${bvid}`);
  if (res.code !== 0) throw new Error(`view 接口返回 ${res.code}: ${res.message}`);
  return res.data;
}

/** 取播放地址；qn 见 config.play.qualityOptions */
export async function playurl({ bvid, cid, qn = config.play.defaultQuality }) {
  const url =
    `${baseUrl}/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=${qn}` +
    `&fnval=1&fnver=0&fourk=1&platform=html5&high_quality=1`;
  const res = await fetchJSON(url);
  if (res.code !== 0) throw new Error(`playurl 接口返回 ${res.code}: ${res.message}`);
  return res.data;
}

/** 首页 SSR HTML（seed 阶段抓取轮播与首屏卡片） */
export async function homeHTML() {
  return fetchText(homeUrl);
}

/** 全站热门 */
export async function popular({ ps = 50, pn = 1 } = {}) {
  const res = await fetchJSON(`${baseUrl}/x/web-interface/popular?ps=${ps}&pn=${pn}`);
  if (res.code !== 0) throw new Error(`popular 接口返回 ${res.code}`);
  return res.data.list || [];
}

/** 分区排行榜 */
export async function ranking(rid, type = 'all') {
  const res = await fetchJSON(`${baseUrl}/x/web-interface/ranking/v2?rid=${rid}&type=${type}`);
  if (res.code !== 0) throw new Error(`ranking 接口返回 ${res.code}`);
  return res.data.list || [];
}

/** 评论 */
export async function replies({ aid, pn = 1, ps = 20, sort = 2 }) {
  const res = await fetchJSON(
    `${baseUrl}/x/v2/reply?type=1&oid=${aid}&pn=${pn}&ps=${ps}&sort=${sort}`,
  );
  if (res.code !== 0) return { replies: [], count: 0 };
  return {
    replies: res.data?.replies || [],
    count: res.data?.page?.count || 0,
  };
}

/** 通用二进制流拉取（播放代理使用，需带 Referer 才能过防盗链） */
export async function openStream(url, { range } = {}) {
  const headers = {
    'User-Agent': userAgent,
    Referer: referer,
    Origin: 'https://www.bilibili.com',
    Accept: '*/*',
  };
  if (range) headers.Range = range;

  const res = await fetch(url, { headers, redirect: 'follow' });
  if (!res.ok && res.status !== 206) {
    log.warn(`拉流失败 ${res.status}: ${url.slice(0, 80)}...`);
  }
  return res;
}

export default { view, playurl, homeHTML, popular, ranking, replies, openStream };
