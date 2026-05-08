import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import prisma from '@config/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '@utils/error';

import shelterService from './shelter-service';
import { Role } from '../../../generated/prisma/enums';
import { Shelter } from '../../../generated/prisma/client';

class ShelterController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const shelter = await shelterService.createShelter(req.body);

      res.json({
        message: 'YOURE AN ADMIN AND CAN ADD NEW SHELTERS',
        data: shelter,
      });
      return;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return next(
          new ConflictError('Shelter with this address already exists'),
        );
      }
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const shelterId = Number(req.params.id);
    let updatedShelter: Shelter | null = null;
    const user = req.user;

    try {
      const data = shelterService.validateShelterData(req.body);

      if (isNaN(shelterId)) throw new BadRequestError('Invalid shelter ID');

      if (!user) throw new BadRequestError('User not found in request');

      if (user.role === Role.ADMIN) {
        updatedShelter = await shelterService.updateShelterData(
          data,
          shelterId,
        );

        res.status(200).json({
          success: true,
          message: 'YOURE AN ADMIN AND CAN UPDATE SHELTERS',
          data: updatedShelter,
        });
        return;
      }

      const shelterStaff = await shelterService.findShelterStaff(
        user.id,
        shelterId,
      );

      if (!shelterStaff) {
        throw new UnauthorizedError(
          'You are not a staff member of any shelter',
        );
      }

      if (user.role === Role.STAFF && shelterStaff) {
        updatedShelter = await shelterService.updateShelterData(
          data,
          shelterId,
        );

        res.json({
          success: true,
          message: 'YOURE A STAFF AND CAN UPDATE YOUR OWN SHELTER',
          data: updatedShelter,
        });
        return;
      }

      throw new ForbiddenError(
        'You do not have permission to update this shelter',
      );
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return next(
          new ConflictError('Shelter with this address already exists'),
        );
      }

      if (error instanceof ZodError) {
        return next(new BadRequestError('Invalid shelter data'));
      }

      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const shelterId = Number(req.params.id);

    try {
      if (isNaN(shelterId)) {
        throw new BadRequestError('Invalid shelter ID');
      }

      const shelter = await shelterService.findShelter(shelterId);

      if (!shelter) throw new NotFoundError('Shelter not found');

      const deletedShelter = await shelterService.deleteShelter(shelterId);

      res.status(200).json({
        message: `SHELTER WITH ID ${shelterId} DELETED`,
        data: deletedShelter,
      });
    } catch (error) {
      next(error);
    }
  }

  async getShelters(req: Request, res: Response, next: NextFunction) {
    try {
      const shelters = await prisma.shelter.findMany();
      res.json({
        message: 'Message from shelter route',
        data: shelters,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ShelterController();
