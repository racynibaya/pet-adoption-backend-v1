import { Router } from 'express';

import {
  authorizeRole,
  checkVerifiedUser,
  verifyTokenMiddleware,
} from '@models/auth/auth-middleware';

import shelterController from './shelter-controller';

const router = Router();

router.get('/', (req, res, next) =>
  shelterController.getShelters(req, res, next),
);

router.post(
  '/',
  verifyTokenMiddleware,
  checkVerifiedUser,
  authorizeRole('ADMIN'),
  (req, res, next) => shelterController.create(req, res, next),
);

router
  .route('/:id')
  .delete(
    verifyTokenMiddleware,
    checkVerifiedUser,
    authorizeRole('ADMIN'),
    (req, res, next) => shelterController.delete(req, res, next),
  )
  .patch(
    verifyTokenMiddleware,
    checkVerifiedUser,
    authorizeRole('ADMIN', 'STAFF'),
    (req, res, next) => shelterController.update(req, res, next),
  );

export default router;
