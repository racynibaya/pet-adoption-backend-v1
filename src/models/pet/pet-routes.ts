import { Router, Request } from 'express';
import petController from './pet-controller';

const router = Router();

// whatever staff can do, admin can
// GET/pets (public) + filters
// POST/pets (staff only)

// GET/pets/:id (public)
// PATCH/pets/:id (staff only)
// DEL/pets/:id delete (staff)

// POST/pets/:id/images (staff only)

router
  .route('/')
  .get(petController.petsHandler)
  .post(() => {});

router
  .route('/:id')
  .get(petController.petByIDHandler)
  .patch(() => {})
  .delete(() => {});

router.post('/:id/images', () => {});

export default router;
