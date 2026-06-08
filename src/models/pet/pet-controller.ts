import { Request, Response, NextFunction } from 'express';

import { NotFoundError, UnauthorizedError } from '@utils/error';

import petService from './pet-service';
import { CreatePetDTO, PetQueryParams } from './pet-types';
import logger from '@config/logger';

class PetController {
  async petsHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, species, size, gender } =
        req.query as unknown as PetQueryParams;

      logger.debug(req.query, 'Received query params');

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
      next(error);
    }
  }

  async petByIDHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as unknown as { id: number };

      const pet = await petService.getPetById(id);

      if (!pet) throw new NotFoundError('Pet not found');

      res.status(200).json({
        success: true,
        message: 'Pet retrieved',
        data: pet,
      });
    } catch (error) {
      next(error);
    }
  }

  async createPetHandler(req: Request, res: Response, next: NextFunction) {
    const files = (req.files as Express.Multer.File[]) ?? [];

    try {
      if (!req.user) throw new UnauthorizedError('User is not authenticated');

      const dto = req.body as CreatePetDTO;

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
      next(error);
    }
  }
}

export default new PetController();
