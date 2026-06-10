import { Request, Response, NextFunction } from 'express';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { ConflictError, NotFoundError, UnauthorizedError } from '@utils/error';

import shelterService from './shelter-service';
import { ShelterCreateDTO, ShelterPaginationDTO } from './shelter-types';

class ShelterController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError('Unauthorized');

      const data = req.body as ShelterCreateDTO;

      const shelter = await shelterService.createShelter({
        ...data,
        ownerId: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: 'Shelter created successfully',
        data: shelter,
      });

      return;
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const shelterId = req.params.id as unknown as number;
    const user = req.user;

    try {
      const data = req.body as ShelterCreateDTO;

      if (!user) throw new UnauthorizedError('Unauthorized');

      const updatedShelter = await shelterService.updateShelter(
        { id: user.id, role: user.role },
        shelterId,
        data,
      );

      res.status(200).json({
        success: true,
        message: 'Shelter updated successfully',
        data: updatedShelter,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return next(
          new ConflictError('Shelter with this contact email already exists'),
        );
      }

      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const shelterId = req.params.id as unknown as number;

    try {
      const shelter = await shelterService.findShelter(shelterId);

      if (!shelter) throw new NotFoundError('Shelter not found');

      const deletedShelter = await shelterService.deleteShelter(shelterId);

      res.status(200).json({
        success: true,
        message: `Shelter with ID: ${shelterId} deleted successfully`,
        data: deletedShelter,
      });
    } catch (error) {
      next(error);
    }
  }

  async getShelters(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, city, province, region, island } =
        req.query as unknown as ShelterPaginationDTO;

      const { shelters, pagination } = await shelterService.findAllShelters(
        page,
        limit,
        { city, province, region, island },
      );

      res.status(200).json({
        success: true,
        message: 'Shelters retrieved successfully',
        data: shelters,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ShelterController();
