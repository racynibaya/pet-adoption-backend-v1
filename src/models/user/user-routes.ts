import { Request, Response, NextFunction, Router } from 'express';

import {
  checkVerifiedUser,
  verifyTokenMiddleware,
} from '@models/auth/auth-middleware';

import prisma from '@config/prisma';
import userController from './user-controller';

const router = Router();

router
  .route('/me')
  .get(verifyTokenMiddleware, checkVerifiedUser, userController.me);

export default router;
