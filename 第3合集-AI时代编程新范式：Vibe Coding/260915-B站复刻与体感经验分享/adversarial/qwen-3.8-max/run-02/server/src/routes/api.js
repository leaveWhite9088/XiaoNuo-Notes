// 路由/控制器层：只做参数解析与响应封装，业务查询交给 data-store（数据层）
import { Router } from 'express';
import * as store from '../data-store.js';

export const apiRouter = Router();

// 首页频道（分类筛选）列表
apiRouter.get('/channels', (_req, res) => {
  res.json({ code: 0, data: store.getChannels() });
});

// 视频流：支持频道筛选 + 关键词搜索 + 分页
apiRouter.get('/videos', (req, res) => {
  const { channel = '', keyword = '', page = 1, pageSize = 20 } = req.query;
  const data = store.listVideos({
    channel: String(channel),
    keyword: String(keyword),
    page: Number(page),
    pageSize: Number(pageSize),
  });
  res.json({ code: 0, data });
});

// 搜索建议（下拉联想）
apiRouter.get('/search/suggest', (req, res) => {
  const { keyword = '' } = req.query;
  res.json({ code: 0, data: store.suggest(String(keyword), 8) });
});

// 热搜词（搜索框聚焦且无输入时展示）
apiRouter.get('/hot-searches', (_req, res) => {
  res.json({ code: 0, data: store.getHotSearches(8) });
});

// 视频详情 + 播放地址 + 相关推荐
apiRouter.get('/videos/:id', (req, res) => {
  const video = store.getVideo(req.params.id);
  if (!video) return res.status(404).json({ code: 404, message: '视频不存在' });
  res.json({ code: 0, data: { video, related: store.getRelated(video.id, 12) } });
});
