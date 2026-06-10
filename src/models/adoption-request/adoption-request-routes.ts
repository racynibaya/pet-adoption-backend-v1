import { Router } from 'express';
import adoptionRequestController from './adoption-request-controller';
import {
  checkVerifiedUser,
  verifyTokenMiddleware,
} from '@models/auth/auth-middleware';
import { validate } from '@middlewares';
import { adoptionRequestSchema } from './adoption-request-types';

const router = Router();

router.post(
  '/',
  verifyTokenMiddleware,
  checkVerifiedUser,
  validate(adoptionRequestSchema, 'body'),
  (req, res, next) => adoptionRequestController.adoption(req, res, next),
);

export default router;
