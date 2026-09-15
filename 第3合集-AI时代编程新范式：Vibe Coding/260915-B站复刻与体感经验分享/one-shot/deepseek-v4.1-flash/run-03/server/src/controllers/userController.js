import userService from '../services/userService.js';
import { ok } from './respond.js';
import asyncHandler from '../utils/asyncHandler.js';

/** 用户控制器 */

export const me = asyncHandler(async (req, res) => {
  ok(res, userService.getCurrentUser());
});

export const topUsers = asyncHandler(async (req, res) => {
  ok(res, userService.getTopUsers(Number(req.query.limit) || 12));
});

export const getUser = asyncHandler(async (req, res) => {
  ok(res, userService.getUserByMid(req.params.mid));
});

export const toggleFavorite = asyncHandler(async (req, res) => {
  ok(res, userService.toggleFavorite(req.params.bvid));
});

export default { me, topUsers, getUser, toggleFavorite };
