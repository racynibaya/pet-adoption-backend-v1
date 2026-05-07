import { Request, Response, NextFunction } from 'express';

import prisma from '@config/prisma';

import shelterService from './shelter-service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '@utils/error';
import { Role } from '../../../generated/prisma/enums';
import { Shelter } from '../../../generated/prisma/client';
import { success } from 'zod';

class ShelterController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, address, contactEmail, phoneNumber, ownerId } =
        shelterService.validateShelterData(req.body);

      const shelter = await prisma.shelter.create({
        data: {
          name,
          description,
          address,
          contactEmail,
          phoneNumber,
          ownerId,
        },
      });

      res.json({
        message: 'YOURE AN ADMIN AND CAN ADD NEW SHELTERS',
        data: shelter,
      });
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

  // validate body (Zod)
  //   ↓
  // check shelter exists
  //   ↓
  // check ownership (ownerId === req.user.id)
  //   ↓
  // update shelter
  //   ↓
  // handle DB errors
  //   ↓
  // return updated shelter

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const shelterId = Number(req.params.id);
      let updatedShelter: Shelter | null = null;

      const data = shelterService.validateShelterData(req.body);

      const { name, description, address, contactEmail, phoneNumber } = data;
      const user = req.user;

      if (isNaN(shelterId)) throw new BadRequestError('Invalid shelter ID');

      if (!user) throw new BadRequestError('User not found in request');

      if (user.role === Role.ADMIN) {
        updatedShelter = await prisma.shelter.update({
          where: { id: shelterId },
          data: { name, description, address, contactEmail, phoneNumber },
        });

        res.status(200).json({
          success: true,
          message: 'YOURE AN ADMIN AND CAN UPDATE SHELTERS',
          data: updatedShelter,
        });
        return;
      }

      const shelterStaff = await prisma.shelterStaff.findFirst({
        where: { userId: user.id, shelterId },
      });

      if (!shelterStaff) {
        throw new UnauthorizedError(
          'You are not a staff member of any shelter',
        );
      }

      // using user id and shelter staff id

      if (user.role === Role.STAFF && shelterStaff) {
        updatedShelter = await prisma.shelter.update({
          where: { id: shelterId },
          data: { name, description, address, contactEmail, phoneNumber },
        });

        res.json({
          success: true,
          message: 'YOURE A STAFF AND CAN UPDATE YOUR OWN SHELTER',
          data: updatedShelter,
        });
        return;
      }

      res.status(403).json({
        success: false,
        message: 'You do not have permission to update this shelter',
      });
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

  async delete(req: Request, res: Response, next: NextFunction) {
    const shelterId = Number(req.params.id);

    try {
      if (isNaN(shelterId)) {
        throw new BadRequestError('Invalid shelter ID');
      }

      const shelter = await prisma.shelter.findUnique({
        where: { id: shelterId },
      });

      if (!shelter) throw new NotFoundError('Shelter not found');

      const deletedShelter = await prisma.shelter.delete({
        where: { id: shelterId },
      });

      res.json({
        message: `SHELTER WITH ID ${shelterId} DELETED`,
        data: deletedShelter,
      });
    } catch (error) {
      next(error);
    }
  }

  async getShelters(req: Request, res: Response) {
    const shelters = await prisma.shelter.findMany();
    res.json({
      message: 'Message from shelter route',
      data: shelters,
    });
  }
}

export default new ShelterController();
