import fs from 'node:fs/promises';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import { BadRequestError, NotFoundError, UnauthorizedError } from '@utils/error';

import petService from './pet-service';
import {
  createPetBodySchema,
  petIdParamSchema,
  petPaginationSchema,
} from './pet-types';

class PetController {
  async petsHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, species, size, gender } = petPaginationSchema.parse(
        req.query,
      );

      const { pets, pagination } = await petService.getAllPets(page, limit, {
        species,
        size,
        gender,
      });

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

  async petByIDHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = petIdParamSchema.parse(req.params);

      const pet = await petService.getPetById(id);

      if (!pet) throw new NotFoundError('Pet not found');

      res.status(200).json({
        success: true,
        message: 'Pet retrieved',
        data: pet,
      });
    } catch (error) {
      if (error instanceof ZodError)
        return next(new BadRequestError('Invalid pet id'));

      next(error);
    }
  }

  async createPetHandler(req: Request, res: Response, next: NextFunction) {
    const files = (req.files as Express.Multer.File[]) ?? [];

    try {
      if (!req.user) throw new UnauthorizedError('User is not authenticated');

      const dto = createPetBodySchema.parse(req.body);

      const pet = await petService.createPet(dto, files, {
        id: req.user.id,
        role: req.user.role,
      });

      res.status(201).json({
        success: true,
        message: 'Pet created',
        data: pet,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new BadRequestError('Invalid request body'));
      }
      next(error);
    }
  }
}

export default new PetController();
