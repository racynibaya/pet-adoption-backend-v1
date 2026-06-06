import { Router } from 'express';

import {
  checkVerifiedUser,
  verifyTokenMiddleware,
} from '@models/auth/auth-middleware';

import userController from './user-controller';

const router = Router();

router
  .route('/me')
  .get(verifyTokenMiddleware, checkVerifiedUser, (req, res, next) =>
    userController.me(req, res, next),
  );

export default router;
