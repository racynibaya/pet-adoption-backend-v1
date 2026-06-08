import { Router } from 'express';

import {
  authorizeRole,
  checkVerifiedUser,
  verifyTokenMiddleware,
} from '@models/auth/auth-middleware';

import { Role } from '../../../generated/prisma/client';
import petController from './pet-controller';
import { uploadPetImages } from './pet-middleware';
import { validate } from '@middlewares';

import {
  petPaginationSchema,
  createPetBodySchema,
  petIdParamSchema,
} from './pet-types';

const router = Router();

router
  .route('/')
  .get(validate(petPaginationSchema, 'query'), (req, res, next) =>
    petController.petsHandler(req, res, next),
  )
  .post(
    verifyTokenMiddleware,
    checkVerifiedUser,
    authorizeRole(Role.STAFF, Role.ADMIN),
    uploadPetImages,
    validate(createPetBodySchema, 'body'),
    (req, res, next) => petController.createPetHandler(req, res, next),
  );

router
  .route('/:id')
  .get(validate(petIdParamSchema, 'params'), (req, res, next) =>
    petController.petByIDHandler(req, res, next),
  )
  .patch(() => {})
  .delete(() => {});

router.post('/:id/images', () => {});

export default router;
