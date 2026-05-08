import { Request, Response, NextFunction } from 'express';

import prisma from '@config/prisma';
import { ForbiddenError, UnauthorizedError } from '@utils/error';

import { Role } from '../../../generated/prisma/client';
import authService from './auth-service';
import { SanitizedUser } from './auth-types';

export const verifyTokenMiddleware = async function (
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

export const authorizeRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('User is not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        'You do not have permission to access this resource',
      );
    }

    next();
  };
};
