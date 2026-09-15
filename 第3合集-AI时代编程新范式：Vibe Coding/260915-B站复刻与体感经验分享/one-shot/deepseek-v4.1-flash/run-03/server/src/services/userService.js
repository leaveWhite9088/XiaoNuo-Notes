import userRepository from '../repositories/userRepository.js';
import videoRepository from '../repositories/videoRepository.js';
import searchRepository from '../repositories/searchRepository.js';
import { toUserDTO, toVideoList } from './mappers.js';
import ApiError from '../utils/ApiError.js';

/**
 * UP主 / 个人中心服务：登录态（演示用本地账户）、收藏、历史。
 */

/** 演示账户：不做真实鉴权，仅提供固定的“已登录用户”用于还原首页右栏观感 */
const DEMO_USER = {
  mid: 100000001,
  name: '哔哩哔哩用户',
  face: 'https://i0.hdslb.com/bfs/face/member/noface.jpg',
  sign: '这个人很懒，什么都没写~',
  follower: 128,
  following: 56,
  level: 5,
  vip: false,
  coins: 1286,
  bCoins: 328,
};

export function getCurrentUser() {
  return { ...DEMO_USER, favorites: searchRepository.favoriteCount() };
}

export function getTopUsers(limit = 12) {
  return userRepository.findTop(limit).map(toUserDTO);
}

export function getUserByMid(mid) {
  const row = userRepository.findByMid(mid);
  if (!row) throw ApiError.notFound('UP主不存在');
  const videos = videoRepository
    .findFeed({ sort: 'hot', page: 1, pageSize: 60 })
    .filter((v) => v.owner_mid === Number(mid))
    .slice(0, 12);
  return { ...toUserDTO(row), videos: toVideoList(videos) };
}

export function getFavorites() {
  const rows = searchRepository.findHistory(50); // 占位，收藏列表由独立查询支撑
  return rows;
}

export function toggleFavorite(bvid) {
  const exists = searchRepository.isFavorite(bvid);
  if (exists) {
    searchRepository.removeFavorite(bvid);
    return { favorited: false, count: searchRepository.favoriteCount() };
  }
  searchRepository.addFavorite(bvid);
  return { favorited: true, count: searchRepository.favoriteCount() };
}

export default { getCurrentUser, getTopUsers, getUserByMid, getFavorites, toggleFavorite };
