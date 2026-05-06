import { Request, Response, NextFunction } from 'express';

import authService from './auth-service';
import prisma from '@config/prisma';
import { SanitizedUser } from './auth-types';
import { verify } from 'node:crypto';
import { ForbiddenError, UnauthorizedError } from '@utils/error';

export const authMiddleWare = async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.headers.authorization?.split(' ')[1];
  console.log(token);

  try {
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const payload = authService.verifyAccessToken(token);
    const user: SanitizedUser = (await prisma.user.findUnique({
      where: { email: payload.email },
      omit: {
        hashedPassword: true,
        verifyToken: true,
        verifyTokenExpiry: true,
      },
    })) as SanitizedUser;

    if (!user) {
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    next(error); // ✅ pass to global error handler
  }
};

export const checkVerifiedUser = function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new UnauthorizedError('User is not authenticated');

    console.log(req.user?.isVerified);

    if (!req.user?.isVerified)
      throw new ForbiddenError(
        'Please verify your email to access this resouce',
      );

    next();
  } catch (error) {
    next(error);
  }
};

export const checkRole = function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const role = req.user?.role;
};
