import { Request, Response, NextFunction } from 'express';

import prisma from '@config/prisma';

import shelterService from './shelter-service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { BadRequestError, ConflictError, NotFoundError } from '@utils/error';
import { Role } from '../../../generated/prisma/enums';
import { Shelter } from '../../../generated/prisma/client';

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

      if (isNaN(shelterId)) throw new BadRequestError('Invalid shelter ID');

      const shelter = await prisma.shelter.findUnique({
        where: { id: shelterId },
      });

      if (!shelter) throw new NotFoundError('Shelter not found');

      updatedShelter = await prisma.shelter.update({
        where: { id: shelterId },
        data: { name, description, address, contactEmail, phoneNumber },
      });

      res.json({
        message: 'YOURE AN ADMIN OR STAFF AND CAN UPDATE SHELTERS',
        data: updatedShelter,
      });
    } catch (error) {
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
