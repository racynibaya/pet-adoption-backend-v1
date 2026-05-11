import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import { BadRequestError } from '@utils/error';

import petService from './pet-service';
import { petPaginationSchema } from './pet-types';

class PetController {
  async petsHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = petPaginationSchema.parse(req.query);

      const { pets, pagination } = await petService.getAllPets(page, limit);

      res.status(200).json({
        success: true,
        message: 'Hello from pet controller',
        data: pets,
        pagination,
      });
    } catch (error) {
      if (error instanceof ZodError)
        return next(new BadRequestError('Invalid Query Params'));

      next(error);
    }
  }

  petByIDHandler(req: Request, res: Response, next: NextFunction) {}
}

export default new PetController();
