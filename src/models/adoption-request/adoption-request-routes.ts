import { Router } from 'express';
import adoptionRequestController from './adoption-request-controller';
import {
  checkVerifiedUser,
  verifyTokenMiddleware,
} from '@models/auth/auth-middleware';

const router = Router();

router.post('/', verifyTokenMiddleware, checkVerifiedUser, (req, res, next) =>
  adoptionRequestController.adoption(req, res, next),
);

export default router;
