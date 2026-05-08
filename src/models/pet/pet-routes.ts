import { Router } from 'express';

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
  .get(() => {})
  .post(() => {});

router
  .route('/:id')
  .get(() => {})
  .patch(() => {})
  .delete(() => {});

router.post('/:id/images', () => {});

export default router;
