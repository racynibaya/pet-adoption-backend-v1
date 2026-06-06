import { Router } from 'express';

import {
  authorizeRole,
  checkVerifiedUser,
  verifyTokenMiddleware,
} from '@models/auth/auth-middleware';

import { Role } from '../../../generated/prisma/client';
import petController from './pet-controller';
import { uploadPetImages } from './pet-middleware';

const router = Router();

router
  .route('/')
  .get((req, res, next) => petController.petsHandler(req, res, next))
  .post(
    verifyTokenMiddleware,
    checkVerifiedUser,
    authorizeRole(Role.STAFF, Role.ADMIN),
    uploadPetImages,
    (req, res, next) => petController.createPetHandler(req, res, next),
  );

router
  .route('/:id')
  .get((req, res, next) => petController.petByIDHandler(req, res, next))
  .patch(() => {})
  .delete(() => {});

router.post('/:id/images', () => {});

export default router;
