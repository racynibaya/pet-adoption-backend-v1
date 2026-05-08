import { Router } from 'express';

import {
  authorizeRole,
  checkVerifiedUser,
  verifyTokenMiddleware,
} from '@models/auth/auth-middleware';

import shelterController from './shelter-controller';

const router = Router();

router.get('/', shelterController.getShelters);

router.post(
  '/',
  verifyTokenMiddleware,
  checkVerifiedUser,
  authorizeRole('ADMIN'),
  shelterController.create,
);

router
  .route('/:id')
  .delete(
    verifyTokenMiddleware,
    checkVerifiedUser,
    authorizeRole('ADMIN'),
    shelterController.delete,
  )
  .patch(
    verifyTokenMiddleware,
    checkVerifiedUser,
    authorizeRole('ADMIN', 'STAFF'),
    shelterController.update,
  );

export default router;
