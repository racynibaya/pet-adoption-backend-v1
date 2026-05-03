import { Request, Response, NextFunction } from 'express';

import authService from './auth-service';

export const authMiddleWare = function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.headers.authorization?.split(' ')[1];
  console.log(token);

  try {
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No token provided',
      });
      return;
    }

    const payload = authService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error); // ✅ pass to global error handler
  }
};
