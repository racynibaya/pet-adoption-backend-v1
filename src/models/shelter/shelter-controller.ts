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
import { shelterPaginationSchema } from './shelter-types';

class ShelterController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: `You're unauthorized to create shelter`,
        });
      }

      const shelter = await shelterService.createShelter({
        ...req.body,
        ownerId: req.user?.id,
      });

      res.status(201).json({
        success: true,
        message: 'Shelter created successfully',
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
          message: `Shelter updated successfully`,
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
          message: 'Shelter updated successfully',
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
        message: `Shelter with ID: ${shelterId} deleted successfully`,
        data: deletedShelter,
      });
    } catch (error) {
      next(error);
    }
  }

  async getShelters(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = shelterPaginationSchema.parse(req.query);
      const { shelters, pagination } = await shelterService.findAllShelters(
        page,
        limit,
      );

      res.status(200).json({
        success: true,
        message: 'Hello from pet controller',
        data: shelters,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ShelterController();
