import { Router, Request, Response } from 'express';
import { bilibiliApi } from '../services/bilibili-api';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ code: -1, message: '用户名和密码不能为空', data: null });
  }

  const result = await bilibiliApi.login(username, password);

  if (result.code === 0) {
    req.session!.user = {
      mid: 0,
      uname: '',
      face: '',
      cookie: result.cookie,
      csrf: result.csrf,
      isLogin: true
    };
    bilibiliApi.setAuth(result.cookie, result.csrf);

    return res.json({ code: 0, message: '登录成功', data: { user: req.session!.user } });
  } else {
    return res.json({ code: result.code, message: result.message, data: null });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  try {
    bilibiliApi.clearAuth();
    req.session!.destroy((err) => {
      if (err) {
        return res.status(500).json({
          code: -1,
          message: '登出失败',
          data: null
        });
      }
      res.json({
        code: 0,
        message: '登出成功',
        data: null
      });
    });
  } catch (error: any) {
    res.status(500).json({
      code: -1,
      message: error.message || '登出失败',
      data: null
    });
  }
});

router.get('/status', (req: Request, res: Response) => {
  const user = req.session?.user;
  if (user && user.isLogin) {
    res.json({
      code: 0,
      message: '已登录',
      data: { user }
    });
  } else {
    res.json({
      code: -1,
      message: '未登录',
      data: null
    });
  }
});

export default router;