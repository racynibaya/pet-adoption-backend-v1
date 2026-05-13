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
  .get(petController.petsHandler)
  .post(
    verifyTokenMiddleware,
    checkVerifiedUser,
    authorizeRole(Role.STAFF, Role.ADMIN),
    uploadPetImages,
    petController.createPetHandler,
  );

router
  .route('/:id')
  .get(petController.petByIDHandler)
  .patch(() => {})
  .delete(() => {});

router.post('/:id/images', () => {});

export default router;
