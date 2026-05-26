import fs from 'node:fs/promises';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import { BadRequestError, UnauthorizedError } from '@utils/error';

import petService from './pet-service';
import { createPetBodySchema, petPaginationSchema } from './pet-types';

class PetController {
  async petsHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, species, size, gender } = petPaginationSchema.parse(
        req.query,
      );

      console.log(species, size, gender);

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

  petByIDHandler(req: Request, res: Response, next: NextFunction) {}

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
      await Promise.all(
        files.map((f) => fs.unlink(f.path).catch(() => undefined)),
      );

      if (error instanceof ZodError) {
        return next(new BadRequestError('Invalid request body'));
      }
      next(error);
    }
  }
}

export default new PetController();
