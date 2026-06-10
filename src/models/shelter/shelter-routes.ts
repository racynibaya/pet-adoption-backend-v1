import { Router } from 'express';

import {
  authorizeRole,
  checkVerifiedUser,
  verifyTokenMiddleware,
} from '@models/auth/auth-middleware';

import shelterController from './shelter-controller';
import { validate } from '@middlewares';
import { Role } from '../../../generated/prisma/client';
import {
  shelterIdParamSchema,
  shelterPaginationSchema,
  shelterSchema,
} from './shelter-types';

const router = Router();

router.get('/', validate(shelterPaginationSchema, 'query'), (req, res, next) =>
  shelterController.getShelters(req, res, next),
);

router.post(
  '/',
  verifyTokenMiddleware,
  checkVerifiedUser,
  authorizeRole(Role.ADMIN),
  validate(shelterSchema, 'body'),
  (req, res, next) => shelterController.create(req, res, next),
);

router
  .route('/:id')
  .delete(
    verifyTokenMiddleware,
    checkVerifiedUser,
    authorizeRole(Role.ADMIN),
    validate(shelterIdParamSchema, 'params'),
    (req, res, next) => shelterController.delete(req, res, next),
  )
  .patch(
    verifyTokenMiddleware,
    checkVerifiedUser,
    authorizeRole(Role.ADMIN, Role.STAFF),
    validate(shelterIdParamSchema, 'params'),
    validate(shelterSchema, 'body'),
    (req, res, next) => shelterController.update(req, res, next),
  );

export default router;
