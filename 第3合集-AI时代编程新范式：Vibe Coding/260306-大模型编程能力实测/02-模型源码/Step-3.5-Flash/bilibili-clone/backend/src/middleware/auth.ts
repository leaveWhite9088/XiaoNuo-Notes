import { Request, Response, NextFunction } from 'express';
import { SessionUser } from '../types';

export interface AuthRequest extends Request {
  user?: SessionUser;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.session?.user as SessionUser | undefined;

  if (!user || !user.isLogin) {
    return res.status(401).json({
      code: 401,
      message: '请先登录',
      data: null
    });
  }

  req.user = user;
  next();
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.session?.user as SessionUser | undefined;
  req.user = user;
  next();
};